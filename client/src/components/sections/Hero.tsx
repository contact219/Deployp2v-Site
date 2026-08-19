import { useEffect, useState, type CSSProperties } from "react";
import { ArrowRight, PhoneIncoming, Sparkles, Database, Send, Check } from "lucide-react";

/* ------------------------------------------------------------------
   Living automation flow — the signature hero visual.
   A real DeployP2V pipeline replayed on loop: a missed call comes in
   at 11:42 PM and the agent handles it end-to-end. Product as proof.
   ------------------------------------------------------------------ */

type FlowStep = {
  label: string;
  sub: string;
  done: string;
  Icon: typeof PhoneIncoming;
};

const FLOW_STEPS: FlowStep[] = [
  { label: "New lead", sub: "Missed call · 11:42 PM", done: "Captured", Icon: PhoneIncoming },
  { label: "AI qualifies", sub: "Job type, budget, urgency", done: "Qualified", Icon: Sparkles },
  { label: "CRM updated", sub: "Contact + job card created", done: "Synced", Icon: Database },
  { label: "Reply sent", sub: "Text back to the customer", done: "22 sec", Icon: Send },
];

const STEP_MS = 1400;
const TOTAL_TICKS = FLOW_STEPS.length + 2; // 4 steps + 2 hold ticks before looping

