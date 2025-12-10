import { createServer } from "http";
import { createBot } from "./botApp";

const WEBHOOK_URL = process.env.WEBHOOK_URL || "";
const WEBHOOK_PATH = process.env.WEBHOOK_PATH || "/tg-webhook";
const WEBHOOK_PORT = Number(process.env.WEBHOOK_PORT || process.env.PORT || 3000);

export async function launchBot() {
  const bot = createBot();

  if (WEBHOOK_URL) {
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
