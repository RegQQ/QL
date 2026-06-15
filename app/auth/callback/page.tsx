"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { createSupabaseBrowserClient, hasSupabaseBrowserConfig } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackShell message="Confirming your account..." />}>
      <AuthCallbackContent />
    </Suspense>
  );
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasSupabaseConfig = hasSupabaseBrowserConfig();
  const supabase = useMemo(() => (hasSupabaseConfig ? createSupabaseBrowserClient() : null), [hasSupabaseConfig]);
  const [message, setMessage] = useState("Confirming your account...");

  useEffect(() => {
    async function confirmSession() {
      const code = searchParams.get("code");
      const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

      if (!supabase) {
        setMessage("Supabase environment variables are not configured.");
        return;
      }

      if (!code) {
        setMessage("Missing confirmation code. Please try logging in again.");
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        setMessage(error.message);
        return;
      }

      router.replace(redirectTo);
      router.refresh();
    }

    confirmSession();
  }, [router, searchParams, supabase]);

  return (
    <CallbackShell message={message} />
  );
}

function CallbackShell({ message }: { message: string }) {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-6 text-center shadow-panel">
        <div className="mx-auto grid size-11 place-items-center rounded-md bg-ink text-white">
          <ShieldCheck size={22} aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-xl font-semibold">Vionix authentication</h1>
        <p className="mt-2 text-sm text-stone-500">{message}</p>
      </div>
    </main>
  );
}
