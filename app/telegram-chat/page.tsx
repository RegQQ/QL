"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Activity, Bot, CheckCircle2, Clipboard, ExternalLink, Loader2, LockKeyhole, MessageSquareText, Send, ShieldCheck } from "lucide-react";

type ChatStatus = "checking" | "pending" | "ready" | "blocked";

type TelegramSessionStatus = {
  status: "pending" | "allowed" | "expired";
  telegram_username?: string | null;
  telegram_first_name?: string | null;
  telegram_last_name?: string | null;
  error?: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

function cleanAssistantText(text: string) {
  return text.replace(/^\s*(?:\d+\s+){1,4}(?=[A-Za-z])/u, "").trim();
}

function AgentStatusBadge({ elapsedSeconds, sending }: { elapsedSeconds: number; sending: boolean }) {
  if (sending) {
    return (
      <div className="inline-flex items-center gap-2 rounded-md border border-[#b7ff5a]/25 bg-[#b7ff5a]/10 px-3 py-2 text-xs font-semibold text-[#d8ff9d] shadow-[0_0_28px_rgba(183,255,90,0.08)] backdrop-blur-md">
        <Loader2 className="animate-spin" size={14} aria-hidden="true" />
        <span>Hermes is thinking</span>
        <span className="text-[#d8ff9d]/55">{elapsedSeconds}s</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.055] px-3 py-2 text-xs font-semibold text-white/62 backdrop-blur-md">
      <CheckCircle2 size={14} aria-hidden="true" />
      <span>Hermes idle</span>
    </div>
  );
}

function FloatingAgentStatus({
  elapsedSeconds,
  sending,
  status
}: {
  elapsedSeconds: number;
  sending: boolean;
  status: ChatStatus;
}) {
  const label = sending
    ? "Thinking"
    : status === "ready"
      ? "Idle"
      : status === "pending"
        ? "Waiting"
        : status === "checking"
          ? "Checking"
          : "Blocked";
  const detail = sending
    ? `${elapsedSeconds}s`
    : status === "ready"
      ? "ready"
      : status;

  return (
    <div className="pointer-events-none absolute right-5 top-[86px] z-20 flex items-center gap-2 rounded-md border border-white/12 bg-[#05040a]/70 px-3 py-2 text-xs font-semibold text-white/72 shadow-[0_18px_42px_rgba(0,0,0,0.3)] backdrop-blur-md">
      {sending ? (
        <Loader2 className="animate-spin text-[#d8ff9d]" size={14} aria-hidden="true" />
      ) : (
        <CheckCircle2 className={status === "ready" ? "text-[#d8ff9d]" : "text-white/45"} size={14} aria-hidden="true" />
      )}
      <span>Agent status:</span>
      <span className={sending ? "text-[#d8ff9d]" : "text-white"}>{label}</span>
      <span className="font-mono text-white/38">{detail}</span>
    </div>
  );
}

function getDisplayName(session: TelegramSessionStatus | null) {
  if (!session) {
    return "Web session";
  }

  return (
    session.telegram_username ||
    [session.telegram_first_name, session.telegram_last_name].filter(Boolean).join(" ") ||
    "Web session"
  );
}

function TelegramChatContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [session, setSession] = useState<TelegramSessionStatus | null>(null);
  const [status, setStatus] = useState<ChatStatus>("checking");
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [thinkingStartedAt, setThinkingStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "You are connected to the Hermes bot for QL Trade. Messages here are sent to Hermes instead of a separate website responder."
    }
  ]);
  const endRef = useRef<HTMLDivElement | null>(null);
  const displayName = useMemo(() => getDisplayName(session), [session]);
  const botUrl = token ? `https://t.me/qltrade_bot?start=${encodeURIComponent(token)}` : "#";

  useEffect(() => {
    async function checkSession() {
      if (!token) {
        setStatus("blocked");
        setError("Missing Telegram verification token. Start from the QR login page.");
        return;
      }

      try {
        const response = await fetch(`/api/telegram/login-sessions/${encodeURIComponent(token)}`);
        const payload = (await response.json()) as TelegramSessionStatus;

        if (!response.ok) {
          throw new Error(payload.error || "Could not verify this Telegram session.");
        }

        setSession(payload);

        if (payload.status === "pending") {
          setStatus("pending");
          setError("");
          return;
        }

        if (payload.status === "expired") {
          setStatus("blocked");
          setError("This Telegram login code expired. Start from the QR login page to generate a fresh code.");
          return;
        }

        setStatus("ready");
      } catch (sessionError) {
        setStatus("blocked");
        setError(sessionError instanceof Error ? sessionError.message : "Could not verify this Telegram session.");
      }
    }

    checkSession();
    const pollId = window.setInterval(checkSession, 2500);

    return () => {
      window.clearInterval(pollId);
    };
  }, [token]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    if (!sending || !thinkingStartedAt) {
      setElapsedSeconds(0);
      return;
    }

    const updateElapsedSeconds = () => {
      setElapsedSeconds(Math.max(1, Math.floor((Date.now() - thinkingStartedAt) / 1000)));
    };

    updateElapsedSeconds();
    const intervalId = window.setInterval(updateElapsedSeconds, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [sending, thinkingStartedAt]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = input.trim();

    if (!message || sending || status !== "ready") {
      return;
    }

    setInput("");
    setSending(true);
    setThinkingStartedAt(Date.now());
    setMessages((currentMessages) => [
      ...currentMessages,
      { id: `user-${Date.now()}`, role: "user", text: message }
    ]);

    try {
      const response = await fetch("/api/telegram/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token, message })
      });
      const payload = (await response.json()) as { reply?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Could not send message.");
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: cleanAssistantText(payload.reply || "Message received.")
        }
      ]);
    } catch (chatError) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          text: chatError instanceof Error ? chatError.message : "Could not send message."
        }
      ]);
    } finally {
      setSending(false);
      setThinkingStartedAt(null);
    }
  }

  async function copyLoginCode() {
    if (!token) {
      return;
    }

    await navigator.clipboard.writeText(token);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main className="min-h-screen bg-[#05040a] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <Link className="flex items-center gap-3" href="/telegram-login">
            <span className="grid size-10 place-items-center rounded-md bg-white text-[#05040a]">
              <ShieldCheck size={22} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-lg font-semibold leading-none">QL Trade</span>
              <span className="mt-1 block text-xs text-white/55">Web chat</span>
            </span>
          </Link>

          <Link
            className="inline-flex h-10 items-center justify-center rounded-md border border-white/12 bg-white/[0.06] px-3 text-sm font-semibold text-white hover:bg-white/[0.1]"
            href="/telegram-login"
          >
            New QR
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-white/12 bg-white/[0.06] px-3 py-2 text-sm font-medium text-white/80">
              <MessageSquareText size={16} aria-hidden="true" />
              Telegram verified Hermes chat
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
              Chat with the Hermes bot without leaving the website.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/62">
              This page uses the QR approval to confirm your Telegram identity, then sends your browser messages to the same Hermes bot behind Telegram.
            </p>
          </div>

          <div className="relative flex h-[min(720px,calc(100vh-150px))] min-h-[560px] flex-col overflow-hidden rounded-lg border border-white/12 bg-[#111018] shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-md bg-[#b7ff5a] text-[#05040a]">
                  <Bot size={21} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Hermes / QL Trade Bot</p>
                  <p className="mt-1 text-xs text-white/45">
                    {sending
                      ? `Replying to ${displayName}`
                      : status === "ready"
                        ? `Hermes connected as ${displayName}`
                        : status === "pending"
                          ? "Waiting for Telegram approval"
                          : "Checking Telegram approval"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {status === "ready" ? <AgentStatusBadge elapsedSeconds={elapsedSeconds} sending={sending} /> : null}
                <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.06] px-2.5 py-1.5 text-xs font-semibold text-white/65">
                  <LockKeyhole size={13} aria-hidden="true" />
                  Verified
                </span>
              </div>
            </div>
            <FloatingAgentStatus elapsedSeconds={elapsedSeconds} sending={sending} status={status} />

            {status === "checking" ? (
              <div className="grid flex-1 place-items-center px-5">
                <div className="flex items-center gap-3 text-sm text-white/65">
                  <Loader2 className="animate-spin" size={18} aria-hidden="true" />
                  Checking your QR approval...
                </div>
              </div>
            ) : status === "pending" ? (
              <div className="grid flex-1 place-items-center px-5">
                <div className="w-full max-w-lg rounded-md border border-[#b7ff5a]/30 bg-[#b7ff5a]/10 p-4 text-[#d8ff9d]">
                  <p className="text-sm font-semibold">Telegram has not approved this website session yet.</p>
                  <p className="mt-2 text-sm leading-6 text-[#d8ff9d]/78">
                    Open @qltrade_bot and press Start. If the QR or app link does not pass the code through, copy this code and send it in Telegram.
                  </p>
                  <div className="mt-4 rounded-md border border-[#b7ff5a]/25 bg-[#05040a]/55 px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-normal text-[#d8ff9d]/60">Login code</p>
                    <p className="mt-1 break-all font-mono text-xl font-semibold">{token}</p>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <a
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#6d5dfc] px-4 text-sm font-semibold text-white hover:bg-[#7b6dff]"
                      href={botUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <ExternalLink size={16} aria-hidden="true" />
                      Open Telegram
                    </a>
                    <button
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#b7ff5a]/35 px-4 text-sm font-semibold text-[#d8ff9d] hover:bg-[#b7ff5a]/10"
                      onClick={copyLoginCode}
                      type="button"
                    >
                      <Clipboard size={16} aria-hidden="true" />
                      {copied ? "Copied" : "Copy code"}
                    </button>
                  </div>
                  {error ? <p className="mt-3 text-sm text-red-100">{error}</p> : null}
                </div>
              </div>
            ) : status === "blocked" ? (
              <div className="grid flex-1 place-items-center px-5">
                <div className="max-w-md rounded-md border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </div>
              </div>
            ) : (
              <>
                <div className="relative flex-1 space-y-4 overflow-y-auto px-5 py-5">
                  {messages.map((message) => (
                    <div
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      key={message.id}
                    >
                      <div
                        className={`max-w-[82%] rounded-md px-4 py-3 text-sm leading-6 ${
                          message.role === "user"
                            ? "bg-[#6d5dfc] text-white"
                            : "border border-white/10 bg-white/[0.06] text-white/78"
                        }`}
                      >
                        {message.role === "assistant" ? cleanAssistantText(message.text) : message.text}
                      </div>
                    </div>
                  ))}
                  {sending ? (
                    <div className="flex justify-start">
                      <div className="max-w-[82%] rounded-md border border-[#b7ff5a]/20 bg-white/[0.045] px-4 py-3 text-sm leading-6 text-white/68 backdrop-blur">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex size-8 items-center justify-center rounded-md bg-[#b7ff5a]/15 text-[#d8ff9d]">
                            <Activity size={16} aria-hidden="true" />
                          </span>
                          <div>
                            <p className="font-semibold text-white/82">Hermes is working on a reply</p>
                            <p className="mt-1 text-xs text-white/44">
                              {elapsedSeconds > 12 ? "Still connected. This one is taking longer than usual." : "Your message reached the bot."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  <div ref={endRef} />
                </div>

                <form className="border-t border-white/10 p-4" onSubmit={sendMessage}>
                  <div className="mb-3 flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.045] px-3 py-2 text-xs text-white/55 backdrop-blur">
                    <div className="flex min-w-0 items-center gap-2">
                      {sending ? (
                        <Loader2 className="shrink-0 animate-spin text-[#d8ff9d]" size={14} aria-hidden="true" />
                      ) : (
                        <CheckCircle2 className="shrink-0 text-white/45" size={14} aria-hidden="true" />
                      )}
                      <span className="truncate">
                        {sending
                          ? elapsedSeconds > 12
                            ? "Hermes is still thinking. Keep this page open."
                            : "Hermes is thinking. Reply in progress."
                          : "Hermes is idle. Send a message when ready."}
                      </span>
                    </div>
                    <span className="shrink-0 font-mono text-white/38">{sending ? `${elapsedSeconds}s` : "ready"}</span>
                  </div>
                  <div className="flex gap-3">
                    <input
                      className="h-12 min-w-0 flex-1 rounded-md border border-white/10 bg-white/[0.06] px-4 text-sm text-white placeholder:text-white/35"
                      onChange={(event) => setInput(event.target.value)}
                      placeholder={sending ? "Waiting for Hermes..." : "Message Hermes..."}
                      disabled={sending}
                      value={input}
                    />
                    <button
                      className="inline-flex size-12 shrink-0 items-center justify-center rounded-md bg-[#b7ff5a] text-[#05040a] hover:bg-[#c8ff7d] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={sending || !input.trim()}
                      type="submit"
                    >
                      {sending ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
                      <span className="sr-only">Send message</span>
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function TelegramChatPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-[#05040a] text-white">
          <Loader2 className="animate-spin" size={26} aria-hidden="true" />
        </main>
      }
    >
      <TelegramChatContent />
    </Suspense>
  );
}
