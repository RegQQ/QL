import { NextResponse } from "next/server";
import { createSupabaseServiceClient, hasSupabaseServiceConfig } from "@/lib/supabase/server";
import { createTelegramLoginSession } from "@/lib/telegram/auth";

export async function POST() {
  if (!hasSupabaseServiceConfig()) {
    return NextResponse.json(
      { error: "Supabase service configuration is missing." },
      { status: 500 }
    );
  }

  const session = createTelegramLoginSession();
  const supabase = createSupabaseServiceClient();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error } = await supabase.from("telegram_login_sessions").insert({
    token: session.token,
    bot_username: process.env.TELEGRAM_BOT_USERNAME || "qltrade_bot",
    status: "pending",
    expires_at: expiresAt
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ...session,
    expiresAt
  });
}
