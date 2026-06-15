"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, QrCode, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";

type TelegramSession = {
  token: string;
  botUrl: string;
  qrCodeUrl: string;
  expiresAt: string;
};

type TelegramSessionStatus = {
  status: "pending" | "allowed" | "expired";
  telegram_username?: string | null;
  telegram_first_name?: string | null;
  telegram_last_name?: string | null;
};

export default function TelegramLoginPage() {
  const [session, setSession] = useState<TelegramSession | null>(null);
  const [sessionStatus, setSessionStatus] = useState<TelegramSessionStatus["status"]>("pending");
  const [telegramName, setTelegramName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pollRef = useRef<number | null>(null);

  const createSession = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");
    setTelegramName("");
    setSessionStatus("pending");

    try {
      const response = await fetch("/api/telegram/login-sessions", {
        method: "POST"
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Could not create Telegram login session.");
      }

      setSession(payload);
      setMessage("Scan the code with Telegram, then press Start in @qltrade_bot.");
    } catch (sessionError) {
      setError(sessionError instanceof Error ? sessionError.message : "Could not create Telegram login session.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    createSession();
  }, [createSession]);

  useEffect(() => {
    const currentToken = session?.token;

    if (!currentToken || sessionStatus !== "pending") {
      return;
    }

    async function pollSession(token: string) {
      try {
        const response = await fetch(`/api/telegram/login-sessions/${encodeURIComponent(token)}`);
        const payload = (await response.json()) as TelegramSessionStatus & { error?: string };

        if (!response.ok) {
          throw new Error(payload.error || "Could not verify Telegram login.");
        }

        if (payload.status === "allowed") {
          const displayName =
            payload.telegram_username ||
            [payload.telegram_first_name, payload.telegram_last_name].filter(Boolean).join(" ") ||
            "Telegram user";

          setTelegramName(displayName);
          setSessionStatus("allowed");
          setMessage("Telegram login confirmed. This account is now an allowed user.");
          return;
        }

        if (payload.status === "expired") {
          setSessionStatus("expired");
          setMessage("This QR code expired. Generate a new one to continue.");
        }
      } catch (pollError) {
        setError(pollError instanceof Error ? pollError.message : "Could not verify Telegram login.");
      }
    }

    pollRef.current = window.setInterval(() => pollSession(currentToken), 2500);
    pollSession(currentToken);

    return () => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
      }
    };
  }, [session, sessionStatus]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#05040a] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <Link className="flex items-center gap-3" href="/">
            <span className="grid size-10 place-items-center rounded-md bg-white text-[#05040a]">
              <ShieldCheck size={22} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-lg font-semibold leading-none">QL Trade</span>
              <span className="mt-1 block text-xs text-white/55">Automation bot access</span>
            </span>
          </Link>

          <Link
            className="inline-flex h-10 items-center justify-center rounded-md border border-white/12 bg-white/[0.06] px-3 text-sm font-semibold text-white hover:bg-white/[0.1]"
            href="/login"
          >
            Email login
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1fr_450px] lg:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-md border border-white/12 bg-white/[0.06] px-3 py-2 text-sm font-medium text-white/80">
              <Sparkles size={16} aria-hidden="true" />
              Everyone who verifies with @qltrade_bot is approved automatically
            </div>

            <h1 className="mt-7 text-5xl font-semibold leading-[1.02] tracking-normal text-white sm:text-6xl lg:text-7xl">
              One scan.
              <span className="block text-[#b7ff5a]">Instant access.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/64 sm:text-lg">
              Scan the QR code, open Telegram, and press Start. QL Trade confirms the Telegram account and adds it to the allowed-user list automatically.
            </p>

            <div className="mt-9 grid max-w-xl gap-3 sm:grid-cols-3">
              {["QR session", "Telegram identity", "Allowed user"].map((step, index) => (
                <div key={step} className="rounded-md border border-white/10 bg-white/[0.045] p-3">
                  <p className="text-xs font-semibold text-white/38">0{index + 1}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-white/12 bg-white/[0.07] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur">
            <div className="rounded-md border border-white/10 bg-[#111018] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#b7ff5a]">@qltrade_bot</p>
                  <h2 className="mt-2 text-2xl font-semibold">Scan to log in</h2>
                </div>
                <span className="grid size-11 shrink-0 place-items-center rounded-md bg-white text-[#05040a]">
                  <QrCode size={22} aria-hidden="true" />
                </span>
              </div>

              <div className="mt-6 rounded-lg border border-white/10 bg-white p-5">
                <div className="grid aspect-square place-items-center rounded-md bg-white">
                  {loading ? (
                    <Loader2 className="animate-spin text-[#6d5dfc]" size={34} aria-hidden="true" />
                  ) : session ? (
                    <Image
                      alt="Telegram login QR code for @qltrade_bot"
                      className="size-full max-h-[390px] max-w-[390px]"
                      height={390}
                      src={session.qrCodeUrl}
                      style={{ imageRendering: "pixelated" }}
                      unoptimized
                      width={390}
                    />
                  ) : (
                    <p className="px-4 text-center text-sm text-stone-500">QR code unavailable.</p>
                  )}
                </div>
              </div>

              {session?.botUrl ? (
                <p className="mt-3 break-all rounded-md border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-white/60">
                  {session.botUrl}
                </p>
              ) : null}

              {error ? (
                <p className="mt-4 rounded-md border border-red-400/25 bg-red-400/10 px-3 py-2 text-sm text-red-100">
                  {error}
                </p>
              ) : null}

              {message ? (
                <p
                  className={`mt-4 rounded-md border px-3 py-2 text-sm ${
                    sessionStatus === "allowed"
                      ? "border-[#b7ff5a]/35 bg-[#b7ff5a]/10 text-[#d8ff9d]"
                      : "border-white/10 bg-white/[0.06] text-white/70"
                  }`}
                >
                  {message}
                </p>
              ) : null}

              {sessionStatus === "allowed" ? (
                <div className="mt-4 flex items-center gap-2 rounded-md border border-[#b7ff5a]/35 bg-[#b7ff5a]/10 px-3 py-2 text-sm font-semibold text-[#d8ff9d]">
                  <CheckCircle2 size={17} aria-hidden="true" />
                  {telegramName} is allowed
                </div>
              ) : null}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <a
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#6d5dfc] px-4 text-sm font-semibold text-white shadow-[0_14px_36px_rgba(109,93,252,0.32)] hover:bg-[#7b6dff] aria-disabled:pointer-events-none aria-disabled:opacity-60"
                  aria-disabled={!session}
                  href={session?.botUrl ?? "#"}
                  rel="noreferrer"
                  target="_blank"
                >
                  <ExternalLink size={17} aria-hidden="true" />
                  Open Telegram
                </a>
                <button
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/12 bg-white/[0.06] px-4 text-sm font-semibold text-white hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={loading}
                  onClick={createSession}
                  type="button"
                >
                  <RotateCcw size={17} aria-hidden="true" />
                  New QR
                </button>
              </div>

              <p className="mt-5 text-center text-sm text-white/45">
                Prefer email access?{" "}
                <Link className="font-semibold text-white hover:text-[#b7ff5a]" href="/login">
                  Log in with email
                </Link>
              </p>
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-3 border-t border-white/10 py-5 text-xs text-white/38 sm:flex-row sm:items-center sm:justify-between">
          <span>Secure Telegram verification for QL Trade services</span>
          <span>QR sessions expire automatically</span>
        </footer>
      </div>
    </main>
  );
}
