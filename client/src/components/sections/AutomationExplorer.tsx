import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Database,
  HardHat,
  Home,
  MessageSquare,
  PhoneMissed,
  Play,
  Receipt,
  ShoppingCart,
  Star,
  Stethoscope,
  UtensilsCrossed,
  Zap,
  type LucideIcon,
} from "lucide-react";

/* ============================================================
   AutomationExplorer — "What could you automate?"
   Band: mist (per DESIGN.md band #4). Anchor: #explorer.
   Pick a business + a headache → a real deploy-ready recipe
   renders as trigger → AI → a CONCRETE example-output artifact
   (SMS thread / call transcript / calendar strip / ledger),
   with hours-saved math and a CTA that pre-fills #contact via
   window.dispatchEvent(new CustomEvent('dp2v:lead-context')).

   INTEGRITY: every artifact below is SIMULATED demo data and is
   labeled as such in the UI by exactly ONE small pill per card
   ("Example output — simulated"). Phone numbers use the fictional
   555 range. Never swap in real-seeming customers here.
   ============================================================ */

type IndustryId =
  | "contractor"
  | "realtor"
  | "clinic"
  | "ecommerce"
  | "restaurant"
  | "services";

type PainId =
  | "missed-calls"
  | "invoicing"
  | "follow-ups"
  | "scheduling"
  | "reviews"
  | "data-entry";

type StepKind = "trigger" | "ai" | "result";

interface RecipeStep {
  kind: StepKind;
  app: string;
  title: string;
  detail: string;
}

/* ---------- example-output artifacts (all simulated) ---------- */
type ArtifactLine = { who: "in" | "agent" | "sys"; text: string; t?: string };

type RecipeArtifact =
  | { kind: "sms"; contact: string; lines: ArtifactLine[] }
  | { kind: "call"; contact: string; lines: ArtifactLine[] }
  | {
      kind: "calendar";
      day: string;
      slots: { time: string; title: string; isNew?: boolean }[];
      note?: string;
    }
  | { kind: "ledger"; file: string; rows: { l: string; v: string; hot?: boolean }[] }
  | { kind: "email"; subject: string; lines: string[]; status: string };

interface Recipe {
  name: string;
  file: string; // shown as filename in the window chrome, e.g. missed-call-rescue.flow
  steps: [RecipeStep, RecipeStep, RecipeStep];
  artifact: RecipeArtifact;
  hoursSaved: number; // per week
  outcome: string;
}

interface Industry {
  id: IndustryId;
  label: string;
  icon: LucideIcon;
}

interface Pain {
  id: PainId;
  label: string;
  icon: LucideIcon;
}

const INDUSTRIES: Industry[] = [
  { id: "contractor", label: "Contractor", icon: HardHat },
  { id: "realtor", label: "Realtor", icon: Home },
  { id: "clinic", label: "Clinic", icon: Stethoscope },
  { id: "ecommerce", label: "E-commerce", icon: ShoppingCart },
  { id: "restaurant", label: "Restaurant", icon: UtensilsCrossed },
  { id: "services", label: "Prof. services", icon: Briefcase },
];

const PAINS: Pain[] = [
  { id: "missed-calls", label: "Missed calls", icon: PhoneMissed },
  { id: "invoicing", label: "Getting paid", icon: Receipt },
  { id: "follow-ups", label: "Follow-ups", icon: MessageSquare },
  { id: "scheduling", label: "Scheduling", icon: CalendarClock },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "data-entry", label: "Data entry", icon: Database },
];

const step = (kind: StepKind, app: string, title: string, detail: string): RecipeStep => ({
  kind,
  app,
  title,
  detail,
});

const li = (who: ArtifactLine["who"], text: string, t?: string): ArtifactLine => ({ who, text, t });

