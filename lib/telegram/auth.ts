import { randomBytes } from "crypto";

export const telegramBotUsername = (process.env.TELEGRAM_BOT_USERNAME || "qltrade_bot").replace(/^@+/, "");

export type TelegramLoginSession = {
  token: string;
  botUrl: string;
  qrCodeUrl: string;
};

export function createTelegramLoginSession(): TelegramLoginSession {
  const token = randomBytes(12).toString("base64url");
  const botUrl = `https://t.me/${telegramBotUsername}?start=${encodeURIComponent(token)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=420x420&margin=18&data=${encodeURIComponent(botUrl)}`;

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
