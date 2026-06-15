const botToken = process.env.TELEGRAM_BOT_TOKEN;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!botToken) {
  throw new Error("Missing TELEGRAM_BOT_TOKEN.");
}

if (!appUrl || appUrl.includes("localhost") || appUrl.includes("127.0.0.1")) {
  throw new Error("NEXT_PUBLIC_APP_URL must be a public HTTPS URL, not localhost.");
}

const webhookUrl = `${appUrl.replace(/\/$/, "")}/api/telegram/webhook`;

const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    url: webhookUrl,
    secret_token: webhookSecret || undefined,
    allowed_updates: ["message"]
  })
});

const payload = await response.json();

if (!response.ok || !payload.ok) {
  throw new Error(payload.description || "Telegram rejected the webhook setup.");
}

console.log(`Telegram webhook set to ${webhookUrl}`);
