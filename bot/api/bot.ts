import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createBot } from "../src/botApp";

let botInstance: ReturnType<typeof createBot> | null = null;

function getBot() {
  if (!botInstance) {
    botInstance = createBot();
  }
  return botInstance;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(200).send("ok");
  }
  try {
    const bot = getBot();
    await bot.handleUpdate(req.body as any);
    res.status(200).send("ok");
  } catch (err) {
    console.error("Bot error:", err);
    res.status(500).send("error");
  }
}
