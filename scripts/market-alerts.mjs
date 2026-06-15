import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

loadDotEnv(resolve(process.cwd(), ".env.local"));
loadDotEnv(resolve(process.cwd(), ".env"));

const configPath = resolve(process.cwd(), process.env.MARKET_ALERTS_CONFIG || "market-alerts.json");
const statePath = resolve(process.cwd(), process.env.MARKET_ALERT_STATE || ".market-alert-state.json");
const intervalMs = Math.max(Number(process.env.MARKET_ALERT_INTERVAL_SECONDS || 60), 15) * 1000;
const dryRun = process.env.MARKET_ALERT_DRY_RUN === "true";
const runOnce = process.env.MARKET_ALERT_RUN_ONCE === "true";
const defaultHermesCommand = "/Users/hang/.hermes/hermes-agent/venv/bin/hermes";

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  const alerts = readAlerts(configPath);

  if (alerts.length === 0) {
    throw new Error(`No alerts found in ${configPath}`);
  }

  if (!dryRun) validateNotificationTarget();
  console.log(`Watching ${alerts.length} Yahoo Finance alert(s). Polling every ${intervalMs / 1000}s.`);
  if (dryRun) console.log("Dry run enabled. Notifications will be printed instead of sent.");

  await checkAlerts(alerts);
  if (runOnce) return;

  setInterval(() => {
    checkAlerts(alerts).catch((error) => console.error("Alert check failed:", error.message));
  }, intervalMs);
}

async function checkAlerts(alerts) {
  const state = readState(statePath);
  const symbols = [...new Set(alerts.map((alert) => alert.symbol.toUpperCase()))];
  const quotes = await fetchQuotes(symbols);

  for (const alert of alerts) {
    const symbol = alert.symbol.toUpperCase();
    const quote = quotes.get(symbol);

    if (!quote || typeof quote.price !== "number") {
      console.warn(`No price returned for ${symbol}`);
      continue;
    }

    const key = alertKey(alert);
    const reached = hasReachedTarget(quote.price, alert.target, alert.direction);

    if (reached && !state[key]?.notified) {
      await sendNotification({
        alert,
        quote,
        message: formatAlertMessage(alert, quote)
      });
      state[key] = {
        notified: true,
        notifiedAt: new Date().toISOString(),
        price: quote.price
      };
      writeState(statePath, state);
      continue;
    }

    if (!reached && state[key]?.notified) {
      state[key] = {
        ...state[key],
        notified: false,
        resetAt: new Date().toISOString(),
        price: quote.price
      };
      writeState(statePath, state);
    }

    console.log(`${symbol}: ${quote.price} ${quote.currency || ""} (${alert.direction} ${alert.target})`);
  }
}

async function fetchQuotes(symbols) {
  const entries = await Promise.all(symbols.map(async (symbol) => [symbol, await fetchChartQuote(symbol)]));
  return new Map(entries);
}