function AutomationFlow() {
  // step = index of the currently-running node; nodes below it are done
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(FLOW_STEPS.length); // static, fully-completed run
      return;
    }
    const id = window.setInterval(() => {
      setStep((s) => (s >= TOTAL_TICKS - 1 ? 0 : s + 1));
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, []);

  const runDone = step >= FLOW_STEPS.length;

  return (
    <div className="glass-card p-5 sm:p-6 w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
      {/* Title bar */}
      <div className="flex items-center justify-between pb-4 hairline-b">
        <span className="font-mono text-xs text-mist-muted truncate">
          {/* Short label on phones so the bar never ellipsizes at 390px */}
          <span className="sm:hidden">lead-response agent</span>
          <span className="hidden sm:inline">deployp2v · lead-response agent</span>
        </span>
        {/* lowercase mono = terminal chrome, not a label — all-caps mono is
            reserved for .eyebrow section labels. The pulsing dot is the
            hero card's only volt mark (volt = action/liveness only). */}
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.14em] text-mist-muted shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-volt animate-pulse-volt" aria-hidden="true" />
          live
        </span>
      </div>

      {/* Flow */}
      <ol className="pt-5" aria-label="Automation run: new lead handled end to end">
        {FLOW_STEPS.map((s, i) => {
          const isDone = i < step;
          const isActive = i === step;
          const { Icon } = s;
          return (
            <li key={s.label} className="relative flex gap-4">
              {/* Node */}
              <div className="flex flex-col items-center">
                <div
                  className={[
                    "w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-500 ease-out-expo shrink-0",
                    isActive
                      ? "border-mist bg-[rgba(246,247,242,0.08)] text-mist shadow-[0_0_24px_rgba(246,247,242,0.2)]"
                      : isDone
                        ? "border-[rgba(246,247,242,0.45)] bg-ink-2 text-mist"
                        : "border-[rgba(246,247,242,0.14)] bg-ink-2 text-mist-muted",
                  ].join(" ")}
                >
                  {isDone ? <Check className="w-[18px] h-[18px]" /> : <Icon className="w-[18px] h-[18px]" />}
                </div>
                {/* Connector with mist fill that chases the run (volt stays
                    reserved for CTAs + the live dot) */}
                {i < FLOW_STEPS.length - 1 && (
                  <div className="w-px flex-1 min-h-[24px] my-1 bg-[rgba(246,247,242,0.14)] relative overflow-hidden">
                    <div
                      className="absolute inset-x-0 top-0 bg-mist transition-all duration-700 ease-out-expo"
                      style={{ height: isDone ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </div>

              {/* Copy */}
              <div className={`pb-5 min-w-0 flex-1 transition-opacity duration-500 ${isDone || isActive ? "opacity-100" : "opacity-60"}`}>
                {/* flex-wrap: at narrow widths the status label drops to its
                    own line intact ("Qualified", never "Qualifi…") */}
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="font-display font-semibold text-mist leading-tight">{s.label}</p>
                  <span
                    className={[
                      "font-mono text-[0.6875rem] sm:text-xs font-medium tracking-wide shrink-0 transition-colors duration-300",
                      isDone ? "text-mist" : isActive ? "text-mist" : "text-mist-muted",
                    ].join(" ")}
                  >
                    {isDone ? s.done : isActive ? "running…" : "queued"}
                  </span>
                </div>
                <p className="text-sm text-mist-muted mt-0.5">{s.sub}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Outcome line */}
      <div className={`hairline-t pt-4 flex items-center justify-between gap-3 transition-opacity duration-500 ${runDone ? "opacity-100" : "opacity-60"}`}>
        <p className="text-sm text-mist-muted">
          Owner asleep. <span className="text-mist font-medium">Lead handled.</span>
        </p>
        <span className="font-mono text-sm font-semibold text-mist shrink-0">≈12 hrs/wk back</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Hero
   ------------------------------------------------------------------ */

function scrollToAnchor(id: string) {
  // scrollIntoView honors the global `scroll-margin-top` on [id] targets
  // (index.css), so anchored headings always clear the sticky nav.
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ONE type treatment for all three stats — same numeral size/weight/
// baseline, same label style, no prefixes, no suffixes, no special
// cases. "1 day" is the whole value ("within one business day" is the
// reply promise used verbatim in LeadCapture — keep them in sync).
const STATS: { value: string; label: string }[] = [
  { value: "5–7", label: "days to go live" },
  { value: "24/7", label: "agents on shift" },
  { value: "1 day", label: "to a fixed quote" },
];

/* Round 5: the one-line trust strip moved OUT of the hero — it now opens
   the light body at the top of AutomationExplorer. Do not re-add proof
   claims, logos, or ratings to the hero. */

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  const reveal = (delay: string, extra = "") => ({
    className: `reveal ${mounted ? "is-visible" : ""} ${extra}`.trim(),
    style: { "--reveal-delay": delay } as CSSProperties,
  });

  return (
    <section id="hero" className="band-ink hero-bg relative overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-40" aria-hidden="true" />

      {/* Hero diet, FINAL FORM (round 6): kicker + H1 + max 2-line subhead
          + ONE primary CTA ("Get my quote", volt) with the 15-min call as
          an inline text link + a quiet one-line price anchor + a single
          3-item stat row. Nothing else — the trust strip opens the light
          body (AutomationExplorer). The hero reads as exactly one screen. */}
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-8 pb-14 md:pt-12 md:pb-16 lg:pt-14 lg:pb-20">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center">
          {/* Copy column */}
          <div>
            <p {...reveal("0ms")}>
              <span className="eyebrow text-mist-muted">
                AI automation for small business · Wylie, TX
              </span>
            </p>

            <h1 {...reveal("90ms", "text-display-xl mt-4 max-w-[21ch]")}>
              {/* nbsp join: "now." may never wrap alone — worst case the line
                  breaks as "The busywork runs" / "itself now." */}
              The busywork <span className="gradient-text">runs itself</span>
              {" "}now.
            </h1>

            {/* Subhead — max two lines at max-w-xl (round-5 hero diet) */}
            <p {...reveal("180ms", "text-lg leading-relaxed text-mist-muted mt-5 max-w-xl")}>
              AI agents that answer your calls, chase your invoices, and follow up on
              every lead — live in 5–7 days. No new software for you to learn.
            </p>

            {/* ONE primary CTA; the 15-min call rides along as an inline
                text link, never a second button (round-5 hero diet). */}
            <div {...reveal("270ms", "flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 mt-7")}>
              <button
                onClick={() => scrollToAnchor("contact")}
                className="btn-volt w-full sm:w-auto"
              >
                Get my quote
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <a
                href="tel:+12146045735"
                className="text-center sm:text-left text-sm font-medium text-mist-muted underline decoration-[rgba(246,247,242,0.35)] underline-offset-4 hover:text-mist hover:decoration-[rgba(246,247,242,0.8)] transition-colors duration-150 whitespace-nowrap"
              >
                or book a free 15-min call
              </a>
            </div>

            {/* Quiet price anchor (round 6): one neutral Inter microline
                directly under the CTA row — every claim in it is used
                verbatim in Pricing/Process ("from $149/mo", "setup
                included", "cancel anytime"). Never a button, never volt. */}
            <p {...reveal("300ms", "caption text-mist-muted mt-3")}>
              from $149/mo &mdash; setup included, cancel anytime
            </p>

            {/* Stat row — three identical cells: one <p> per value, one <p>
                per label, the exact same classes on every cell. There is no
                prefix/suffix machinery left, so the row's rhythm cannot
                break — every value sits at the same size, weight, and
                baseline by construction. */}
            {/* 390px restack (final round): 2+1 — the first two stats share
                the top row with a vertical hairline between them; the third
                takes a full row under a horizontal hairline, so "to a fixed
                quote" never rag-wraps against a divider. At sm+ the original
                three-across row returns unchanged. */}
            <div {...reveal("360ms", "mt-9 grid grid-cols-2 gap-y-5 sm:grid-cols-3 sm:gap-y-0 max-w-xl")}>
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  // min-w-0 lets the caption wrap instead of colliding with
                  // the divider at 390px.
                  className={
                    i === 0
                      ? "min-w-0 pr-3 sm:pr-6"
                      : i === 1
                        ? "min-w-0 border-l border-[rgba(246,247,242,0.14)] pl-3 sm:pl-6"
                        : "min-w-0 col-span-2 border-t border-[rgba(246,247,242,0.14)] pt-5 sm:col-span-1 sm:border-t-0 sm:pt-0 sm:border-l sm:border-[rgba(246,247,242,0.14)] sm:pl-6"
                  }
                >
                  <p className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-mist tabular-nums whitespace-nowrap">
                    {s.value}
                  </p>
                  <p className="caption text-mist-muted mt-1.5">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Visual column — self-center keeps the demo card vertically
              balanced against the text block at every breakpoint */}
          <div {...reveal("240ms", "self-center w-full")}>
            <AutomationFlow />
          </div>
        </div>

      </div>
    </section>
  );
}
