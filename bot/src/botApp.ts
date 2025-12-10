import { Telegraf, Markup } from "telegraf";
import { init, id as instantId } from "@instantdb/admin";
import {
  economicQuestions,
  socialQuestions,
  quadrantLabels,
  quadrantDetails,
  type Language,
  type QuadrantKey,
} from "./data/questions";

const SKIP_UA = "Пропустити ➡️";
const SKIP_EN = "Skip ➡️";

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

function buildDb() {
  const appId = process.env.INSTANT_DB_APP_ID || "";
  const adminToken = process.env.INSTANT_DB_ADMIN_TOKEN || "";
  if (!appId || !adminToken) {
    console.warn("[instantdb] APP_ID or ADMIN_TOKEN missing: skip db");
    return null;
  }
  return init({ appId, adminToken });
}

export function createBot() {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  if (!BOT_TOKEN) {
    throw new Error("BOT_TOKEN is required");
  }

  const db = buildDb();
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
  const QUESTIONS_LIMIT = Number(
    process.env.BOT_QUESTIONS_LIMIT ||
      (process.env.BOT_TEST_MODE ? 3 : 0) ||
      0
  );
  const flowQuestions =
    QUESTIONS_LIMIT > 0 ? allQuestions.slice(0, QUESTIONS_LIMIT) : allQuestions;
  const emojiChoices =
    "😀 😎 🤖 🐱 🐶 🐼 🦊 🦁 🐸 🦄 🐢 🐍 🦕 🦖 🐧 🦉 🐙 🦋 🐝 🐘 🦒 🐋";

  async function saveResult(input: {
    nickname: string;
    emoji: string;
    x: number;
    y: number;
    language: Language;
    slogan?: string;
  }) {
    if (!db) {
      console.warn("[instantdb] skip save: db not initialized");
      return null;
    }
    const recordId = instantId();
    const payload = {
      nickname: input.nickname,
      emoji: input.emoji,
      x: input.x,
      y: input.y,
      language: input.language,
      createdAt: new Date().toISOString(),
      slogan: input.slogan,
    } as const;
    console.log("[instantdb] transact payload", payload);
    await db.transact([db.tx.records[recordId].update(payload)]);
    console.log("[instantdb] saved OK, id:", recordId);
    return recordId;
  }

  function nextQuestion(ctx: any, s: Session) {
    if (s.step >= flowQuestions.length) {
      s.stage = "nickname";
      const skipBtn = s.lang === "ua" ? SKIP_UA : SKIP_EN;
      return ctx.reply(
        s.lang === "ua"
          ? "Введіть нік (можна пропустити — буде Анонімний користувач)"
          : "Enter a nickname (or skip for Anonymous)",
        Markup.keyboard([[skipBtn]]).oneTime().resize()
      );
    }
    const q = flowQuestions[s.step];
    const questionNum = s.step + 1;
    const total = flowQuestions.length;
    const prefix =
      s.lang === "ua"
        ? `Питання ${questionNum}/${total}`
        : `Question ${questionNum}/${total}`;
    // Use inline keyboard to avoid keyboard flickering
    return ctx.reply(
      `${prefix}\n${q.text[s.lang]}`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback("1", "answer_1"),
          Markup.button.callback("2", "answer_2"),
          Markup.button.callback("3", "answer_3"),
          Markup.button.callback("4", "answer_4"),
          Markup.button.callback("5", "answer_5"),
        ],
      ])
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

  bot.command(["reset", "stop", "exit"], (ctx) => {
    const lang =
      sessions.get(ctx.from.id)?.lang ||
      (ctx.from?.language_code?.startsWith("uk") ? "ua" : "en");
    sessions.delete(ctx.from.id);
    return ctx.reply(
      lang === "ua"
        ? "Сесію скинуто. Натисни /start, щоб почати спочатку."
        : "Session cleared. Tap /start to begin again."
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

  // Handle inline keyboard answers (1-5)
  bot.action(/^answer_([1-5])$/, async (ctx) => {
    const sess = sessions.get(ctx.from!.id);
    if (!sess || sess.stage !== "questions") {
      return ctx.answerCbQuery();
    }
    const value = Number(ctx.match[1]);
    const q = flowQuestions[sess.step];
    sess.answers[q.id] = value;
    sess.step += 1;
    await ctx.answerCbQuery(); // removes the "loading" indicator on button
    return nextQuestion(ctx, sess);
  });

  bot.on("text", async (ctx) => {
    const sess = sessions.get(ctx.from.id);
    if (!sess) {
      return ctx.reply("Натисніть /start щоб почати.");
    }

    if (sess.stage === "nickname") {
      const raw = ctx.message.text?.trim() || "";
      const isSkip = raw === SKIP_UA || raw === SKIP_EN || raw.length === 0;
      const nickname = isSkip
        ? sess.lang === "ua"
          ? "Анонімний користувач"
          : "Anonymous"
        : raw.slice(0, 20);
      sess.nickname = nickname;
      sess.stage = "emoji";
      return ctx.reply(
        sess.lang === "ua"
          ? `Обери emoji (можна ввести своє). Приклади: ${emojiChoices}`
          : `Pick an emoji (or type your own). Examples: ${emojiChoices}`,
        Markup.removeKeyboard()
      );
    }

    if (sess.stage === "emoji") {
      const raw = ctx.message.text?.trim() || "";
      const match = raw.match(/\p{Extended_Pictographic}/u);
      const emoji = match && match.length === 1 ? match[0] : "";
      if (!emoji) {
        return ctx.reply(
          sess.lang === "ua"
            ? "Будь ласка, надішли один emoji (без тексту). Напр.: 🦊"
            : "Send exactly one emoji (no text). E.g.: 🦊"
        );
      }
      sess.emoji = emoji;
      sess.stage = "slogan";
      const skipBtn = sess.lang === "ua" ? SKIP_UA : SKIP_EN;
      return ctx.reply(
        sess.lang === "ua"
          ? "Моє політичне гасло (до 100 символів, можна пропустити):"
          : "Your political slogan (up to 100 chars, optional):",
        Markup.keyboard([[skipBtn]]).oneTime().resize()
      );
    }

    if (sess.stage === "slogan") {
      const raw = ctx.message.text?.trim() || "";
      const isSkip = raw === SKIP_UA || raw === SKIP_EN;
      sess.slogan = isSkip ? "" : raw.slice(0, 100);
      sess.stage = "done";

      const activeSocial = flowQuestions.filter((q) => q.axis === "social");
      const activeEconomic = flowQuestions.filter((q) => q.axis === "economic");
      const socialValues = activeSocial.map((q) => sess.answers[q.id]);
      const econValues = activeEconomic.map((q) => sess.answers[q.id]);
      const y = averageNormalized(socialValues);
      const x = averageNormalized(econValues);
      const quadrant = determineQuadrant(x, y);
      const labels = quadrantLabels[sess.lang];
      const detail = quadrantDetails[quadrant];

      const nick =
        sess.nickname ||
        (sess.lang === "ua" ? "Анонімний користувач" : "Anonymous");
      const emoji = sess.emoji || "😀";
      const chartUrl = "https://political-quadrant.vercel.app/#chart";

      console.log("[bot] saving result", {
        nick,
        emoji,
        x,
        y,
        lang: sess.lang,
        hasDb: Boolean(db),
      });

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
          sess.lang === "ua" ? "Результат збережено ✅" : "Saved ✅"
        );
        console.log("[bot] saved OK");
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

      await ctx.reply(text, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: sess.lang === "ua" ? "Відкрити карту" : "Open chart",
                url: chartUrl,
              },
            ],
          ],
          remove_keyboard: true,
        },
      });
      sessions.delete(ctx.from.id);
      return;
    }

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

  return bot;
}