const RECIPES: Record<IndustryId, Record<PainId, Recipe>> = {
  contractor: {
    "missed-calls": {
      name: "The Missed-Call Rescue",
      file: "missed-call-rescue",
      steps: [
        step("trigger", "Your phone line", "A call rings out while you're on a job", "Ladder, crawlspace, attic — the lead hits voicemail and starts dialing your competitor."),
        step("ai", "DeployP2V agent", "Texts back in under 10 seconds", "Asks what the job is, grabs photos and the address, answers service-area and ballpark questions."),
        step("result", "Your calendar", "Estimate booked before you're off the roof", "A scoped lead with photos in your inbox and a confirmed estimate slot on your calendar."),
      ],
      artifact: {
        kind: "sms",
        contact: "Missed call · (555) 014-2231",
        lines: [
          li("in", "Hi — just called about a roof leak over the garage. Are you taking jobs?", "2:47 PM"),
          li("agent", "Sorry we missed you — the crew's on a roof. Text a photo and your address and I'll get you a fast estimate slot.", "2:47 PM"),
          li("in", "1481 Oak Ln. Photo attached — flashing looks lifted."),
          li("agent", "Got it. Thu 9:00 AM or Fri 1:00 PM for an estimate?"),
          li("in", "Thursday."),
          li("sys", "Estimate booked · Thu 9:00 AM → your calendar"),
        ],
      },
      hoursSaved: 6,
      outcome: "Most missed callers just call the next contractor. Yours won't.",
    },
    invoicing: {
      name: "The Invoice Chaser",
      file: "invoice-chaser",
      steps: [
        step("trigger", "Job tracker", "You mark the job done", "That's it. That's your entire part of this workflow."),
        step("ai", "AI + QuickBooks", "Drafts, sends, and chases the invoice", "Builds the invoice from your estimate, sends it same day, nudges politely on days 3, 7, and 14."),
        step("result", "Your bank account", "Paid without the awkward calls", "You never type “just following up on that invoice” again."),
      ],
      artifact: {
        kind: "ledger",
        file: "invoice-1041 · Oak Ln repair",
        rows: [
          { l: "Invoice drafted from your estimate", v: "day 0 · 4:12 PM" },
          { l: "Sent with payment link", v: "day 0" },
          { l: "Friendly nudge (opened)", v: "day 3" },
          { l: "Paid — $3,850", v: "day 6", hot: true },
        ],
      },
      hoursSaved: 4,
      outcome: "Same-day invoices get paid roughly twice as fast as end-of-month batches.",
    },
    "follow-ups": {
      name: "The Bid Reviver",
      file: "bid-reviver",
      steps: [
        step("trigger", "Your estimates", "A bid sits quiet for 48 hours", "You sent the number. Then — silence."),
        step("ai", "AI agent", "Follows up like you would, but on time", "Texts a friendly nudge that references the actual job, answers questions, offers two start dates."),
        step("result", "Won jobs", "Dead bids come back to life", "Every outstanding estimate gets a yes or a no — nothing rots in your sent folder."),
      ],
      artifact: {
        kind: "sms",
        contact: "Quiet bid · deck estimate",
        lines: [
          li("agent", "Hi! Following up on the $6,200 deck estimate from Tuesday. We could start May 12 or May 26 — any questions I can answer?"),
          li("in", "Does that include staining?"),
          li("agent", "It does — two coats, your color pick."),
          li("in", "Let's do May 12."),
          li("sys", "Bid revived · deposit link sent"),
        ],
      },
      hoursSaved: 3,
      outcome: "Most bids are lost to silence, not price.",
    },
    scheduling: {
      name: "The Crew Dispatcher",
      file: "crew-dispatcher",
      steps: [
        step("trigger", "New booked job", "A job lands on the board", "Now the calendar Tetris starts — normally with six phone calls."),
        step("ai", "AI + your calendar", "Slots it around your crew", "Checks availability, proposes times, confirms with the customer, sends a day-before arrival window."),
        step("result", "Fewer wasted trips", "Everyone shows up knowing the plan", "Reminders kill the “nobody was home” trips."),
      ],
      artifact: {
        kind: "calendar",
        day: "Thursday · crew board",
        slots: [
          { time: "8:00", title: "Crew A — Maple St deck, day 2" },
          { time: "9:30", title: "Estimate — Oak Ln roof", isNew: true },
          { time: "1:00", title: "Crew B — gutter install" },
        ],
        note: "Day-before arrival windows sent · zero wasted trips",
      },
      hoursSaved: 4,
      outcome: "One saved windshield trip a week covers the whole plan.",
    },
    reviews: {
      name: "The Review Machine",
      file: "review-machine",
      steps: [
        step("trigger", "Final payment", "The customer pays their final invoice", "The happiest moment of the job — the perfect time to ask."),
        step("ai", "AI agent", "Asks at exactly the right moment", "Waits a day, texts a personal thank-you with a direct Google review link. Unhappy replies come to you first, quietly."),
        step("result", "Google Business Profile", "A steady drip of 5-star reviews", "You climb local search while competitors beg for reviews once a year."),
      ],
      artifact: {
        kind: "sms",
        contact: "Job closed · final invoice paid",
        lines: [
          li("agent", "Thanks for trusting us with the roof! If you've got 30 seconds, a Google review really helps a small crew: g.page/demo-review"),
          li("in", "Done. Great work — on time both days."),
          li("sys", "5-star review posted · Google Business Profile"),
        ],
      },
      hoursSaved: 2,
      outcome: "Local search is won on review count and recency. Both now compound weekly.",
    },
    "data-entry": {
      name: "The Shoebox Killer",
      file: "shoebox-killer",
      steps: [
        step("trigger", "Your phone camera", "You snap receipts from the truck", "Fuel, materials, that third Home Depot run — photograph and forget."),
        step("ai", "AI vision", "Reads, codes, and files every receipt", "Pulls vendor, amount, and job, then posts the cost to the right job in your sheet or QuickBooks."),
        step("result", "True job costing", "Every job's real margin, live", "Tax season becomes an export, not an archaeology dig."),
      ],
      artifact: {
        kind: "ledger",
        file: "job-costs · Oak Ln roof (live)",
        rows: [
          { l: "Shingles — supplier receipt", v: "$1,240" },
          { l: "Fuel — snapped from the truck", v: "$62" },
          { l: "Dump fee — photo, auto-coded", v: "$85" },
          { l: "Live job margin", v: "38%", hot: true },
        ],
      },
      hoursSaved: 5,
      outcome: "Know which jobs make money before you bid the next one.",
    },
  },
  realtor: {
    "missed-calls": {
      name: "The Showing Saver",
      file: "showing-saver",
      steps: [
        step("trigger", "Sign call / listing inquiry", "A buyer calls while you're mid-showing", "Buyers wait about five minutes, then call the next agent on the list."),
        step("ai", "AI agent", "Answers like your best assistant", "Texts back listing details, fields HOA, square-footage, and school questions, offers showing times."),
        step("result", "Your calendar", "Showings booked while you're busy showing", "Every inquiry gets an instant answer and a slot. You get a clean summary."),
      ],
      artifact: {
        kind: "sms",
        contact: "Sign call · Birch Ct listing",
        lines: [
          li("in", "Hi, is the house on Birch Ct still available?", "6:12 PM"),
          li("agent", "It is — 3bd/2ba, listed at $415k. I can book you a showing: Sat 11 AM or Sun 2 PM?"),
          li("in", "Saturday works. Is there an HOA?"),
          li("agent", "No HOA. You're set for Sat 11:00 AM — details on the way."),
          li("sys", "Showing booked · summary sent to you"),
        ],
      },
      hoursSaved: 5,
      outcome: "Speed-to-lead decides who gets the client. Yours is now ten seconds.",
    },
    invoicing: {
      name: "The Transaction Nudger",
      file: "transaction-nudger",
      steps: [
        step("trigger", "Offer accepted", "A contract goes pending", "Thirty-plus signatures, deadlines, and chase-downs between you and commission."),
        step("ai", "AI coordinator", "Chases every signature and deadline", "Builds the doc checklist, nudges lender, title, and clients before each date — politely, relentlessly."),
        step("result", "On-time closing", "Commission paid without the fire drills", "No more 9 p.m. “did they sign yet?” texts."),
      ],
      artifact: {
        kind: "ledger",
        file: "pending → close · Birch Ct",
        rows: [
          { l: "Inspection scheduled", v: "done · day 3" },
          { l: "Lender docs", v: "nudged today" },
          { l: "Title + escrow", v: "on time" },
          { l: "Closing", v: "on track · 14 days", hot: true },
        ],
      },
      hoursSaved: 5,
      outcome: "The average deal has 30+ chase-downs. Now zero of them are yours.",
    },
    "follow-ups": {
      name: "The Open-House Afterparty",
      file: "open-house-afterparty",
      steps: [
        step("trigger", "Sign-in sheet", "Visitors sign in and walk out", "Most will never hear from an agent again."),
        step("ai", "AI agent", "Follows up the same evening", "Sends a personal note referencing the home they toured, then drips matched listings weekly."),
        step("result", "Your CRM", "Warm buyers stay warm", "Serious buyers self-identify by replying — you call only those."),
      ],
      artifact: {
        kind: "email",
        subject: "Great meeting you at Birch Ct",
        lines: [
          "Thanks for coming to Sunday's open house — here are 3 similar homes in your range.",
          "Want a private showing at any of them? I can set it up this week.",
        ],
        status: "Reply received → tagged hot buyer in your CRM",
      },
      hoursSaved: 4,
      outcome: "The agent who follows up first usually wins the buyer.",
    },
    scheduling: {
      name: "The Showing Coordinator",
      file: "showing-coordinator",
      steps: [
        step("trigger", "Showing request", "A buyer wants in at 6 p.m. Thursday", "Cue the three-way phone tag with the seller."),
        step("ai", "AI coordinator", "Books both sides without you", "Checks the seller's windows, confirms the buyer, sends lockbox or access details, reminds everyone."),
        step("result", "Confirmed showings", "Phone tag is over", "You show up to showings; you don't arrange them."),
      ],
      artifact: {
        kind: "sms",
        contact: "Showing request · Thu 6 PM",
        lines: [
          li("agent", "To seller: a buyer is asking to see Birch Ct Thu at 6:00 PM — OK to show?"),
          li("in", "Fine, as long as they're done by 7."),
          li("agent", "To buyer: you're confirmed for Thu 6:00 PM. Address and parking details attached."),
          li("sys", "Both sides confirmed · reminders queued"),
        ],
      },
      hoursSaved: 4,
      outcome: "Every showing request answered in minutes, even the 10 p.m. ones.",
    },
    reviews: {
      name: "The Referral Engine",
      file: "referral-engine",
      steps: [
        step("trigger", "Closing day", "Keys change hands", "Your happiest client of the month is holding them."),
        step("ai", "AI agent", "Asks while the champagne's still cold", "Sends congratulations plus a Google and Zillow review link, then a 90-day check-in that asks for referrals."),
        step("result", "Reviews + referrals", "Your pipeline feeds itself", "Past clients become your loudest marketing channel — on schedule."),
      ],
      artifact: {
        kind: "sms",
        contact: "Closing day · keys delivered",
        lines: [
          li("agent", "Congratulations on the new home! If I earned it, a quick review helps more families find me: g.page/demo-review"),
          li("in", "You made it painless — posting now."),
          li("sys", "Review posted · 90-day referral check-in scheduled"),
        ],
      },
      hoursSaved: 2,
      outcome: "Referrals close at 4x the rate of cold leads. Ask every single time.",
    },
    "data-entry": {
      name: "The Lead Sorter",
      file: "lead-sorter",
      steps: [
        step("trigger", "Portal lead emails", "Zillow and Realtor.com leads pile up", "Each one is a copy-paste job you'll do “later.”"),
        step("ai", "AI parser", "Files every lead, tagged and scored", "Extracts name, budget, area, and timeline into your CRM with the source tagged."),
        step("result", "A clean CRM", "Zero typing, zero lost leads", "You open a sorted pipeline instead of a cluttered inbox."),
      ],
      artifact: {
        kind: "ledger",
        file: "crm · portal leads (today)",
        rows: [
          { l: "Zillow — 3bd, ~$450k, 0–3 mo", v: "logged · scored 82" },
          { l: "Realtor.com — condo, pre-approved", v: "logged · scored 74" },
          { l: "Duplicate inquiry", v: "merged" },
          { l: "Leads lost to copy-paste", v: "0", hot: true },
        ],
      },
      hoursSaved: 4,
      outcome: "A lead you never logged is a commission you never see.",
    },
  },
  clinic: {
    "missed-calls": {
      name: "The Front-Desk Backup",
      file: "front-desk-backup",
      steps: [
        step("trigger", "Busy line or after hours", "A patient calls and nobody can pick up", "Half of them won't leave a voicemail. They book elsewhere."),
        step("ai", "AI receptionist", "Answers every call, 2 a.m. included", "Books and reschedules visits, answers hours and insurance basics, flags urgent calls to a human immediately."),
        step("result", "Full schedule", "No patient hits a dead end", "Every caller booked, rescheduled, or routed — with a morning summary for your staff."),
      ],
      artifact: {
        kind: "call",
        contact: "after hours · 10:42 PM",
        lines: [
          li("in", "Hi, I need to reschedule my cleaning tomorrow."),
          li("agent", "No problem — I can move you to Tue 3:15 PM or Wed 9:00 AM."),
          li("in", "Tuesday, please."),
          li("sys", "Rescheduled · confirmation texted · front desk briefed at 8 AM"),
        ],
      },
      hoursSaved: 7,
      outcome: "Your front desk goes home at five. Your phone line doesn't have to.",
    },
    invoicing: {
      name: "The Balance Collector",
      file: "balance-collector",
      steps: [
        step("trigger", "Outstanding balance", "A patient balance ages past 30 days", "Paper statements cost money and mostly get ignored."),
        step("ai", "AI agent", "Collects without collections calls", "Texts a friendly reminder with a secure payment link, offers a payment plan, follows up gently."),
        step("result", "Cleared balances", "Revenue in, relationships intact", "Patients pay from their phone in a minute. Nobody gets an awkward call."),
      ],
      artifact: {
        kind: "sms",
        contact: "Balance reminder · $84",
        lines: [
          li("agent", "Hi — a friendly note from the clinic: you have an $84 balance from your March visit. Pay securely here: pay.demo/1123, or reply PLAN for installments."),
          li("in", "Just paid — thanks for the link."),
          li("sys", "Balance cleared · posted to your practice system"),
        ],
      },
      hoursSaved: 5,
      outcome: "Text reminders with payment links get paid 3x more often than mailed statements.",
    },
    "follow-ups": {
      name: "The Recall Engine",
      file: "recall-engine",
      steps: [
        step("trigger", "Care schedule", "A patient is due — six-month cleaning, annual exam", "Recall postcards are where appointments go to die."),
        step("ai", "AI agent", "Reaches out personally, twice", "Texts a friendly reminder with one-tap booking, follows up once more a week later."),
        step("result", "Refilled schedule", "Your existing patients fill your book", "New-patient marketing is expensive. Recall is nearly free."),
      ],
      artifact: {
        kind: "sms",
        contact: "Recall · 6-month cleaning",
        lines: [
          li("agent", "It's been 6 months since your last cleaning — grab a time that fits in one tap: book.demo/slots"),
          li("in", "Booked the 9:40 Tuesday slot."),
          li("sys", "Recall filled · reminders set"),
        ],
      },
      hoursSaved: 4,
      outcome: "Your most profitable appointments are the ones already in your patient list.",
    },
    scheduling: {
      name: "The No-Show Filler",
      file: "no-show-filler",
      steps: [
        step("trigger", "Cancellation", "A 2 p.m. slot opens at 11 a.m.", "An empty chair costs $150–300 and usually stays empty."),
        step("ai", "AI agent", "Works the waitlist instantly", "Texts waitlisted patients in order, first yes takes the slot, confirms and reminds everyone."),
        step("result", "Refilled slot", "Canceled slots refill in minutes", "Confirmations and reminders cut tomorrow's no-shows too."),
      ],
      artifact: {
        kind: "sms",
        contact: "Waitlist · 2:00 PM opening",
        lines: [
          li("sys", "11:04 AM — cancellation: today's 2:00 PM slot is open"),
          li("agent", "A 2:00 PM slot just opened today — want it? First yes takes it."),
          li("in", "Yes! I'll take it."),
          li("sys", "Slot refilled in 7 minutes · reminders sent"),
        ],
      },
      hoursSaved: 6,
      outcome: "Two refilled slots a week is roughly $2,000 a month back.",
    },
    reviews: {
      name: "The Quiet Reputation Builder",
      file: "review-router",
      steps: [
        step("trigger", "Visit complete", "A patient checks out happy", "And then tells exactly no one, unless you ask."),
        step("ai", "AI agent", "Asks the right patients, routes the rest", "Sends a timed review request with a direct link. Complaints route privately to your practice manager first."),
        step("result", "Google Business Profile", "Reviews grow, problems stay private", "New patients pick clinics by stars. Yours keep climbing."),
      ],
      artifact: {
        kind: "sms",
        contact: "Post-visit · review request",
        lines: [
          li("agent", "Thanks for coming in today! Would you share a quick Google review? g.page/demo-review"),
          li("in", "Honestly, the wait was longer than usual."),
          li("agent", "I'm sorry about that — I've passed your note privately to our practice manager, who will follow up."),
          li("sys", "Routed privately · nothing public"),
        ],
      },
      hoursSaved: 2,
      outcome: "73% of patients check reviews before booking. Give them something to find.",
    },
    "data-entry": {
      name: "The Intake Autopilot",
      file: "intake-autopilot",
      steps: [
        step("trigger", "New patient books", "A first visit lands on the schedule", "Normally: clipboard, scribbles, and 15 minutes of retyping."),
        step("ai", "AI intake", "Digitizes intake before they arrive", "Sends digital forms, extracts the answers, and files them into your practice system, flagged for review."),
        step("result", "Ready charts", "Charts complete before patients arrive", "The waiting room clipboard is retired."),
      ],
      artifact: {
        kind: "ledger",
        file: "intake · new patient (Thu 9:00)",
        rows: [
          { l: "Digital forms", v: "sent → done 8:12 PM" },
          { l: "Insurance details", v: "extracted + filed" },
          { l: "Allergy note", v: "flagged for review" },
          { l: "Chart ready before arrival", v: "yes", hot: true },
        ],
      },
      hoursSaved: 5,
      outcome: "Every retyped form is staff time you already paid for once.",
    },
  },
  ecommerce: {
    "missed-calls": {
      name: "The WISMO Deflector",
      file: "wismo-deflector",
      steps: [
        step("trigger", "“Where's my order?”", "The same question, forty times a week", "Email, chat, Instagram DM — all asking for a tracking number."),
        step("ai", "AI support agent", "Answers with live tracking in seconds", "Looks up the order, replies with carrier status and delivery date, escalates real problems to you."),
        step("result", "A quiet inbox", "Support tickets drop by half", "You answer the five conversations that actually need a human."),
      ],
      artifact: {
        kind: "sms",
        contact: "Store chat · order #4821",
        lines: [
          li("in", "hey where is my order?? #4821", "9:14 AM"),
          li("agent", "Checking… it shipped Tuesday via UPS and is out for delivery today by 7 PM. Tracking: 1Z-DEMO-4821."),
          li("in", "oh perfect, thank you!!"),
          li("sys", "Ticket resolved in 41 seconds · no human needed"),
        ],
      },
      hoursSaved: 8,
      outcome: "Order-status questions are ~60% of store support. Automate exactly those.",
    },
    invoicing: {
      name: "The Payment Recoverer",
      file: "payment-recoverer",
      steps: [
        step("trigger", "Failed payment", "A card declines or a wholesale invoice ages", "Silent churn: most customers never even know it failed."),
        step("ai", "AI agent", "Retries, nudges, and chases on schedule", "Retries smartly, sends friendly update-your-card emails, chases B2B invoices at 30 and 45 days."),
        step("result", "Recovered revenue", "Money you'd written off comes back", "Involuntary churn stops being a line item."),
      ],
      artifact: {
        kind: "ledger",
        file: "recovery · this week",
        rows: [
          { l: "Card declined — smart retry", v: "recovered day 2" },
          { l: "Update-your-card emails", v: "2 of 3 recovered" },
          { l: "B2B invoice #88 — 30-day nudge", v: "paid" },
          { l: "Recovered this month", v: "$412", hot: true },
        ],
      },
      hoursSaved: 3,
      outcome: "Most failed payments just need a well-timed nudge, not a new customer.",
    },
    "follow-ups": {
      name: "The Cart Rescuer",
      file: "cart-rescuer",
      steps: [
        step("trigger", "Abandoned cart", "A full cart sits at checkout", "Seven in ten carts die right here."),
        step("ai", "AI agent", "Writes a recovery note a human would send", "Emails naming the exact items, answers sizing and shipping questions, sends one tasteful reminder."),
        step("result", "Recovered orders", "10–15% of carts come back", "Revenue you already earned once, captured the second time."),
      ],
      artifact: {
        kind: "email",
        subject: "Still thinking it over? Your cart's saved",
        lines: [
          "The canvas tote (and 2 more items) are waiting — sizing and shipping answers below.",
          "You're $6 from free shipping, by the way.",
        ],
        status: "Order completed · 22 minutes later",
      },
      hoursSaved: 4,
      outcome: "The cheapest customer to win is the one already holding a full cart.",
    },
    scheduling: {
      name: "The Pickup Concierge",
      file: "pickup-concierge",
      steps: [
        step("trigger", "Local order placed", "A customer picks local pickup or delivery", "Then the where-and-when email chain begins."),
        step("ai", "AI coordinator", "Books the window automatically", "Offers pickup and delivery slots, confirms, sends a ready-for-pickup text the moment it's packed."),
        step("result", "Smooth handoffs", "No more counter pile-ups", "Customers show up on time to orders that are ready."),
      ],
      artifact: {
        kind: "sms",
        contact: "Local pickup · order #4832",
        lines: [
          li("agent", "Your order is packed! Pickup windows today: 2–4 PM or 4–6 PM?"),
          li("in", "4–6 works."),
          li("sys", "Confirmed · ready-on-shelf text sent at 3:58 PM"),
        ],
      },
      hoursSaved: 3,
      outcome: "Every coordination email is margin leaking out of a local order.",
    },
    reviews: {
      name: "The Review Flywheel",
      file: "review-flywheel",
      steps: [
        step("trigger", "Order delivered", "The carrier confirms delivery", "Three days later is the sweet spot to ask."),
        step("ai", "AI agent", "Asks at the sweet spot, with a photo prompt", "Sends a timed request for a review and product photo. Unhappy customers route to support instead."),
        step("result", "Product pages that sell", "Social proof compounds per SKU", "Star ratings do the convincing before your copy has to."),
      ],
      artifact: {
        kind: "sms",
        contact: "Delivered 3 days ago · order #4821",
        lines: [
          li("agent", "How's the tote holding up? Snap a photo review and take 10% off your next order: rev.demo/4821"),
          li("in", "Love it — posted with a pic!"),
          li("sys", "Photo review live on the product page"),
        ],
      },
      hoursSaved: 3,
      outcome: "Products with recent photo reviews convert dramatically better. Feed them.",
    },
    "data-entry": {
      name: "The Channel Sync",
      file: "channel-sync",
      steps: [
        step("trigger", "Orders everywhere", "Shopify, Etsy, and Amazon all ping at once", "Three dashboards, one you, zero single source of truth."),
        step("ai", "AI sync", "Consolidates every order into one ledger", "Normalizes orders into one sheet, decrements inventory, flags low stock before you oversell."),
        step("result", "One source of truth", "Stock and sales reconcile themselves", "You check one screen with your coffee, not three."),
      ],
      artifact: {
        kind: "ledger",
        file: "orders · all channels (today)",
        rows: [
          { l: "Shopify", v: "38 orders" },
          { l: "Etsy", v: "11 orders" },
          { l: "Amazon", v: "24 orders" },
          { l: "Low stock flagged", v: "2 SKUs · reorder drafted", hot: true },
        ],
      },
      hoursSaved: 6,
      outcome: "Overselling a stocked-out item costs you the sale and the review.",
    },
  },
  restaurant: {
    "missed-calls": {
      name: "The Dinner-Rush Line",
      file: "dinner-rush-line",
      steps: [
        step("trigger", "Saturday, 7:04 p.m.", "The phone rings during the rush", "Nobody can grab it. That was a party of six."),
        step("ai", "AI host", "Answers every call, every rush", "Takes reservations, answers hours, parking, and gluten-free questions, texts back any missed call instantly."),
        step("result", "Full tables", "Bookings happen while staff runs food", "The phone stops being a job during service."),
      ],
      artifact: {
        kind: "call",
        contact: "Saturday 7:04 PM · line 2",
        lines: [
          li("in", "Hi, any chance you can fit 6 people tonight around 7:30?"),
          li("agent", "We can seat 6 at 7:45 on the patio, or 8:15 inside — which do you prefer?"),
          li("in", "7:45 on the patio is great."),
          li("sys", "Table booked · confirmation texted · host stand updated"),
        ],
      },
      hoursSaved: 7,
      outcome: "A missed dinner call isn't a call — it's a table of covers walking next door.",
    },
    invoicing: {
      name: "The Supplier Auditor",
      file: "supplier-auditor",
      steps: [
        step("trigger", "Invoice PDFs arrive", "Suppliers email invoices all week", "They go to a folder named “deal with later.”"),
        step("ai", "AI vision", "Reads every line item", "Extracts items and prices into your cost sheet and flags price jumps on your top 20 ingredients."),
        step("result", "Food cost, live", "You catch the 12% chicken hike in week one", "Menu prices adjust on data, not on a bad month."),
      ],
      artifact: {
        kind: "ledger",
        file: "food-cost watch · this week",
        rows: [
          { l: "Produce", v: "flat" },
          { l: "Dairy", v: "−2%" },
          { l: "Chicken breast", v: "+12%" },
          { l: "Price alert → your phone", v: "caught week 1", hot: true },
        ],
      },
      hoursSaved: 4,
      outcome: "Food cost creeps a point at a time. This catches it per invoice.",
    },
    "follow-ups": {
      name: "The Catering Closer",
      file: "catering-closer",
      steps: [
        step("trigger", "Catering inquiry", "“Can you do 40 people on the 14th?”", "Your highest-margin order, sitting in an unread inbox."),
        step("ai", "AI agent", "Replies in minutes with menu + quote", "Sends the catering menu, drafts a quote from your pricing, follows up twice if they go quiet."),
        step("result", "Booked events", "Catering closes on speed", "The first restaurant to quote usually gets the gig. That's you now."),
      ],
      artifact: {
        kind: "email",
        subject: "Catering for 40 on the 14th — yes, here's the menu",
        lines: [
          "Full catering menu attached, plus a drafted quote ($1,240) built from your party size.",
          "If it goes quiet, two friendly follow-ups are already scheduled.",
        ],
        status: "Deposit paid · event booked",
      },
      hoursSaved: 3,
      outcome: "Catering is your best margin. Stop losing it to response time.",
    },
    scheduling: {
      name: "The Shift Filler",
      file: "shift-filler",
      steps: [
        step("trigger", "A call-out", "A server calls out at 3 p.m.", "Cue the group-text scramble before doors open."),
        step("ai", "AI scheduler", "Fills the gap from availability", "Drafts the weekly rota from stated availability, texts open shifts to eligible staff, first yes is confirmed."),
        step("result", "Covered floor", "Shifts fill themselves", "You find out it was handled, not that it happened."),
      ],
      artifact: {
        kind: "sms",
        contact: "Call-out · Saturday 5 PM shift",
        lines: [
          li("sys", "3:02 PM — server call-out, Saturday 5 PM shift open"),
          li("agent", "Open shift Saturday 5–11 PM. First yes takes it — anyone in?"),
          li("in", "I'll take it."),
          li("sys", "Shift covered in 11 minutes · manager notified"),
        ],
      },
      hoursSaved: 5,
      outcome: "The weekly schedule takes managers ~3 hours. Make it a review, not a build.",
    },
    reviews: {
      name: "The Table-Side Reputation",
      file: "table-side-reputation",
      steps: [
        step("trigger", "Check closed", "A reservation wraps or a receipt closes", "Great meal, and they'll forget to say so by the parking lot."),
        step("ai", "AI agent", "Asks — and drafts your replies", "Sends a timed review request, then drafts a reply to every Google review in your voice for one-tap approval."),
        step("result", "A living profile", "Fresh reviews, every one answered", "Diners choosing between two spots pick the one that talks back."),
      ],
      artifact: {
        kind: "sms",
        contact: "Owner approvals · reviews",
        lines: [
          li("sys", "New Google review: “Great pasta, drinks took a while”"),
          li("agent", "Drafted reply in your voice: “Thank you — and fair. We've added a second bartender on weekends. Come see.” Post it?"),
          li("in", "Post it."),
          li("sys", "Reply live · every review answered"),
        ],
      },
      hoursSaved: 3,
      outcome: "An answered one-star review reads better than an ignored four-star one.",
    },
    "data-entry": {
      name: "The Morning Digest",
      file: "morning-digest",
      steps: [
        step("trigger", "Close of night", "The POS closes out", "The numbers exist. Nobody looks until month-end."),
        step("ai", "AI analyst", "Compiles the night while you sleep", "Pulls sales, labor %, comps, and top items into a short digest, flags anything off-trend."),
        step("result", "7 a.m. text", "Yesterday's numbers with your coffee", "You run the restaurant on this week's data, not last month's."),
      ],
      artifact: {
        kind: "ledger",
        file: "7:02 AM digest · last night",
        rows: [
          { l: "Sales", v: "$8,412 (+9%)" },
          { l: "Labor", v: "31%" },
          { l: "Top item", v: "Short rib ragu ×41" },
          { l: "Comps off-trend", v: "flagged", hot: true },
        ],
      },
      hoursSaved: 4,
      outcome: "Labor ran 34% last night. Better to know at 7 a.m. than on the P&L.",
    },
  },
  services: {
    "missed-calls": {
      name: "The Client Qualifier",
      file: "client-qualifier",
      steps: [
        step("trigger", "After-hours call", "A prospect calls at 7:40 p.m.", "Lawyers, accountants, agencies — first responder usually wins the engagement."),
        step("ai", "AI agent", "Answers, qualifies, and books", "Asks about the matter or project, budget, and timeline. Books consults for qualified prospects only."),
        step("result", "Your calendar", "Consults with people worth consulting", "Tire-kickers get a polite FAQ. Real clients get your first open slot."),
      ],
      artifact: {
        kind: "sms",
        contact: "After-hours inquiry · 7:40 PM",
        lines: [
          li("in", "Hi — I need help forming an LLC with a partner. What do you charge?"),
          li("agent", "Happy to help. Two quick questions so the consult is useful: which state, and roughly when do you want to launch?"),
          li("in", "Texas, next month."),
          li("sys", "Qualified · consult booked Thu 10 AM · brief in your inbox"),
        ],
      },
      hoursSaved: 5,
      outcome: "You bill by the hour. Stop spending them on unqualified calls.",
    },
    invoicing: {
      name: "The Receivables Agent",
      file: "receivables-agent",
      steps: [
        step("trigger", "Invoice ages", "An invoice crosses 30 days", "Chasing money from people you like is the worst job you have."),
        step("ai", "AI agent", "Chases at 30, 45, and 60 — politely", "Sends firm-but-friendly reminders with a payment link, escalates only true at-risk accounts to you."),
        step("result", "Shrinking AR", "Paid faster, relationships intact", "The nudges come from “the system,” so the relationship stays yours."),
      ],
      artifact: {
        kind: "sms",
        contact: "Invoice #221 · day 30",
        lines: [
          li("agent", "Friendly reminder from the office: invoice #221 ($4,500) is now 30 days out. Pay here: pay.demo/221 — happy to answer anything."),
          li("in", "Sorry for the delay — processed it this morning."),
          li("sys", "Paid on day 32 · relationship intact"),
        ],
      },
      hoursSaved: 5,
      outcome: "Firms that chase on a schedule get paid weeks earlier. Yours now does.",
    },
    "follow-ups": {
      name: "The Proposal Shepherd",
      file: "proposal-shepherd",
      steps: [
        step("trigger", "Proposal sent", "Then, silence", "Was it price? Timing? Did they even open it?"),
        step("ai", "AI agent", "Nudges with substance, not “bumping this”", "Alerts you when it's opened, follows up with a tailored recap, answers scope questions, offers a call."),
        step("result", "A decision", "Every proposal gets an answer", "Yes, no, or a call — never a ghost."),
      ],
      artifact: {
        kind: "email",
        subject: "Your proposal — recap + your two questions",
        lines: [
          "Noticed it was opened three times yesterday — here's a one-paragraph scope recap plus answers on timeline and licensing.",
          "Want to talk it through? Two slots open Thursday.",
        ],
        status: "Call booked · proposal answered",
      },
      hoursSaved: 3,
      outcome: "Deals rarely die from a follow-up. They die from the fourth day of silence.",
    },
    scheduling: {
      name: "The Calendar Guard",
      file: "calendar-guard",
      steps: [
        step("trigger", "Meeting request", "“Do you have time this week?”", "Eleven emails later, you've traded your only deep-work block."),
        step("ai", "AI scheduler", "Offers slots that protect your focus", "Books around your focus blocks, handles reschedules, sends reminders that cut no-shows."),
        step("result", "A defended week", "Meetings fit your calendar, not vice versa", "Billable hours stay billable."),
      ],
      artifact: {
        kind: "calendar",
        day: "Tuesday · defended",
        slots: [
          { time: "9:00", title: "Deep work — protected block" },
          { time: "11:00", title: "Intro call — qualified lead", isNew: true },
          { time: "2:00", title: "Client workshop" },
        ],
        note: "Reschedules handled · no-show reminders sent",
      },
      hoursSaved: 3,
      outcome: "Scheduling email is unbilled time. All of it.",
    },
    reviews: {
      name: "The Testimonial Collector",
      file: "testimonial-collector",
      steps: [
        step("trigger", "Engagement wraps", "You deliver, the client is thrilled", "That goodwill has a two-week half-life."),
        step("ai", "AI agent", "Captures it before it fades", "Asks for a Google review and a two-line testimonial now, then circles back at 90 days for referrals."),
        step("result", "Proof on record", "Testimonials and referrals on schedule", "Your next proposal ships with fresh receipts."),
      ],
      artifact: {
        kind: "sms",
        contact: "Engagement wrapped · day 2",
        lines: [
          li("agent", "Congrats on the launch! If we earned it, would you share a short Google review and a two-line testimonial we can quote?"),
          li("in", "Gladly — sending both today."),
          li("sys", "Proof captured · 90-day referral follow-up scheduled"),
        ],
      },
      hoursSaved: 2,
      outcome: "Every wrapped project should leave a public trace. Now each one does.",
    },
    "data-entry": {
      name: "The Document Wrangler",
      file: "document-wrangler",
      steps: [
        step("trigger", "Client docs arrive", "Receipts and PDFs dribble in by email", "IMG_2031.jpg, “scan(3).pdf”, forwarded threads."),
        step("ai", "AI filer", "Extracts, renames, and files everything", "Reads each document, names it properly, files it to the right client folder, pings clients for missing items."),
        step("result", "Ordered files", "Every engagement folder complete", "You open a client file and everything is simply there."),
      ],
      artifact: {
        kind: "ledger",
        file: "client-files · engagement folder",
        rows: [
          { l: "scan(3).pdf", v: "→ 2025-03_BankStmt.pdf" },
          { l: "IMG_2031.jpg", v: "→ Receipt_Travel.pdf" },
          { l: "Missing W-9", v: "client pinged" },
          { l: "Folder complete", v: "94%", hot: true },
        ],
      },
      hoursSaved: 6,
      outcome: "Document herding is the least billable hour in your week. Delete it.",
    },
  },
};

