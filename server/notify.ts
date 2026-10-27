/**
 * Owner notifications.
 *
 * Telegram rather than email on purpose: the account already exists and is in
 * daily use, there is no domain to verify, and a lead alert lands in seconds.
 * Every function here is best-effort — a notification failure must never break
 * the visitor-facing request that triggered it.
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export function telegramConfigured(): boolean {
  return Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID);
}

export async function sendTelegram(text: string): Promise<boolean> {
  if (!telegramConfigured()) {
    console.warn("[notify] Telegram not configured (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID) — alert skipped");
    return false;
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      },
    );

    if (!res.ok) {
      console.error("[notify] Telegram send failed:", res.status, (await res.text()).slice(0, 300));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[notify] Telegram send error:", err);
    return false;
  }
}