async function fetchChartQuote(symbol) {
  const url = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`);
  url.searchParams.set("range", "1d");
  url.searchParams.set("interval", "1m");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Yahoo Finance returned ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const result = data?.chart?.result?.[0];
  const meta = result?.meta || {};
  const price = meta.regularMarketPrice ?? latestClose(result);

  return {
    symbol: meta.symbol || symbol,
    name: meta.longName || meta.shortName || meta.symbol || symbol,
    price,
    currency: meta.currency,
    marketTime: meta.regularMarketTime
  };
}

function latestClose(result) {
  const closes = result?.indicators?.quote?.[0]?.close || [];
  for (let index = closes.length - 1; index >= 0; index -= 1) {
    if (typeof closes[index] === "number") return closes[index];
  }
  return undefined;
}

async function sendNotification(payload) {
  if (dryRun) {
    console.log(`Dry run notification:\n${payload.message}`);
    return;
  }

  if (hasHermesSend()) {
    await sendViaHermes(payload.message);
    console.log(`Sent Hermes alert for ${payload.alert.symbol.toUpperCase()}`);
    return;
  }

  const hermesWebhookUrl = process.env.HERMES_WEBHOOK_URL;

  if (hermesWebhookUrl) {
    await postJson(hermesWebhookUrl, {
      source: "yahoo-finance",
      type: "market.price_alert",
      text: payload.message,
      symbol: payload.alert.symbol.toUpperCase(),
      target: payload.alert.target,
      direction: payload.alert.direction,
      price: payload.quote.price,
      currency: payload.quote.currency,
      quote: payload.quote,
      alert: payload.alert,
      timestamp: new Date().toISOString()
    });
    console.log(`Sent Hermes alert for ${payload.alert.symbol.toUpperCase()}`);
    return;
  }

  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;

  if (telegramBotToken && telegramChatId) {
    const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
    await postJson(url, {
      chat_id: telegramChatId,
      text: payload.message,
      disable_web_page_preview: true
    });
    console.log(`Sent Telegram alert for ${payload.alert.symbol.toUpperCase()}`);
  }
}

async function sendViaHermes(message) {
  const command = process.env.HERMES_SEND_CMD || defaultHermesCommand;
  const target = process.env.HERMES_SEND_TARGET || "telegram";

  await execFileAsync(command, ["send", "--to", target, "--quiet", message], {
    timeout: 30000,
    maxBuffer: 1024 * 1024
  });
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Notification post failed: ${response.status} ${response.statusText} ${text}`);
  }
}

function readAlerts(path) {
  if (!existsSync(path)) {
    throw new Error(`Missing alert config at ${path}. Copy market-alerts.example.json to market-alerts.json.`);
  }

  const alerts = JSON.parse(readFileSync(path, "utf8"));

  if (!Array.isArray(alerts)) {
    throw new Error("Market alerts config must be a JSON array.");
  }

  return alerts.map((alert) => ({
    symbol: requiredString(alert.symbol, "symbol").toUpperCase(),
    target: requiredNumber(alert.target, "target"),
    direction: normalizeDirection(alert.direction),
    label: typeof alert.label === "string" ? alert.label : undefined
  }));
}

function readState(path) {
  if (!existsSync(path)) return {};
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeState(path, state) {
  writeFileSync(path, `${JSON.stringify(state, null, 2)}\n`);
}

function formatAlertMessage(alert, quote) {
  const directionText = alert.direction === "above" ? "at or above" : "at or below";
  const label = alert.label || `${alert.symbol.toUpperCase()} price alert`;
  const price = formatMoney(quote.price, quote.currency);
  const target = formatMoney(alert.target, quote.currency);

  return `${label}\n${quote.name} (${quote.symbol}) is ${price}, ${directionText} ${target}.`;
}

function formatMoney(value, currency) {
  const currencySymbol = currency === "USD" ? "$" : currency ? `${currency} ` : "";
  return `${currencySymbol}${Number(value).toFixed(2)}`;
}

function hasReachedTarget(price, target, direction) {
  return direction === "below" ? price <= target : price >= target;
}

function alertKey(alert) {
  return `${alert.symbol.toUpperCase()}:${alert.direction}:${alert.target}`;
}

function normalizeDirection(direction = "above") {
  if (direction === "above" || direction === "below") return direction;
  throw new Error('Alert direction must be "above" or "below".');
}

function requiredString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Alert ${field} must be a non-empty string.`);
  }
  return value.trim();
}

function requiredNumber(value, field) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`Alert ${field} must be a number.`);
  }
  return number;
}

function validateNotificationTarget() {
  if (hasHermesSend()) return;
  if (process.env.HERMES_WEBHOOK_URL) return;
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) return;

  throw new Error(
    "Set HERMES_SEND_CMD/HERMES_SEND_TARGET, HERMES_WEBHOOK_URL, or both TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID."
  );
}

function hasHermesSend() {
  return Boolean(process.env.HERMES_SEND_CMD || process.env.HERMES_SEND_TARGET || existsSync(defaultHermesCommand));
}

function loadDotEnv(path) {
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!match || match[1].startsWith("#") || process.env[match[1]] !== undefined) continue;

    let value = match[2] || "";
    value = value.replace(/^['"]|['"]$/g, "");
    process.env[match[1]] = value;
  }
}
