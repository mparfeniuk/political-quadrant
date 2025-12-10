import { Telegraf } from "telegraf";

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_PATH = process.env.WEBHOOK_PATH || "/tg-webhook";

if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN is required");
}

const bot = new Telegraf(BOT_TOKEN);

// Reuse main bot logic by importing the built handler would be ideal,
// but for brevity, we just register a simple ping here.
// You can extend this file to import your full bot if desired.
bot.on("message", (ctx) => ctx.reply("Bot is running via webhook ✅"));

const handler = bot.webhookCallback(WEBHOOK_PATH);

export default async function handlerWrapper(req: any, res: any) {
  if (req.method !== "POST") {
    res.statusCode = 200;
    res.end("ok");
    return;
  }
  return handler(req, res);
}

