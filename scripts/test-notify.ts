import { sendTelegram, telegramConfigured } from "../server/notify.ts";

console.log("telegram configured:", telegramConfigured());

const ok = await sendTelegram(
  [
    "✅ <b>DeployP2V lead alerts are live</b>",
    "",
    "This is a test from the setup. A real enquiry will look like this:",
    "",
    "<b>Jane Smith</b> · Smith Roofing",
    "✉️ jane@smithroofing.com",
    "📞 (214) 555-0142",
    "",
    "“We keep missing calls when the crew is on a roof — can you help?”",
    "",
    "Source: website form · contact #38",
    "CRM lead #1 · score 78 · urgency high",
    "",
    "Nothing to do — just confirming it reaches you.",
  ].join("\n"),
);

console.log("message sent:", ok);