/* ---------- panel feeds: trigger feed + agent log per recipe ----------
   Panels 1 and 2 render these as concrete mono consoles so no panel is
   ever an empty card. All simulated demo data (555 numbers, no real
   customers); figures mirror the recipe's own example artifact. */
type FeedItem = { text: string; t?: string };
const fl = (text: string, t?: string): FeedItem => ({ text, t });

const FEEDS: Record<string, { trigger: FeedItem[]; agent: FeedItem[] }> = {
  "missed-call-rescue": {
    trigger: [
      fl("Inbound call · (555) 014-2231", "2:47 PM"),
      fl("Rang 25s — no answer, crew on a roof"),
      fl("Voicemail skipped → agent takes over"),
    ],
    agent: [
      fl("Text sent back in 9 seconds"),
      fl("Extracted: roof leak · 1481 Oak Ln · photo"),
      fl("Offered Thu 9:00 / Fri 1:00 → Thu booked"),
    ],
  },
  "invoice-chaser": {
    trigger: [
      fl("Job marked done · Oak Ln repair", "4:11 PM"),
      fl("Estimate #1041 on file · $3,850"),
      fl("→ invoice workflow started"),
    ],
    agent: [
      fl("Invoice drafted from estimate line items"),
      fl("Sent with payment link · day 0"),
      fl("Nudges queued: day 3 · 7 · 14"),
    ],
  },
  "bid-reviver": {
    trigger: [
      fl("Deck estimate sent Tuesday · $6,200"),
      fl("48 hours · no reply"),
      fl("→ revive sequence started"),
    ],
    agent: [
      fl("Drafted nudge naming the actual job"),
      fl("Answered: staining included, two coats"),
      fl("Offered May 12 / May 26 → May 12 won"),
    ],
  },
  "crew-dispatcher": {
    trigger: [
      fl("New job on the board · Oak Ln estimate"),
      fl("Crew A on Maple St through Thursday"),
      fl("→ finding a slot"),
    ],
    agent: [
      fl("Checked both crew calendars"),
      fl("Proposed Thu 9:30 → customer confirmed"),
      fl("Day-before arrival window queued"),
    ],
  },
  "review-machine": {
    trigger: [
      fl("Final invoice paid · roof job", "Tue"),
      fl("Happiest moment of the job detected"),
      fl("→ review request queued for tomorrow"),
    ],
    agent: [
      fl("Waited one day — asked at the high point"),
      fl("Personal thank-you + direct link sent"),
      fl("Unhappy replies route to you first"),
    ],
  },
  "shoebox-killer": {
    trigger: [
      fl("3 photos snapped from the truck", "5:40 PM"),
      fl("Supplier receipt · fuel · dump fee"),
      fl("→ vision pipeline"),
    ],
    agent: [
      fl("Read vendor, amount, date off each photo"),
      fl("Coded all three to job: Oak Ln roof"),
      fl("Posted → live margin updated"),
    ],
  },
  "showing-saver": {
    trigger: [
      fl("Sign call · Birch Ct listing", "6:12 PM"),
      fl("You're mid-showing — no pickup"),
      fl("→ agent texts back"),
    ],
    agent: [
      fl("Sent beds, baths, price in 8 seconds"),
      fl("Answered: no HOA"),
      fl("Showing booked Sat 11:00 AM"),
    ],
  },
  "transaction-nudger": {
    trigger: [
      fl("Offer accepted · Birch Ct"),
      fl("32 tasks · 6 parties · 21 days to close"),
      fl("→ checklist built"),
    ],
    agent: [
      fl("Inspection + appraisal dates tracked"),
      fl("Nudged lender on doc deadline"),
      fl("Closing on track · day 14"),
    ],
  },
  "open-house-afterparty": {
    trigger: [
      fl("Open house ended · 14 sign-ins", "Sun 4 PM"),
      fl("Names + emails captured from the sheet"),
      fl("→ same-evening follow-up"),
    ],
    agent: [
      fl("Personal note referencing Birch Ct"),
      fl("Matched 3 similar listings per visitor"),
      fl("Reply detected → tagged hot buyer"),
    ],
  },
  "showing-coordinator": {
    trigger: [
      fl("Showing request · Thu 6 PM", "10:02 PM"),
      fl("Seller's showing windows on file"),
      fl("→ coordinating both sides"),
    ],
    agent: [
      fl("Asked the seller — OK, done by 7"),
      fl("Confirmed buyer + access details"),
      fl("Reminders queued for both sides"),
    ],
  },
  "referral-engine": {
    trigger: [
      fl("Closing recorded · keys delivered"),
      fl("Happiest client of the month"),
      fl("→ ask now, not next quarter"),
    ],
    agent: [
      fl("Congrats + review links sent"),
      fl("Review posted same day"),
      fl("90-day referral check-in scheduled"),
    ],
  },
  "lead-sorter": {
    trigger: [
      fl("4 portal emails overnight"),
      fl("Zillow ×2 · Realtor.com ×2"),
      fl("→ parse and file"),
    ],
    agent: [
      fl("Extracted budget, area, timeline"),
      fl("Deduped one repeat inquiry"),
      fl("CRM updated · scored 82 / 74"),
    ],
  },
  "front-desk-backup": {
    trigger: [
      fl("Inbound call · after hours", "10:42 PM"),
      fl("Front desk went home at 5"),
      fl("→ AI receptionist answers"),
    ],
    agent: [
      fl("Reschedule request understood"),
      fl("Offered Tue 3:15 / Wed 9:00 → Tue"),
      fl("Front desk briefed at 8 AM"),
    ],
  },
  "balance-collector": {
    trigger: [
      fl("Balance aged past 30 days · $84"),
      fl("Two paper statements ignored"),
      fl("→ friendly text instead"),
    ],
    agent: [
      fl("Sent secure pay link + PLAN option"),
      fl("Paid from a phone in one minute"),
      fl("Posted to your practice system"),
    ],
  },
  "recall-engine": {
    trigger: [
      fl("Recall due · 6-month cleaning"),
      fl("Patient last seen in March"),
      fl("→ personal outreach"),
    ],
    agent: [
      fl("Texted one-tap booking link"),
      fl("Slot picked: Tue 9:40"),
      fl("Second nudge canceled — not needed"),
    ],
  },
  "no-show-filler": {
    trigger: [
      fl("Cancellation · today 2:00 PM", "11:04 AM"),
      fl("Empty chair ≈ $150–300"),
      fl("→ working the waitlist"),
    ],
    agent: [
      fl("Texted waitlisted patients in order"),
      fl("First yes at 11:11 AM"),
      fl("Slot refilled in 7 minutes"),
    ],
  },
  "review-router": {
    trigger: [
      fl("Visit complete · patient checked out"),
      fl("Timed ask queued"),
      fl("→ request sent"),
    ],
    agent: [
      fl("Review link sent"),
      fl("Complaint detected in the reply"),
      fl("Routed privately — nothing public"),
    ],
  },
  "intake-autopilot": {
    trigger: [
      fl("New patient booked · Thu 9:00"),
      fl("Intake forms outstanding"),
      fl("→ digital intake sent"),
    ],
    agent: [
      fl("Forms completed 8:12 PM"),
      fl("Insurance details extracted + filed"),
      fl("Allergy note flagged for review"),
    ],
  },
  "wismo-deflector": {
    trigger: [
      fl("“where is my order?? #4821”", "9:14 AM"),
      fl("Same question, ~40× a week"),
      fl("→ agent looks it up"),
    ],
    agent: [
      fl("Order #4821 → UPS tracking pulled"),
      fl("Out for delivery by 7 PM — replied"),
      fl("Resolved in 41s · no human needed"),
    ],
  },
  "payment-recoverer": {
    trigger: [
      fl("Card declined · subscription order"),
      fl("The customer doesn't even know"),
      fl("→ recovery sequence"),
    ],
    agent: [
      fl("Smart retry on day 2 — recovered"),
      fl("Update-card emails: 2 of 3 back"),
      fl("B2B #88 nudged at day 30 → paid"),
    ],
  },
  "cart-rescuer": {
    trigger: [
      fl("Cart abandoned at checkout", "8:03 PM"),
      fl("3 items · canvas tote in the cart"),
      fl("→ recovery email drafted"),
    ],
    agent: [
      fl("Named the exact items, human tone"),
      fl("Answered sizing + shipping inline"),
      fl("Order completed 22 minutes later"),
    ],
  },
  "pickup-concierge": {
    trigger: [
      fl("Local pickup order · #4832"),
      fl("Packed and on the shelf"),
      fl("→ booking a window"),
    ],
    agent: [
      fl("Offered 2–4 / 4–6 → 4–6 booked"),
      fl("Ready-on-shelf text at 3:58 PM"),
      fl("Zero counter pile-up"),
    ],
  },
  "review-flywheel": {
    trigger: [
      fl("Delivery confirmed 3 days ago"),
      fl("Sweet spot for the ask"),
      fl("→ photo-review request"),
    ],
    agent: [
      fl("Sent request + 10% next-order code"),
      fl("Photo review posted"),
      fl("Live on the product page"),
    ],
  },
  "channel-sync": {
    trigger: [
      fl("Overnight: 73 orders, 3 channels"),
      fl("Shopify 38 · Etsy 11 · Amazon 24"),
      fl("→ consolidating"),
    ],
    agent: [
      fl("Normalized into one ledger"),
      fl("Inventory decremented per SKU"),
      fl("2 low-stock flags · reorder drafted"),
    ],
  },
  "dinner-rush-line": {
    trigger: [
      fl("Inbound call · line 2", "Fri 7:04 PM"),
      fl("Full rush — nobody can grab it"),
      fl("→ AI host answers"),
    ],
    agent: [
      fl("Party of 6 · tonight around 7:30"),
      fl("Offered 7:45 patio / 8:15 inside"),
      fl("Booked 7:45 · host stand updated"),
    ],
  },
  "supplier-auditor": {
    trigger: [
      fl("3 invoice PDFs arrived this week"),
      fl("214 line items total"),
      fl("→ vision read"),
    ],
    agent: [
      fl("Extracted every item to your cost sheet"),
      fl("Chicken breast +12% — flagged"),
      fl("Alert → your phone, week 1"),
    ],
  },
  "catering-closer": {
    trigger: [
      fl("Catering inquiry · 40 people, the 14th", "9:20 AM"),
      fl("Highest-margin order in the inbox"),
      fl("→ instant reply"),
    ],
    agent: [
      fl("Sent menu + drafted $1,240 quote"),
      fl("Two follow-ups scheduled"),
      fl("Deposit paid · event booked"),
    ],
  },
  "shift-filler": {
    trigger: [
      fl("Server call-out · Saturday 5 PM shift", "3:02 PM"),
      fl("Doors open in two hours"),
      fl("→ texting eligible staff"),
    ],
    agent: [
      fl("Open shift offered — first yes wins"),
      fl("Covered in 11 minutes"),
      fl("Manager notified. That's it."),
    ],
  },
  "table-side-reputation": {
    trigger: [
      fl("New Google review detected"),
      fl("“Great pasta, drinks took a while”"),
      fl("→ reply drafted in your voice"),
    ],
    agent: [
      fl("Draft sent for one-tap approval"),
      fl("You: “Post it.”"),
      fl("Reply live · every review answered"),
    ],
  },
  "morning-digest": {
    trigger: [
      fl("POS closed out", "1:14 AM"),
      fl("Sales, labor, comps pulled"),
      fl("→ compiling the digest"),
    ],
    agent: [
      fl("Sales $8,412 (+9%) · labor 31%"),
      fl("Comps off-trend — flagged"),
      fl("Texted to you at 7:02 AM"),
    ],
  },
  "client-qualifier": {
    trigger: [
      fl("Inbound call", "7:40 PM"),
      fl("Office closed at 5:30"),
      fl("→ agent answers by text"),
    ],
    agent: [
      fl("Matter: LLC formation · TX · next month"),
      fl("Qualified — worth your hour"),
      fl("Consult booked Thu 10 AM + brief"),
    ],
  },
  "receivables-agent": {
    trigger: [
      fl("Invoice #221 hits day 30 · $4,500"),
      fl("A client you like. An awkward call."),
      fl("→ the system chases instead"),
    ],
    agent: [
      fl("Firm-but-friendly reminder + pay link"),
      fl("Paid on day 32"),
      fl("Escalation never needed"),
    ],
  },
  "proposal-shepherd": {
    trigger: [
      fl("Proposal opened 3× yesterday"),
      fl("No reply · day 4 of silence"),
      fl("→ substantive nudge"),
    ],
    agent: [
      fl("Recap + answers on timeline, licensing"),
      fl("Offered two Thursday slots"),
      fl("Call booked · ghost averted"),
    ],
  },
  "calendar-guard": {
    trigger: [
      fl("“Do you have time this week?”"),
      fl("Your deep-work block is at risk"),
      fl("→ guarded scheduling"),
    ],
    agent: [
      fl("Offered slots around focus blocks"),
      fl("Booked Tue 11:00 intro call"),
      fl("Reminders queued · no-shows cut"),
    ],
  },
  "testimonial-collector": {
    trigger: [
      fl("Engagement wrapped · day 2"),
      fl("Goodwill half-life: two weeks"),
      fl("→ capture it now"),
    ],
    agent: [
      fl("Asked for review + 2-line testimonial"),
      fl("Both received same day"),
      fl("90-day referral follow-up set"),
    ],
  },
  "document-wrangler": {
    trigger: [
      fl("4 attachments from client email"),
      fl("scan(3).pdf · IMG_2031.jpg · a thread"),
      fl("→ read, rename, file"),
    ],
    agent: [
      fl("Renamed + filed to the engagement folder"),
      fl("Missing W-9 detected"),
      fl("Client pinged automatically"),
    ],
  },
};

