import { NextResponse } from "next/server";
import { createSupabaseServiceClient, hasSupabaseServiceConfig } from "@/lib/supabase/server";
import { isValidTelegramWebhookSecret } from "@/lib/telegram/auth";

type TelegramUser = {
  id: number;
  is_bot?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};

type TelegramUpdate = {
  message?: {
    text?: string;
    from?: TelegramUser;
    chat?: {
      id: number;
    };
  };
};

function getStartToken(text: string | undefined) {
  if (!text) {
    return null;
  }

  const match = text.trim().match(/^\/start(?:@\w+)?\s+(.+)$/);
  return match?.[1]?.trim() || null;
}

function isStartCommand(text: string | undefined) {
  return /^\/start(?:@\w+)?(?:\s|$)/.test(text?.trim() ?? "");
}

async function sendTelegramMessage(chatId: number, text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return;
  }

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: chatId,
      text
    })
  });
}

export async function POST(request: Request) {
  if (!isValidTelegramWebhookSecret(request.headers.get("x-telegram-bot-api-secret-token"))) {
    return NextResponse.json({ error: "Invalid Telegram webhook secret." }, { status: 401 });
  }

  if (!hasSupabaseServiceConfig()) {
    return NextResponse.json(
      { error: "Supabase service configuration is missing." },
      { status: 500 }
    );
  }

  const update = (await request.json()) as TelegramUpdate;
  const from = update.message?.from;
  const chatId = update.message?.chat?.id;
  const token = getStartToken(update.message?.text);

  if (!from || from.is_bot) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  if (!token) {
    if (chatId && isStartCommand(update.message?.text)) {
      await sendTelegramMessage(
        chatId,
        "Open the QL Trade login page, generate a fresh QR code, then open this bot from that QR or the Open Telegram button."
      );
    }

    return NextResponse.json({ ok: true, ignored: true });
  }

  const supabase = createSupabaseServiceClient();
  const { data: loginSession, error: sessionError } = await supabase
    .from("telegram_login_sessions")
    .select("token, status, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 500 });
  }

  if (!loginSession || new Date(loginSession.expires_at).getTime() < Date.now()) {
    if (chatId) {
      await sendTelegramMessage(chatId, "This QL Trade login QR has expired. Please request a new code from the login page.");
    }

    return NextResponse.json({ ok: true, expired: true });
  }

  const allowedAt = new Date().toISOString();
  const allowedUser = {
    telegram_user_id: from.id,
    telegram_username: from.username ?? null,
    telegram_first_name: from.first_name ?? null,
    telegram_last_name: from.last_name ?? null,
    allowed: true,
    allowed_at: allowedAt,
    last_login_at: allowedAt
  };

  const { error: allowError } = await supabase
    .from("telegram_allowed_users")
    .upsert(allowedUser, { onConflict: "telegram_user_id" });

  if (allowError) {
    return NextResponse.json({ error: allowError.message }, { status: 500 });
  }

  const { error: updateError } = await supabase
    .from("telegram_login_sessions")
    .update({
      status: "allowed",
      telegram_user_id: from.id,
      telegram_username: from.username ?? null,
      telegram_first_name: from.first_name ?? null,
      telegram_last_name: from.last_name ?? null,
      allowed_at: allowedAt
    })
    .eq("token", token);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (chatId) {
    await sendTelegramMessage(chatId, "You are approved for QL Trade. Return to the browser to continue.");
  }

  return NextResponse.json({ ok: true, allowed: true });
}
