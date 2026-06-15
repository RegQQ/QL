import { randomBytes, randomUUID } from "crypto";

export const telegramBotUsername = process.env.TELEGRAM_BOT_USERNAME || "qltrade_bot";

export type TelegramLoginSession = {
  token: string;
  botUrl: string;
  qrCodeUrl: string;
};

export function createTelegramLoginSession(): TelegramLoginSession {
  const token = `${randomUUID()}-${randomBytes(8).toString("hex")}`;
  const botUrl = `https://t.me/${telegramBotUsername}?start=${encodeURIComponent(token)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=12&data=${encodeURIComponent(botUrl)}`;

  return {
    token,
    botUrl,
    qrCodeUrl
  };
}

export function isValidTelegramWebhookSecret(requestSecret: string | null) {
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!expectedSecret) {
    return true;
  }

  return requestSecret === expectedSecret;
}

export function getAppOrigin(request: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  return new URL(request.url).origin;
}
