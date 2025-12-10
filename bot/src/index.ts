import { Telegraf, Markup } from "telegraf";
import dotenv from "dotenv";
import { init, id as instantId } from "@instantdb/core";
import {
  economicQuestions,
  socialQuestions,
  quadrantLabels,
  quadrantDetails,
  type Language,
  type QuadrantKey,
} from "../../src/data/questions";

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const INSTANT_DB_APP_ID = process.env.INSTANT_DB_APP_ID || "";
const WEBHOOK_URL = process.env.WEBHOOK_URL || ""; // full https://host
const WEBHOOK_PATH = process.env.WEBHOOK_PATH || "/tg-webhook";
const WEBHOOK_PORT = Number(process.env.WEBHOOK_PORT || process.env.PORT || 3000);

if (!BOT_TOKEN) {
  console.error("BOT_TOKEN is required");
  process.exit(1);
}

const db =
  INSTANT_DB_APP_ID &&
  init({
    appId: INSTANT_DB_APP_ID,
  });

type Answers = Record<string, number>;
type Stage = "questions" | "nickname" | "emoji" | "slogan" | "done";

type Session = {
  lang: Language;
  answers: Answers;
  step: number;
  stage: Stage;
  nickname?: string;
  emoji?: string;
  slogan?: string;
};

const sessions = new Map<number, Session>();

const allQuestions = [...socialQuestions, ...economicQuestions];
const emojiChoices =
  "😀 😎 🤖 🐱 🐶 🐼 🦊 🦁 🐸 🦄 🐢 🐍 🦕 🦖 🐧 🦉 🐙 🦋 🐝 🐘 🦒 🐋";

function normalize(value: number) {
  return ((value - 1) / 4) * 100;
}

function averageNormalized(values: number[]) {
  if (!values.length) return 0;
  const norm = values.map((v) => normalize(v));
  return norm.reduce((acc, v) => acc + v, 0) / norm.length;
}

function determineQuadrant(x: number, y: number): QuadrantKey {
  if (y >= 50 && x >= 50) return "topRight";
  if (y >= 50 && x < 50) return "topLeft";
  if (y < 50 && x >= 50) return "bottomRight";
  return "bottomLeft";
}

async function saveResult(input: {
  nickname: string;
  emoji: string;
  x: number;
  y: number;
  language: Language;
  slogan?: string;
}) {
  if (!db) return null;
  await db.auth.signInAsGuest().catch(() => null);
  const recordId = instantId();
  await db.transact([
    db.tx.records[recordId].update({
      nickname: input.nickname,
      emoji: input.emoji,
      x: input.x,
      y: input.y,
      language: input.language,
      createdAt: new Date().toISOString(),
      slogan: input.slogan,
    }),
  ]);
  return recordId;
}

function nextQuestion(ctx: any, s: Session) {
  if (s.step >= allQuestions.length) {
    s.stage = "nickname";
    return ctx.reply(
      s.lang === "ua"
        ? "Введіть нік (можна порожнім — буде Анонімний користувач)"
        : "Enter a nickname (or leave empty for Anonymous)",
      Markup.removeKeyboard()
    );
  }
  const q = allQuestions[s.step];
  return ctx.reply(
    q.text[s.lang],
    Markup.keyboard([["1", "2", "3", "4", "5"]]).oneTime().resize()
  );
}

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  sessions.set(ctx.from.id, {
    lang: "ua",
    answers: {},
    step: 0,
    stage: "questions",
  });
  return ctx.reply(
    "Оберіть мову / Choose language",
    Markup.keyboard([["UA", "EN"]]).oneTime().resize()
  );
});

bot.hears(["UA", "EN"], (ctx) => {
  const sess = sessions.get(ctx.from.id);
  if (!sess) return;
  sess.lang = ctx.message.text === "UA" ? "ua" : "en";
  sess.step = 0;
  sess.stage = "questions";
  return ctx.reply(
    sess.lang === "ua"
      ? "Шкала 1–5: 1 — свобода, 5 — контроль. Почнемо."
      : "Scale 1–5: 1 — freedom, 5 — state control. Let's start.",
    Markup.removeKeyboard()
  ).then(() => nextQuestion(ctx, sess));
});

bot.hears(["1", "2", "3", "4", "5"], (ctx) => {
  const sess = sessions.get(ctx.from.id);
  if (!sess || sess.stage !== "questions") return;
  const value = Number(ctx.message.text);
  if (Number.isNaN(value)) return;
  const q = allQuestions[sess.step];
  sess.answers[q.id] = value;
  sess.step += 1;
  return nextQuestion(ctx, sess);
});

