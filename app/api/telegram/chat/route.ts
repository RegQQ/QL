import { NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { access } from "node:fs/promises";
import { isAbsolute } from "node:path";
import { promisify } from "node:util";
import { createSupabaseServiceClient, hasSupabaseServiceConfig } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const execFileAsync = promisify(execFile);
const defaultHermesCommand = "/Users/hang/.hermes/hermes-agent/venv/bin/hermes";

type ChatRequest = {
  token?: string;
  message?: string;
};

type HermesUser = {
  displayName: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

async function getHermesReply(message: string, token: string, user: HermesUser) {
  const webhookReply = await getHermesWebhookReply(message, token, user);

  if (webhookReply) {
    return webhookReply;
  }

  return getHermesCommandReply(message, token, user);
}

async function getHermesWebhookReply(message: string, token: string, user: HermesUser) {
  const url = process.env.HERMES_CHAT_WEBHOOK_URL || process.env.HERMES_CHAT_URL;

  if (!url) {
    return null;
  }

  const headers: HeadersInit = {
    "content-type": "application/json"
  };
  const secret = process.env.HERMES_CHAT_SECRET;

  if (secret) {
    headers.authorization = `Bearer ${secret}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      source: "ql-trade-web",
      type: "chat.message",
      message,
      text: message,
      session: {
        token,
        channel: "website"
      },
      user
    })
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`Hermes returned ${response.status}: ${responseText || response.statusText}`);
  }

  if (!responseText.trim()) {
    return "Hermes received the message.";
  }

  try {
    const payload = JSON.parse(responseText) as {
      reply?: unknown;
      response?: unknown;
      text?: unknown;
      message?: unknown;
      output?: unknown;
    };
    const reply = payload.reply ?? payload.response ?? payload.text ?? payload.message ?? payload.output;

    if (typeof reply === "string" && reply.trim()) {
      return reply.trim();
    }
  } catch {
    return responseText.trim();
  }

  return responseText.trim();
}

async function getHermesCommandReply(message: string, token: string, user: HermesUser) {
  const command = process.env.HERMES_CHAT_CMD || process.env.HERMES_SEND_CMD || defaultHermesCommand;
  const canRun = await canExecuteCommand(command);

  if (!canRun) {
    throw new Error(
      "Hermes is not connected to this website yet. Set HERMES_CHAT_WEBHOOK_URL to a public Hermes chat endpoint, or run this locally with HERMES_CHAT_CMD pointing to the Hermes binary."
    );
  }

  const prompt = [
    "You are Hermes, the QL Trade Telegram bot, replying through the QL Trade website.",
    "Match the same practical, concise behavior the Telegram bot would give.",
    `Verified website user: ${user.displayName}.`,
    `Website session token: ${token}.`,
    "",
    "User message:",
    message
  ].join("\n");

  const { stdout } = await execFileAsync(command, ["-z", prompt], {
    cwd: process.cwd(),
    timeout: Number(process.env.HERMES_CHAT_TIMEOUT_MS || 45000),
    maxBuffer: 1024 * 1024,
    env: {
      ...process.env,
      HERMES_ACCEPT_HOOKS: process.env.HERMES_ACCEPT_HOOKS || "1"
    }
  });

  const reply = stdout.trim();

  if (!reply) {
    throw new Error("Hermes did not return a reply.");
  }

  return reply;
}

async function canExecuteCommand(command: string) {
  if (!command) {
    return false;
  }

  if (!isAbsolute(command)) {
    return true;
  }

  try {
    await access(command);
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!hasSupabaseServiceConfig()) {
    return NextResponse.json(
      { error: "Supabase service configuration is missing." },
      { status: 500 }
    );
  }

  const body = (await request.json()) as ChatRequest;
  const token = body.token?.trim();
  const message = body.message?.trim();

  if (!token || !message) {
    return NextResponse.json({ error: "A verified session token and message are required." }, { status: 400 });
  }

  if (message.length > 1200) {
    return NextResponse.json({ error: "Message is too long." }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("telegram_login_sessions")
    .select("status, telegram_username, telegram_first_name, telegram_last_name, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.status !== "allowed") {
    return NextResponse.json({ error: "This Telegram session is not approved for chat." }, { status: 403 });
  }

  const displayName =
    data.telegram_username ||
    [data.telegram_first_name, data.telegram_last_name].filter(Boolean).join(" ") ||
    "Telegram user";
  let reply: string;

  try {
    reply = await getHermesReply(message, token, {
      displayName,
      username: data.telegram_username,
      firstName: data.telegram_first_name,
      lastName: data.telegram_last_name
    });
  } catch (hermesError) {
    const message =
      hermesError instanceof Error
        ? hermesError.message
        : "Hermes could not answer this website message.";

    return NextResponse.json({ error: message }, { status: 502 });
  }

  return NextResponse.json({
    reply,
    displayName,
    sentAt: new Date().toISOString()
  });
}
