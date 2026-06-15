import { NextResponse } from "next/server";
import { createSupabaseServiceClient, hasSupabaseServiceConfig } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    token: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  if (!hasSupabaseServiceConfig()) {
    return NextResponse.json(
      { error: "Supabase service configuration is missing." },
      { status: 500 }
    );
  }

  const { token } = await context.params;
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("telegram_login_sessions")
    .select(
      "status, telegram_user_id, telegram_username, telegram_first_name, telegram_last_name, allowed_at, expires_at"
    )
    .eq("token", token)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Login session not found." }, { status: 404 });
  }

  if (data.status === "pending" && new Date(data.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ status: "expired" });
  }

  return NextResponse.json(data);
}