/* ---------- payback math: the VISITOR'S numbers, not ours ----------
   The calculator seeds "hours of busywork" from the selected recipe and
   the rate at a $28 placeholder, but both are the visitor's to edit —
   the computed value is theirs, so no long disclaimer is needed. */
const STARTER_PRICE = 149;
const WEEKS_PER_MONTH = 4.33;

/** Parse a calculator field; NaN/negative → null (renders as em-dash). */
const parseField = (s: string): number | null => {
  const n = parseFloat(s);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/** Format a user-entered number for the shown formula (drop trailing zeros). */
const fmtNum = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 2 });

/* ---------- step visuals ---------- */
const KIND_META: Record<StepKind, { label: string; icon: LucideIcon }> = {
  trigger: { label: "Trigger", icon: Zap },
  ai: { label: "AI agent", icon: Bot },
  result: { label: "Result", icon: CheckCircle2 },
};

function StepCard({
  s,
  index,
  feed,
  playKey,
  reduced,
}: {
  s: RecipeStep;
  index: number;
  feed?: FeedItem[];
  playKey: number;
  reduced: boolean;
}) {
  const meta = KIND_META[s.kind];
  const Icon = meta.icon;
  const isAi = s.kind === "ai";
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
      }}
      className="relative flex h-full flex-col rounded-2xl border border-[var(--hairline-dark-band)] bg-ink-2 p-5"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="eyebrow text-mist-muted">
          0{index + 1} · {meta.label}
        </span>
        {/* Neutral icon chips — volt inside the window is rationed to the
            hours-saved numeral, the live dots, and the CTA. */}
        <span
          className={`flex h-8 w-8 flex-none items-center justify-center rounded-full ${
            isAi ? "bg-ink-3 text-mist" : "bg-ink-3 text-mist-muted"
          }`}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <span className="mb-2 inline-flex w-fit items-center rounded-full bg-ink-3 px-2.5 py-1 font-mono text-[0.6875rem] text-mist-muted">
        {s.app}
      </span>
      <h4 className="font-display text-lg font-semibold leading-snug text-mist">{s.title}</h4>
      <p className="mt-1.5 text-sm leading-relaxed text-mist-muted">{s.detail}</p>
      {feed && (
        /* Console sits directly under the intro copy at CONTENT height —
           no flex stretch, no centered dead band inside the frame. When
           the artifact column runs taller, the leftover space is plain
           card padding below the console, not an oversized console. */
        <div className="pt-4">
          <motion.div
            key={playKey}
            initial={reduced ? "show" : "hidden"}
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: reduced ? 0 : 0.3,
                  delayChildren: reduced ? 0 : isAi ? 0.9 : 0.1,
                },
              },
            }}
            className="overflow-hidden rounded-xl border border-[var(--hairline-dark-band)] bg-ink"
          >
            {/* lowercase mono = terminal chrome; all-caps mono is reserved
                for .eyebrow labels */}
            <div className="flex items-center gap-2 border-b border-[var(--hairline-dark-band)] px-3 py-2 font-mono text-[0.625rem] tracking-[0.12em] text-mist-muted">
              {!isAi && (
                <span
                  className="h-1.5 w-1.5 flex-none rounded-full bg-volt animate-pulse-volt"
                  aria-hidden="true"
                />
              )}
              {isAi ? "agent log" : "trigger feed"}
            </div>
            <div className="flex flex-col gap-2 p-3">
              {feed.map((f, i) => (
                <motion.div
                  key={i}
                  variants={lineVariants}
                  className="flex items-baseline gap-2 font-mono text-[0.6875rem] leading-snug"
                >
                  <span
                    className={`flex-none ${isAi ? "text-mist" : "text-mist-muted"}`}
                    aria-hidden="true"
                  >
                    ▸
                  </span>
                  <span className="min-w-0 flex-1 text-mist">{f.text}</span>
                  {f.t && (
                    <span className="flex-none font-mono text-[0.625rem] text-mist-muted">{f.t}</span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

/* ---------- example-output renderers (all simulated demo data) ---------- */
const lineVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } },
};

function SysChip({ text }: { text: string }) {
  return (
    <motion.div
      variants={lineVariants}
      className="mx-auto flex max-w-full items-center gap-1.5 rounded-full bg-ink-3 px-3 py-1.5 text-center font-mono text-[0.625rem] leading-snug text-mist"
    >
      <span className="h-1 w-1 flex-none rounded-full bg-mist-muted" aria-hidden="true" />
      {text}
    </motion.div>
  );
}

function ArtifactBody({
  artifact,
  playKey,
  reduced,
}: {
  artifact: RecipeArtifact;
  playKey: number;
  reduced: boolean;
}) {
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduced ? 0 : 0.4, delayChildren: reduced ? 0 : 1.7 } },
  };
  const frame = "overflow-hidden rounded-xl border border-[var(--hairline-dark-band)] bg-ink";
  const frameHead =
    "border-b border-[var(--hairline-dark-band)] px-3 py-2 font-mono text-[0.6875rem] text-mist-muted";

  if (artifact.kind === "sms" || artifact.kind === "call") {
    const isCall = artifact.kind === "call";
    return (
      <motion.div
        key={playKey}
        initial={reduced ? "show" : "hidden"}
        animate="show"
        variants={container}
        className={frame}
      >
        <div className={`${frameHead} flex items-center gap-2`}>
          {isCall && (
            <span className="h-1.5 w-1.5 flex-none rounded-full bg-volt animate-pulse-volt" aria-hidden="true" />
          )}
          {/* min-w-0 (not truncate): "Call transcript · …" headers wrap at
              390px instead of ellipsizing */}
          <span className="min-w-0">
            {isCall ? `Call transcript · ${artifact.contact}` : artifact.contact}
          </span>
        </div>
        <div className="flex flex-col gap-2 p-3">
          {artifact.lines.map((m, i) =>
            m.who === "sys" ? (
              <SysChip key={i} text={m.text} />
            ) : isCall ? (
              <motion.div key={i} variants={lineVariants} className="flex gap-2.5">
                <span
                  className={`w-11 flex-none pt-0.5 font-mono text-[0.625rem] uppercase tracking-[0.1em] ${
                    m.who === "agent" ? "text-mist" : "text-mist-muted"
                  }`}
                >
                  {m.who === "agent" ? "AI" : "Caller"}
                </span>
                <span className="text-[0.8125rem] leading-snug text-mist">{m.text}</span>
              </motion.div>
            ) : (
              <motion.div
                key={i}
                variants={lineVariants}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-[0.8125rem] leading-snug ${
                  m.who === "agent"
                    ? "self-end rounded-br-sm bg-mist text-ink"
                    : "self-start rounded-bl-sm bg-ink-3 text-mist"
                }`}
              >
                {m.text}
                {m.t && (
                  <span className="mt-0.5 block font-mono text-[0.5625rem] opacity-60">{m.t}</span>
                )}
              </motion.div>
            ),
          )}
        </div>
      </motion.div>
    );
  }

  if (artifact.kind === "calendar") {
    return (
      <motion.div
        key={playKey}
        initial={reduced ? "show" : "hidden"}
        animate="show"
        variants={container}
        className={frame}
      >
        <div className={frameHead}>{artifact.day}</div>
        <div className="flex flex-col gap-1.5 p-3">
          {artifact.slots.map((slot, i) => (
            <motion.div
              key={i}
              variants={lineVariants}
              className={`flex items-center gap-3 rounded-lg border-l-2 px-3 py-2 ${
                slot.isNew ? "border-mist bg-[rgba(246,247,242,0.08)]" : "border-ink-3 bg-ink-2"
              }`}
            >
              <span className="w-10 flex-none font-mono text-[0.6875rem] text-mist-muted">
                {slot.time}
              </span>
              <span className="min-w-0 flex-1 text-[0.8125rem] leading-snug text-mist">
                {slot.title}
              </span>
              {slot.isNew && (
                <span className="flex-none font-mono text-[0.625rem] uppercase tracking-[0.1em] text-mist">
                  New
                </span>
              )}
            </motion.div>
          ))}
          {artifact.note && <SysChip text={artifact.note} />}
        </div>
      </motion.div>
    );
  }

  if (artifact.kind === "ledger") {
    return (
      <motion.div
        key={playKey}
        initial={reduced ? "show" : "hidden"}
        animate="show"
        variants={container}
        className={frame}
      >
        <div className={frameHead}>{artifact.file}</div>
        <div className="flex flex-col p-1">
          {artifact.rows.map((row, i) => (
            <motion.div
              key={i}
              variants={lineVariants}
              className={`flex items-baseline justify-between gap-3 px-2.5 py-2 ${
                i > 0 ? "border-t border-[var(--hairline-dark-band)]" : ""
              }`}
            >
              <span className="min-w-0 text-[0.8125rem] leading-snug text-mist">{row.l}</span>
              <span
                className={`flex-none text-right font-mono text-[0.75rem] ${
                  row.hot ? "text-mist" : "text-mist-muted"
                }`}
              >
                {row.v}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  // email
  return (
    <motion.div
      key={playKey}
      initial={reduced ? "show" : "hidden"}
      animate="show"
      variants={container}
      className={frame}
    >
      <div className={frameHead}>Sent by your agent · same evening</div>
      <div className="flex flex-col gap-2 p-3">
        <motion.p
          variants={lineVariants}
          className="text-[0.8125rem] font-semibold leading-snug text-mist"
        >
          {artifact.subject}
        </motion.p>
        {artifact.lines.map((l, i) => (
          <motion.p
            key={i}
            variants={lineVariants}
            className="text-[0.8125rem] leading-snug text-mist-muted"
          >
            {l}
          </motion.p>
        ))}
        <SysChip text={artifact.status} />
      </div>
    </motion.div>
  );
}

/** Result slot: the concrete product artifact, labeled as example output. */
function ArtifactCard({
  s,
  artifact,
  playKey,
  reduced,
}: {
  s: RecipeStep;
  artifact: RecipeArtifact;
  playKey: number;
  reduced: boolean;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
      }}
      className="relative flex h-full flex-col rounded-2xl border border-[var(--hairline-dark-band)] bg-ink-2 p-5"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="eyebrow text-mist-muted">03 · Result</span>
        {/* The single "simulated" disclosure for this card — do not add a
            second label below the artifact body. */}
        <span className="caption flex-none rounded-full bg-ink-3 px-2.5 py-1 !text-xs text-mist-muted">
          Example output — simulated
        </span>
      </div>
      <h4 className="font-display text-lg font-semibold leading-snug text-mist">{s.title}</h4>
      <div className="mt-3 flex-1">
        <ArtifactBody artifact={artifact} playKey={playKey} reduced={reduced} />
      </div>
    </motion.div>
  );
}

/** The live wire between steps: hairline with a traveling mist pulse
    (volt inside the window is rationed to the payback numeral, live
    dots, and the CTA). */
function Wire({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.3 } },
      }}
      aria-hidden="true"
      className="relative flex items-center justify-center self-center py-1 lg:h-full lg:px-0.5 lg:py-0"
    >
      {/* vertical wire (mobile) */}
      <span className="relative block h-8 w-px bg-[var(--hairline-dark-band)] lg:hidden">
        {!reduced && (
          <motion.span
            className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-mist"
            style={{ boxShadow: "0 0 8px rgba(246,247,242,0.7)" }}
            animate={{ top: ["-4%", "96%"], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </span>
      {/* horizontal wire (desktop) */}
      <span className="relative hidden h-px w-8 bg-[var(--hairline-dark-band)] lg:block">
        {!reduced && (
          <motion.span
            className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-mist"
            style={{ boxShadow: "0 0 8px rgba(246,247,242,0.7)" }}
            animate={{ left: ["-6%", "94%"], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </span>
    </motion.div>
  );
}

/* ---------- picker chip ---------- */
function Chip({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors duration-150 touch-manipulation ${
        active
          ? "bg-ink text-mist"
          : "card-hairline bg-paper text-ink hover:border-moss"
      }`}
      style={active ? { boxShadow: "0 4px 16px rgba(8,12,22,0.25)" } : undefined}
    >
      {/* Light band (round 4): the active chip is an ink pill, idle chips
          are paper. Icons stay neutral — volt is rationed to CTAs. */}
      <Icon className={`h-4 w-4 flex-none ${active ? "text-mist-muted" : "text-ink-muted"}`} aria-hidden="true" />
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

/* ============================================================
   Section
   ============================================================ */
export default function AutomationExplorer() {
  const [industryId, setIndustryId] = useState<IndustryId>("contractor");
  const [painId, setPainId] = useState<PainId>("missed-calls");
  const [playKey, setPlayKey] = useState(0);
  const reduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  /** Wraps the concrete example output (SMS thread / agent action) — the
      scroll target after a pick. */
  const artifactRef = useRef<HTMLDivElement>(null);
  /** The whole recipe window (chrome bar + headline + steps). When it fits
      under the sticky nav we align IT instead of the artifact, so the
      recipe headline is never sliced by the header at a scroll stop. */
  const windowRef = useRef<HTMLDivElement>(null);
  /** Mini ROI calculator — the visitor's own numbers. Rate defaults to a
      $28 placeholder; hours follow the selected recipe until the visitor
      edits them (null = tracking the recipe), then their number sticks. */
  const [rateStr, setRateStr] = useState("28");
  const [hoursStr, setHoursStr] = useState<string | null>(null);
  /** True only after the user actually clicks a picker chip, so the page
      never auto-scrolls on load (no scroll-trap). */
  const hasPickedRef = useRef(false);

  const industry = INDUSTRIES.find((i) => i.id === industryId) ?? INDUSTRIES[0];
  const pain = PAINS.find((p) => p.id === painId) ?? PAINS[0];
  const recipe = RECIPES[industryId][painId];
  const hoursValue = hoursStr ?? String(recipe.hoursSaved);
  const rate = parseField(rateStr);
  const hours = parseField(hoursValue);
  /* Exact product first; round ONCE at the end for display. The multiple
     comes off the same exact product so both shown numbers agree. */
  const exact = rate !== null && hours !== null ? rate * hours * WEEKS_PER_MONTH : null;
  const dollars = exact !== null ? Math.round(exact) : null;
  const multiple = exact !== null ? exact / STARTER_PRICE : null;
  const replayLabel =
    recipe.artifact.kind === "sms"
      ? "Replay the text conversation"
      : recipe.artifact.kind === "call"
        ? "Replay the call"
        : "Replay the example";

  /* Local scroll-reveal observer — header copy only. The pickers,
     demo card, and stats are never opacity-gated, so the default
     recipe is fully rendered the moment the section is on screen. */
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const els = root.querySelectorAll(".reveal");
    if (typeof IntersectionObserver === "undefined") {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px 240px 0px" },
    );
    els.forEach((el) => {
      // Content already in the viewport must never start hidden.
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add("is-visible");
      } else {
        io.observe(el);
      }
    });
    return () => io.disconnect();
  }, []);

  /* After a pick, bring the first concrete result (the SMS thread / agent
     action card) into view — not the filename bar. Guarded so it never
     fires on initial load, never fights the user when the card is already
     visible, and uses block:"nearest" so it scrolls the minimum distance
     (no scroll-trap). */
  useEffect(() => {
    if (!hasPickedRef.current) return;
    // Wait out the AnimatePresence swap (150ms exit) so we measure the
    // newly mounted recipe, then scroll only if it isn't fully visible.
    const id = window.setTimeout(() => {
      const el = artifactRef.current;
      if (!el) return;
      const NAV = 96; // sticky header (72px) + breathing room — matches scroll-mt-24
      const win = windowRef.current;
      if (win) {
        const w = win.getBoundingClientRect();
        if (w.height <= window.innerHeight - NAV) {
          // Whole recipe fits under the nav (desktop): align the WINDOW,
          // never the artifact, so "The Missed-Call Rescue" headline can't
          // be sliced by the sticky header. Skip if already fully clear.
          if (w.top < NAV || w.bottom > window.innerHeight) {
            win.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
          }
          return;
        }
      }
      const r = el.getBoundingClientRect();
      const fullyVisible = r.top >= NAV && r.bottom <= window.innerHeight;
      if (!fullyVisible) {
        el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest" });
      }
    }, 240);
    return () => window.clearTimeout(id);
  }, [industryId, painId, reduced]);

  const handleBuild = () => {
    window.dispatchEvent(
      new CustomEvent("dp2v:lead-context", {
        detail: {
          source: "automation-explorer",
          industry: industry.label,
          pain: pain.label,
          recipe: recipe.name,
          hoursSavedPerWeek: hours ?? recipe.hoursSaved,
          message: `I run a ${industry.label.toLowerCase()} business and I want the "${recipe.name}" automation for ${pain.label.toLowerCase()}.`,
        },
      }),
    );
    document.getElementById("contact")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <section
      id="explorer"
      ref={sectionRef}
      // Round-5 rhythm: Explorer opens THE light body (Explorer → Pricing,
      // one continuous mist band) — hard edge against the ink TrustBar
      // above (no hairline). The trust strip relocated from the hero sits
      // first; the strip + header together fill the standard band-opening
      // measure. Bottom hands off flush to Services (pb-12 md:pb-14).
      className="band-mist pt-10 md:pt-12 pb-12 md:pb-14"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* ---------- trust strip (moved out of the hero, round 5) ----------
            ONE quiet Inter line. Claims are repo-backed — each stat comes
            from client/src/pages/case-studies.tsx (Premier Properties
            Dallas, Family Medical Center, Artisan Crafts Online) and is
            verifiable on the /case-studies page this line links to. Do NOT
            add logos, star ratings, client counts, or any claim that page
            can't back up. Moss accents only — this is a light surface. */}
        <div className="hairline-b pb-8 md:pb-10">
          <Link
            href="/case-studies"
            className="group block text-center text-sm leading-relaxed text-ink-muted"
            aria-label="Client outcomes — read the case studies"
          >
            <span className="text-ink font-medium">85% faster</span> lead
            response &middot;{" "}
            <span className="text-ink font-medium">15&nbsp;hrs/wk</span> admin
            saved &middot; <span className="text-ink font-medium">80%</span>{" "}
            inquiries auto-resolved &mdash; Texas small businesses you can
            call.{" "}
            <span className="link-moss inline-flex items-center gap-1 whitespace-nowrap">
              Read the case studies
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
          </Link>
        </div>

        {/* ---------- header ---------- */}
        <div className="reveal mx-auto mt-12 md:mt-16 lg:mt-20 max-w-3xl text-center">
          <p className="eyebrow text-ink-muted">Live demo · Real recipes we deploy</p>
          {/* Round-7 headline variety: THE question-form H2 — one single
              question, moss on the mid-sentence phrase (a deliberate echo
              of the hero's "runs itself", moss on light per DESIGN.md —
              volt never sits on mist as text). nowrap keeps the final two
              words from orphaning at 390px. */}
          <h2 className="text-display-lg mt-4">
            What could <span className="text-moss">run itself</span> in{" "}
            <span className="whitespace-nowrap">your business?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-ink-muted">
            Choose your business and your biggest time-sink. This is the exact pipeline we&apos;d
            build for you — live in 5&ndash;7 days, from $149/mo.
          </p>
        </div>

        {/* ---------- pickers (never opacity-gated) — paper card on mist ---------- */}
        <div className="mt-10 rounded-2xl card-hairline bg-paper p-5 sm:p-6 md:mt-12">
          <div className="flex flex-col gap-5">
            <div>
              <p className="eyebrow mb-3 text-ink-muted">01 · Your business</p>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map((i) => (
                  <Chip
                    key={i.id}
                    active={i.id === industryId}
                    label={i.label}
                    icon={i.icon}
                    onClick={() => {
                      hasPickedRef.current = true;
                      setIndustryId(i.id);
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="hairline-t pt-5">
              <p className="eyebrow mb-3 text-ink-muted">02 · Your biggest time-sink</p>
              <div className="flex flex-wrap gap-2">
                {PAINS.map((p) => (
                  <Chip
                    key={p.id}
                    active={p.id === painId}
                    label={p.label}
                    icon={p.icon}
                    onClick={() => {
                      hasPickedRef.current = true;
                      setPainId(p.id);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ---------- recipe window (never opacity-gated) ----------
            Deliberately a DARK product screen on the light band — the one
            ink island here, like the featured pricing card in the other
            light band. Product-as-proof reads as a screenshot. */}
        <div
          ref={windowRef}
          className="mt-6 scroll-mt-24 overflow-hidden rounded-2xl border border-[rgba(8,12,22,0.15)] bg-ink text-mist"
        >
          {/* window chrome */}
          <div className="flex items-center justify-between gap-3 border-b border-[var(--hairline-dark-band)] px-5 py-3.5 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="hidden gap-1.5 sm:flex" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-ink-3" />
                <span className="h-2.5 w-2.5 rounded-full bg-ink-3" />
                <span className="h-2.5 w-2.5 rounded-full bg-ink-3" />
              </span>
              {/* min-w-0 (not truncate): long names wrap at 390px instead of
                  ellipsizing — zero clipped strings on phones */}
              <span className="min-w-0 font-mono text-xs text-mist-muted">
                {recipe.file}.flow
              </span>
            </div>
            {/* lowercase mono = terminal chrome; all-caps mono is reserved
                for .eyebrow labels */}
            <span className="flex flex-none items-center gap-2 font-mono text-[0.6875rem] tracking-[0.14em] text-mist-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-volt animate-pulse-volt" aria-hidden="true" />
              {/* Phones drop the verb so the longest filenames (e.g.
                  open-house-afterparty.flow) never ellipsize at 390px */}
              <span>
                <span className="hidden sm:inline">deploys in </span>5&ndash;7 days
              </span>
            </span>
          </div>

          <div className="p-5 sm:p-6 md:p-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${industryId}:${painId}`}
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduced ? undefined : { opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="font-display text-xl font-semibold text-mist sm:text-2xl">
                  {recipe.name}
                </h3>
                <p className="mt-1 font-mono text-xs text-mist-muted">
                  {industry.label} · {pain.label}
                </p>

                {/* step flow: trigger → AI → concrete example output */}
                <motion.div
                  initial={reduced ? "show" : "hidden"}
                  animate="show"
                  variants={{ show: { transition: { staggerChildren: 0.14 } } }}
                  className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_auto_1.15fr]"
                >
                  <StepCard
                    s={recipe.steps[0]}
                    index={0}
                    feed={FEEDS[recipe.file]?.trigger}
                    playKey={playKey}
                    reduced={reduced}
                  />
                  <Wire reduced={reduced} />
                  <StepCard
                    s={recipe.steps[1]}
                    index={1}
                    feed={FEEDS[recipe.file]?.agent}
                    playKey={playKey}
                    reduced={reduced}
                  />
                  <Wire reduced={reduced} />
                  <div ref={artifactRef} className="min-w-0 scroll-mt-24">
                    <ArtifactCard
                      s={recipe.steps[2]}
                      artifact={recipe.artifact}
                      playKey={playKey}
                      reduced={reduced}
                    />
                  </div>
                </motion.div>

                {/* payback calculator — TWO editable inputs, so the math is
                    the visitor's, not our illustration. Hours re-seed from
                    each recipe until edited; results recompute per keystroke
                    (no animation — instant). Numerals are JetBrains Mono via
                    font-mono. Volt stays rationed to the CTA below. */}
                <div
                  id="explorer-payback"
                  className="mt-6 scroll-mt-24 rounded-2xl border border-[var(--hairline-dark-band)] bg-ink-2 p-5 sm:p-6"
                >
                  <p className="eyebrow mb-4 text-mist-muted">Your payback — your numbers</p>
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-8">
                    <div className="grid flex-none grid-cols-2 gap-3 sm:gap-4 lg:w-[22rem]">
                      <label className="flex min-w-0 flex-col gap-1.5">
                        <span className="caption text-mist-muted">Your hourly rate</span>
                        <span className="flex items-center rounded-lg border border-[var(--hairline-dark-band)] bg-ink px-3 py-2 transition-colors duration-150 focus-within:border-[rgba(246,247,242,0.5)]">
                          <span className="flex-none font-mono text-sm text-mist-muted" aria-hidden="true">
                            $
                          </span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={rateStr}
                            onChange={(e) => setRateStr(e.target.value.replace(/[^\d.]/g, ""))}
                            aria-label="Your hourly rate in dollars"
                            data-testid="input-hourly-rate"
                            className="w-full min-w-0 bg-transparent px-1.5 font-mono text-base text-mist outline-none"
                          />
                          <span className="flex-none font-mono text-[0.6875rem] text-mist-muted">/hr</span>
                        </span>
                      </label>
                      <label className="flex min-w-0 flex-col gap-1.5">
                        <span className="caption text-mist-muted">Busywork per week</span>
                        <span className="flex items-center rounded-lg border border-[var(--hairline-dark-band)] bg-ink px-3 py-2 transition-colors duration-150 focus-within:border-[rgba(246,247,242,0.5)]">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={hoursValue}
                            onChange={(e) => setHoursStr(e.target.value.replace(/[^\d.]/g, ""))}
                            aria-label="Hours of busywork per week"
                            data-testid="input-busywork-hours"
                            className="w-full min-w-0 bg-transparent pr-1.5 font-mono text-base text-mist outline-none"
                          />
                          <span className="flex-none font-mono text-[0.6875rem] text-mist-muted">hrs/wk</span>
                        </span>
                      </label>
                    </div>
                    {/* Live result — recomputes on every keystroke. aria-live
                        so screen readers hear the updated total. */}
                    <p
                      aria-live="polite"
                      className="min-w-0 flex-1 border-t border-[var(--hairline-dark-band)] pt-4 text-sm leading-relaxed text-mist-muted lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"
                    >
                      <span className="font-mono text-2xl font-semibold tracking-tight text-mist sm:text-3xl">
                        = {dollars !== null ? `$${dollars.toLocaleString("en-US")}` : "$—"}
                      </span>
                      <span>/mo of your time</span>
                      <span aria-hidden="true"> · </span>
                      <span className="font-mono text-2xl font-semibold tracking-tight text-mist sm:text-3xl">
                        {multiple !== null ? `${multiple.toFixed(1)}×` : "—×"}
                      </span>
                      <span> the ${STARTER_PRICE} Starter plan</span>
                    </p>
                  </div>
                  {/* Shown math + ONE reassurance line — both INSIDE this
                      card so neither can clip at a viewport fold. The formula
                      is computed from the live inputs above, rounded once at
                      the end; do not add more hedging here. */}
                  <div className="mt-4 border-t border-[var(--hairline-dark-band)] pt-3">
                    {rate !== null &&
                      hours !== null &&
                      dollars !== null &&
                      multiple !== null && (
                        <p
                          data-testid="text-payback-formula"
                          className="font-mono text-xs leading-relaxed text-mist-muted"
                        >
                          ${fmtNum(rate)}/hr &times; {fmtNum(hours)} hrs/wk &times;{" "}
                          {WEEKS_PER_MONTH} wks &asymp; $
                          {dollars.toLocaleString("en-US")}/mo &middot;{" "}
                          {multiple.toFixed(1)}&times; the ${STARTER_PRICE} Starter
                        </p>
                      )}
                    <p className="caption mt-2 text-mist-muted">
                      Your fit call turns this into a fixed quote.
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-mist-muted">{recipe.outcome}</p>

                {/* CTA row: build it, or replay the in-page demo first.
                    lg:pr-16 keeps the row clear of the fixed chat bubble
                    (~80px square, bottom-right) at every desktop width. */}
                <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:pr-16">
                  <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={handleBuild}
                      className="btn-volt w-full sm:w-auto"
                      data-testid="button-build-this"
                    >
                      Get my quote for this
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlayKey((k) => k + 1)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--hairline-dark-band)] px-6 py-3 text-sm font-medium text-mist transition-colors duration-150 hover:border-[rgba(246,247,242,0.5)] sm:w-auto"
                      data-testid="button-replay-demo"
                    >
                      <Play className="h-4 w-4 text-mist-muted" aria-hidden="true" />
                      {replayLabel}
                    </button>
                  </div>
                  <p className="caption text-center text-mist-muted lg:text-right">
                    <a
                      href="tel:+12146045735"
                      className="underline decoration-[rgba(246,247,242,0.35)] underline-offset-4 transition-colors duration-150 hover:text-mist"
                    >
                      Book a free 15-min call
                    </a>{" "}
                    · (214) 604-5735 · Wylie, TX
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