bot.on("text", async (ctx) => {
  const sess = sessions.get(ctx.from.id);
  if (!sess) {
    return ctx.reply("Натисніть /start щоб почати.");
  }

  if (sess.stage === "nickname") {
    const raw = ctx.message.text?.trim() || "";
    const nickname =
      raw.length === 0
        ? sess.lang === "ua"
          ? "Анонімний користувач"
          : "Anonymous"
        : raw.slice(0, 20);
    sess.nickname = nickname;
    sess.stage = "emoji";
    return ctx.reply(
      sess.lang === "ua"
        ? `Обери emoji (можна ввести своє). Приклади: ${emojiChoices}`
        : `Pick an emoji (or type your own). Examples: ${emojiChoices}`
    );
  }

  if (sess.stage === "emoji") {
    const raw = ctx.message.text?.trim() || "";
    const emoji = raw.split(/\s+/)[0] || "😀";
    sess.emoji = emoji;
    sess.stage = "slogan";
    return ctx.reply(
      sess.lang === "ua"
        ? "Моє політичне гасло (до 40 символів, можна пропустити):"
        : "Your political slogan (up to 40 chars, optional):"
    );
  }

  if (sess.stage === "slogan") {
    const raw = ctx.message.text?.trim() || "";
    sess.slogan = raw.slice(0, 40);
    sess.stage = "done";

    const socialValues = socialQuestions.map((q) => sess.answers[q.id]);
    const econValues = economicQuestions.map((q) => sess.answers[q.id]);
    const y = averageNormalized(socialValues);
    const x = averageNormalized(econValues);
    const quadrant = determineQuadrant(x, y);
    const labels = quadrantLabels[sess.lang];
    const detail = quadrantDetails[quadrant];

    const nick =
      sess.nickname ||
      (sess.lang === "ua" ? "Анонімний користувач" : "Anonymous");
    const emoji = sess.emoji || "😀";

    try {
      await saveResult({
        nickname: nick,
        emoji,
        x,
        y,
        language: sess.lang,
        slogan: sess.slogan,
      });
      await ctx.reply(
        sess.lang === "ua"
          ? "Збережено в InstantDB ✅"
          : "Saved to InstantDB ✅"
      );
    } catch (err) {
      console.warn("save error", err);
      await ctx.reply(
        sess.lang === "ua"
          ? "Не вдалось зберегти зараз. Спробуйте пізніше."
          : "Could not save now. Please try later."
      );
    }

    const text =
      sess.lang === "ua"
        ? `Результат:\nНік: ${nick}\nЕмодзі: ${emoji}\nЕкономіка (X): ${x.toFixed(
            1
          )}\nСоціальна сфера (Y): ${y.toFixed(1)}\nКвадрант: ${
            labels[quadrant]
          }\n${detail.description[sess.lang]}`
        : `Result:\nNick: ${nick}\nEmoji: ${emoji}\nEconomy (X): ${x.toFixed(
            1
          )}\nSocial (Y): ${y.toFixed(1)}\nQuadrant: ${labels[quadrant]}\n${
            detail.description[sess.lang]
          }`;

    await ctx.reply(text, Markup.removeKeyboard());
    sessions.delete(ctx.from.id);
    return;
  }

  // default fallback
  if (sess.stage === "questions") {
    return ctx.reply(
      sess.lang === "ua"
        ? "Використовуйте кнопки 1–5, щоб відповісти на питання."
        : "Use buttons 1–5 to answer the questions."
    );
  }
});

bot.catch((err) => {
  console.error("Bot error", err);
});

async function launch() {
  // Use webhook if WEBHOOK_URL is provided, otherwise fallback to polling.
  if (WEBHOOK_URL) {
    const { createServer } = await import("http");
    const webhookEndpoint = new URL(WEBHOOK_PATH, WEBHOOK_URL).pathname;

    await bot.telegram.setWebhook(WEBHOOK_URL + webhookEndpoint);
    console.log(`Webhook set to ${WEBHOOK_URL}${webhookEndpoint}`);

    const server = createServer((req, res) => {
      if (req.url === webhookEndpoint && req.method === "POST") {
        return bot.webhookCallback(webhookEndpoint)(req, res);
      }
      res.statusCode = 404;
      res.end();
    });

    server.listen(WEBHOOK_PORT, () => {
      console.log(`Webhook server listening on port ${WEBHOOK_PORT}`);
    });
  } else {
    await bot.launch();
    console.log("Bot started with long polling");
  }

  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}

launch().catch((err) => {
  console.error("Failed to launch bot", err);
  process.exit(1);
});

