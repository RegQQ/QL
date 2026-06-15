"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { Building2, LockKeyhole, Mail, QrCode, ShieldCheck, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createSupabaseBrowserClient, hasSupabaseBrowserConfig } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

type AuthCardProps = {
  mode: AuthMode;
};

export function AuthCard({ mode }: AuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasSupabaseConfig = hasSupabaseBrowserConfig();
  const supabase = useMemo(() => (hasSupabaseConfig ? createSupabaseBrowserClient() : null), [hasSupabaseConfig]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const isSignup = mode === "signup";
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    if (!supabase) {
      setStatus("error");
      setMessage("Supabase environment variables are not configured.");
      return;
    }

    if (isSignup) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
          data: {
            full_name: fullName,
            organization_name: organizationName
          }
        }
      });

      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }

      if (data.session) {
        router.replace(redirectTo);
        router.refresh();
        return;
      }

      setStatus("success");
      setMessage("Check your email to confirm your account, then return to Vionix.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
      <div className="grid w-full overflow-hidden rounded-lg border border-stone-200 bg-white shadow-panel lg:grid-cols-[0.85fr_1fr]">
        <section className="bg-ink p-8 text-white lg:p-10">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-md bg-white text-ink">
              <ShieldCheck size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-semibold leading-none">Vionix</p>
              <p className="mt-1 text-sm text-stone-300">AI governance platform</p>
            </div>
          </div>

          <div className="mt-10 max-w-sm">
            <p className="text-sm font-medium text-teal-200">
              {isSignup ? "Create organization account" : "Secure workspace access"}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal">
              {isSignup ? "Start governing AI usage across your organization." : "Sign in to your governance workspace."}
            </h1>
            <p className="mt-4 text-sm leading-6 text-stone-300">
              Centralize AI policies, approvals, user access, and audit evidence behind role-based access.
            </p>
          </div>
        </section>

        <section className="p-6 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-md">
            <div>
              <h2 className="text-2xl font-semibold">{isSignup ? "Create account" : "Log in"}</h2>
              <p className="mt-2 text-sm text-stone-500">
                {isSignup ? "The first user becomes the organization Admin." : "Use your organization email and password."}
              </p>
            </div>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              {!hasSupabaseConfig ? (
                <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local` before using auth.
                </p>
              ) : null}

              {isSignup ? (
                <>
                  <Field
                    icon={UserRound}
                    label="Full name"
                    name="fullName"
                    onChange={setFullName}
                    placeholder="Ava Chen"
                    value={fullName}
                  />
                  <Field
                    icon={Building2}
                    label="Organization"
                    name="organization"
                    onChange={setOrganizationName}
                    placeholder="Acme Corp"
                    value={organizationName}
                  />
                </>
              ) : null}

              <Field
                icon={Mail}
                label="Email"
                name="email"
                onChange={setEmail}
                placeholder="you@company.com"
                type="email"
                value={email}
              />
              <Field
                icon={LockKeyhole}
                label="Password"
                name="password"
                onChange={setPassword}
                placeholder="Minimum 6 characters"
                type="password"
                value={password}
              />

              {message ? (
                <p
                  className={`rounded-md px-3 py-2 text-sm ${
                    status === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {message}
                </p>
              ) : null}

              <button
                className="inline-flex h-11 w-full items-center justify-center rounded-md bg-ink px-4 text-sm font-semibold text-white hover:bg-graphite disabled:cursor-not-allowed disabled:opacity-70"
                disabled={status === "loading"}
                type="submit"
              >
                {status === "loading" ? "Working..." : isSignup ? "Create organization" : "Log in"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-stone-500">
              {isSignup ? "Already have an account?" : "New to Vionix?"}{" "}
              <Link className="font-semibold text-signal hover:text-ink" href={isSignup ? "/login" : "/signup"}>
                {isSignup ? "Log in" : "Create an organization"}
              </Link>
            </p>

            {!isSignup ? (
              <div className="mt-6 border-t border-stone-200 pt-6">
                <Link
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                  href="/telegram-login"
                >
                  <QrCode size={17} aria-hidden="true" />
                  Log in with Telegram QR
                </Link>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  name,
  onChange,
  placeholder,
  type = "text",
  value
}: {
  icon: LucideIcon;
  label: string;
  name: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  value: string;
}) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      <span className="mt-2 flex h-11 items-center gap-2 rounded-md border border-stone-200 bg-white px-3 focus-within:border-signal">
        <Icon className="shrink-0 text-stone-400" size={17} aria-hidden="true" />
        <input
          className="h-full min-w-0 flex-1 border-0 bg-transparent text-ink outline-none placeholder:text-stone-400"
          name={name}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required
          type={type}
          value={value}
        />
      </span>
    </label>
  );
}
