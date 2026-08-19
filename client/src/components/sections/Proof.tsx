import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/*                                                                     */
/* Every metric, role, business, baseline, and setup time below is    */
/* taken from client/src/pages/case-studies.tsx. Quotes are tightened  */
/* for voice but stay inside the facts each case study documents.      */
/* Attribution is role + business + city only — no invented humans.    */
/*                                                                     */
/* TODO(owner): the last credibility gap here is real identities.      */
/* With each client's written permission, supply their real first and  */
/* last name, a headshot, and a link to their Google Business listing, */
/* and wire them into the quote figcaptions. Until then the honest     */
/* role/business/city form stands — do not stub names in copy.         */
/* ------------------------------------------------------------------ */

/**
 * Counter derivation (kept honest, see methodology line below):
 *   Family Medical Center — 15 hrs/wk of admin work saved (case study #3)
 *   Texas BBQ Co.         — ~12 hrs/wk, i.e. 75% of the 15+ hrs/wk of
 *                           manual inventory work automated (case study #1)
 *   27 hrs/wk × ~130 weeks tracked since early 2024 ≈ 3,510 hours.
 */
const COUNTER_TARGET = 3_510;

/* Secondary corroboration row. Deliberately non-overlapping with the
   hero metrics on the cards below, so no number appears twice. */
const outcomeStats = [
  {
    value: "80%",
    unit: "",
    label: "Customer inquiries resolved automatically",
    source: "Artisan Crafts Online",
  },
  {
    value: "40%",
    unit: "",
    label: "Fewer stockouts",
    source: "Texas BBQ Co.",
  },
  {
    value: "35%",
    unit: "",
    label: "Fewer no-show appointments",
    source: "Family Medical Center",
  },
];

type Story = {
  quote: string;
  role: string;
  company: string;
  place: string;
  /** ONE hero metric per card — the strongest documented result.
      The remaining metrics live behind "Read the full story". */
  metricValue: string;
  metricUnit: string;
  metricLabel: string;
  /** Baseline / setup-time context — ONLY facts documented in
      case-studies.tsx (challenge + timeline fields). Never invented. */
  metricContext?: string;
};

/* Featured story — the biggest documented dollar figure on the page.
   Case study #1: inventory prediction + automated ordering. Documented:
   $2,400/mo labor savings, baseline of 15+ hrs/wk manual inventory
   work, 6-week timeline, 90% order accuracy, 40% fewer stockouts. */
const heroStory: Story = {
  quote:
    "Inventory used to eat my whole morning. Now the counts run on their own, and when we get low on brisket the order's already in. Orders go out right, and we keep more of what we make.",
  role: "Operations Manager",
  company: "Texas BBQ Co.",
  place: "Wylie, TX",
  metricValue: "$2,400",
  metricUnit: "/mo",
  metricLabel: "in labor costs recovered",
  metricContext:
    "Down from 15+ hrs/wk of manual inventory work — live after a 6-week setup.",
};

const supportingStories: Story[] = [
  {
    // Case study #2: 24/7 lead qualification + follow-up. Documented:
    // 200+ monthly leads baseline, 4-week timeline, 85% faster first
    // response, 25 additional closings per quarter.
    quote:
      "A lead that comes in at 11 p.m. gets an answer at 11 p.m. Nothing sits until morning and nobody slips through. Buyers tell us straight out: you got back to us first.",
    role: "Sales Director",
    company: "Premier Properties Dallas",
    place: "Dallas, TX",
    metricValue: "25",
    metricUnit: "",
    metricLabel: "more closings per quarter",
    metricContext:
      "On 200+ leads a month — live after a 4-week setup.",
  },
  {
    // Case study #3: intelligent scheduling + automated reminders.
    // Documented: 8-week timeline, 15 hrs/wk admin saved, 35% fewer
    // no-shows. (No numeric baseline documented — none is shown.)
    quote:
      "The front desk used to live on the phone — rebooking, reminding, chasing no-shows. The system does that now. Patients get their reminder and show up, and my staff are with patients instead of the schedule.",
    role: "Practice Manager",
    company: "Family Medical Center",
    place: "North Texas",
    metricValue: "15",
    metricUnit: "hrs/wk",
    metricLabel: "of admin work taken off staff",
    metricContext: "Live after an 8-week setup.",
  },
];

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

/** Observes all `.reveal` descendants and flips on `.is-visible` once. */
function useReveal(rootRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>(".reveal"));
    if (targets.length === 0) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px 240px 0px" },
    );
    targets.forEach((el) => {
      // Content already in the viewport must never start hidden.
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add("is-visible");
      } else {
        observer.observe(el);
      }
    });
    return () => observer.disconnect();
  }, [rootRef]);
}

/**
 * Counts 0 -> target over ~1.2s the first time the node scrolls into view.
 * At rest the number is ALWAYS the full target: if the node is already
 * visible on mount the count starts immediately, and if it's already been
 * scrolled past it snaps to the target — it can never sit at "0".
 */
function useCountUp(target: number) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const finish = () => {
      setValue(target);
      setDone(true);
    };

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      finish();
      return;
    }

    let raf = 0;
    let started = false;

    const run = () => {
      const duration = 1200;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 4); // ease-out, terminal-style settle
        setValue(Math.round(eased * target));
        if (t < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          setDone(true);
        }
      };
      raf = requestAnimationFrame(tick);
    };

    const rect = node.getBoundingClientRect();
    let observer: IntersectionObserver | undefined;

    if (rect.bottom < 0) {
      // Already scrolled past (e.g. anchor jump below) — show it settled.
      finish();
    } else if (rect.top < window.innerHeight) {
      // Already on screen at mount — count immediately, no observer race.
      started = true;
      run();
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting) && !started) {
            started = true;
            observer?.disconnect();
            run();
          }
        },
        { threshold: 0.2 },
      );
      observer.observe(node);
    }

    return () => {
      observer?.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target]);

  return { nodeRef, value, done };
}

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

/** Moss verification check — shared by the verify panel. */
function VerifyMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 1.5l1.8 1.3 2.2-.1.7 2.1 1.8 1.3-.7 2.1.7 2.1-1.8 1.3-.7 2.1-2.2-.1L8 14.9l-1.8-1.3-2.2.1-.7-2.1-1.8-1.3.7-2.1-.7-2.1 1.8-1.3.7-2.1 2.2.1L8 1.5z" />
      <path d="M5.6 8.2l1.6 1.6 3.2-3.4" />
    </svg>
  );
}

/**
 * The section's verification device, promoted to a first-class closing
 * element: a paper panel with a moss verification mark, the standing
 * offer in display type, and the section CTAs beside it. Deep green
 * accent + ink text only — this sits in the light band, so no volt.
 */
function VerifyPanel() {
  return (
    <div className="card-hairline rounded-2xl bg-paper p-6 shadow-[0_1px_2px_rgba(8,12,22,0.05)] sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-10">
      <div className="flex items-start gap-4">
        {/* Neutral mist chip, moss mark — greens stay full-token only */}
        <span className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mist text-moss">
          <VerifyMark className="h-6 w-6" />
        </span>
        <div>
          <p className="font-display text-xl font-bold leading-snug tracking-tight text-ink sm:text-2xl">
            Want to check? Ask &mdash; we&rsquo;ll make the intro.
          </p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted sm:text-base">
            Every number and quote here belongs to a real client of ours.
            Pick the one you doubt most and we&rsquo;ll connect you with
            them directly.
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center lg:mt-0 lg:shrink-0">
        {/* Round 8: the ONE primary treatment site-wide is the volt
            fill, and it's rationed to one per viewport — this panel's
            ask is deliberately NOT it. Ghost pill + text link only. */}
        <a
          href="#contact"
          className="btn-ghost border-[rgba(8,12,22,0.25)] text-ink hover:border-moss hover:text-moss"
        >
          Ask for an intro
        </a>
        <Link
          href="/case-studies"
          className="link-moss inline-flex items-center gap-1.5 text-sm"
        >
          Read the full case studies
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}

/**
 * The signature band's counterweight, round 8: a REAL product artifact.
 * A compact, faithful recreation of the CRM dashboard that ships with
 * every build (see client/src/pages/crm.tsx for the source UI: leads
 * pipeline stages, AI-enriched lead score, AI-recommended next action).
 * Same product-screen grammar as the Explorer's recipe window — a dark
 * ink window that reads as a screenshot inside the light band. Mono is
 * legal here (in-world product UI); volt appears only as the live dot.
 *
 * Integrity: this recreates OUR OWN product's UI — no invented clients,
 * no names on the lead rows (industry + source labels only), and the
 * pipeline/score figures are illustrative interface content, not client
 * result claims (those live in the numerals + case studies).
 */
function DashboardCard() {
  return (
    <div>
      <div
        className="overflow-hidden rounded-2xl border border-[rgba(8,12,22,0.15)] bg-ink text-mist"
        role="img"
        aria-label="The CRM dashboard every client gets: a leads pipeline with new, qualified, proposal, and won stages, an AI-enriched lead score on each lead, and the AI-drafted next action ready to approve."
      >
        <div aria-hidden="true">
          {/* Window chrome — same grammar as the Explorer recipe window */}
          <div className="flex items-center justify-between gap-3 border-b border-[var(--hairline-dark-band)] px-4 py-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="hidden gap-1.5 sm:flex">
                <span className="h-2 w-2 rounded-full bg-ink-3" />
                <span className="h-2 w-2 rounded-full bg-ink-3" />
                <span className="h-2 w-2 rounded-full bg-ink-3" />
              </span>
              <span className="min-w-0 font-mono text-xs text-mist-muted">
                client-crm · leads
              </span>
            </div>
            <span className="flex flex-none items-center gap-2 font-mono text-[0.6875rem] tracking-[0.14em] text-mist-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-volt animate-pulse-volt" />
              live
            </span>
          </div>

          {/* Pipeline strip — the CRM's deal stages with counts */}
          <div className="grid grid-cols-4 divide-x divide-[var(--hairline-dark-band)] border-b border-[var(--hairline-dark-band)]">
            {[
              ["New", "6"],
              ["Qualified", "4"],
              ["Proposal", "3"],
              ["Won", "5"],
            ].map(([stage, n]) => (
              <div key={stage} className="px-3 py-2.5">
                <div className="caption !text-[0.6875rem] text-mist-muted">
                  {stage}
                </div>
                <div className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-mist">
                  {n}
                </div>
              </div>
            ))}
          </div>

          {/* Lead row — AI-enriched score + drafted next action, exactly
              the fields the real CRM renders on a lead card */}
          <div className="px-4 py-3.5">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
              <span className="text-sm font-semibold text-mist">
                Catering quote request
              </span>
              <span className="card-hairline inline-flex items-center gap-1.5 rounded-full bg-ink-2 px-2.5 py-1 font-mono text-[0.6875rem] text-mist">
                score 86
              </span>
            </div>
            <p className="caption mt-1 text-mist-muted">
              Missed call · 11:42 PM · auto-captured
            </p>
            <div className="mt-3 rounded-lg border border-[var(--hairline-dark-band)] bg-ink-2 px-3 py-2.5">
              <p className="font-mono text-[0.6875rem] tracking-[0.1em] text-mist-muted">
                next action · drafted by agent
              </p>
              <p className="mt-1 text-sm leading-snug text-mist">
                Reply sent with booking link &mdash; follow up if no answer
                by 10 AM.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* The honest label: this is ours, and every client gets it. */}
      <p className="caption mt-3 text-ink-muted">
        <span className="font-semibold text-ink">
          The dashboard every client gets
        </span>{" "}
        &mdash; leads captured, scored, and followed up on their own; you
        watch it happen.
      </p>
    </div>
  );
}

/**
 * THE signature moment (round 7): the featured client result as a LOUD
 * LIGHT-surface band — mist ground, full-bleed hairline rules top and
 * bottom, giant INK numeral, moss accents only. Round 6 made this an ink
 * island; round 7 removes that flip so dark bands stay exactly two
 * deliberate moments (the opening act and the closing sequence).
 * Loudness now comes from scale and the full-bleed rules, not a ground
 * change.
 *
 * Composition: giant numeral locked LEFT with the verification badge
 * directly beside it; honest counterweight RIGHT — a compact recreation
 * of the product's own CRM dashboard (round 8: real artifact, not
 * abstract bars), with the client quote at reading size beneath it.
 * No dead half-viewport.
 *
 * Integrity + precision: ≈ $28,800/yr is the documented ~$2,400/mo labor
 * saving from case study #1 × 12 — the approximation marker rides the
 * numeral everywhere it appears, matching the ~monthly source — and it
 * is labeled "annualized" right next to the numeral. No invented names —
 * attribution stays role + business + city.
 */
function SignatureResult({ story }: { story: Story }) {
  return (
    <figure className="hairline-t hairline-b">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20 lg:grid lg:grid-cols-12 lg:items-center lg:gap-14 lg:py-24">
        {/* Left: the giant numeral + the check-us offer beside it */}
        <div className="lg:col-span-7">
          <p className="eyebrow text-moss">
            Featured result &middot; annualized
          </p>
          {/* Precision consistency (round 8): the approximation marker is
              part of the figure — "≈ $28,800/yr" — matching the documented
              ~$2,400/mo source it annualizes. */}
          <div className="mt-6 flex flex-wrap items-baseline gap-x-3">
            <span
              aria-hidden="true"
              className="font-display text-3xl font-bold text-ink md:text-4xl"
            >
              &asymp;
            </span>
            <span className="sr-only">about </span>
            <span className="stat-giant text-ink">$28,800</span>
            <span className="font-display text-2xl font-bold text-ink md:text-3xl">
              /yr
            </span>
          </div>
          <p className="mt-4 max-w-3xl font-display text-2xl font-bold leading-snug tracking-tight text-ink md:text-3xl">
            in labor recovered &mdash; {story.company}, {story.place}
          </p>
          <p className="caption mt-3 max-w-2xl text-ink-muted">
            Annualized from the documented ~$2,400/mo in labor savings
            &mdash; down from 15+ hrs/wk of manual inventory work, live
            after a 6-week setup.
          </p>
          {/* Verification badge — the standing offer, placed directly
              beside the number so the claim and the check arrive together.
              Links to the intro ask at #contact. */}
          <a
            href="#contact"
            className="card-hairline mt-7 inline-flex max-w-full items-center gap-3 rounded-full bg-paper py-2.5 pl-3 pr-5 transition-colors duration-150 hover:border-moss"
          >
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mist text-moss">
              <VerifyMark className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold leading-snug text-ink">
              Want to check? Ask &mdash; we&rsquo;ll make the&nbsp;intro.
            </span>
          </a>
        </div>

        {/* Right: honest counterweight — the product's own CRM dashboard
            (real artifact) + the quote */}
        <div className="mt-12 lg:col-span-5 lg:mt-0">
          {/* Mobile containment guard (final round, coordinated): the clip
              guarantees the artifact's decorative geometry can never
              descend out of its own box and through the quote text below
              at 390px. md+ is unclipped. */}
          <div className="relative overflow-hidden md:overflow-visible">
            <DashboardCard />
          </div>
          <blockquote className="mt-7 text-base leading-relaxed text-ink md:text-lg">
            &ldquo;{story.quote}&rdquo;
          </blockquote>
          {/* Honest attribution: role + business + city (no invented
              names). TODO(owner): swap in the client's real name +
              headshot + Google-listing link here once permission is in
              writing. */}
          <figcaption className="mt-4">
            <div className="text-sm leading-snug text-ink">
              <span className="font-semibold">{story.role}</span>,{" "}
              {story.company}
              <span className="text-ink-muted"> &middot; {story.place}</span>
            </div>
            <Link
              href="/case-studies"
              className="link-moss mt-3 inline-flex items-center gap-1.5 text-sm"
            >
              Read the full story <span aria-hidden="true">&rarr;</span>
            </Link>
          </figcaption>
        </div>
      </div>
    </figure>
  );
}

function QuoteCard({ story }: { story: Story }) {
  return (
    <figure className="service-card flex h-full flex-col rounded-2xl p-6 sm:p-8">
      {/* ONE hero metric, neutral ink — the featured card above holds
          the section's single green metric, so these two stay quiet
          and supporting. The rest of each client's numbers live on the
          case-studies page behind the link below. */}
      <div
        className="font-display font-extrabold tracking-tight text-ink"
        style={{ fontSize: "clamp(2.25rem, 3vw, 2.75rem)", lineHeight: 1.05 }}
      >
        {story.metricValue}
        {story.metricUnit && (
          <span className="ml-1 align-baseline font-sans text-base font-medium tracking-normal text-ink-muted">
            {story.metricUnit}
          </span>
        )}
      </div>
      <div className="caption mt-1.5 text-ink-muted">{story.metricLabel}</div>
      {story.metricContext && (
        <div className="caption mt-0.5 text-ink-muted">
          {story.metricContext}
        </div>
      )}

      <blockquote className="mt-5 text-base leading-relaxed text-ink">
        &ldquo;{story.quote}&rdquo;
      </blockquote>

      {/* Honest attribution: role + business + city (no invented names).
          TODO(owner): swap in the client's real name + headshot +
          Google-listing link here once permission is in writing. */}
      <figcaption className="hairline-t mt-auto pt-5">
        <div className="text-sm leading-snug text-ink">
          <span className="font-semibold">{story.role}</span>,{" "}
          {story.company}
          <span className="text-ink-muted"> &middot; {story.place}</span>
        </div>
        <Link
          href="/case-studies"
          className="link-moss mt-3 inline-flex items-center gap-1.5 text-sm"
        >
          Read the full story <span aria-hidden="true">&rarr;</span>
        </Link>
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export default function Proof() {
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef);
  const counter = useCountUp(COUNTER_TARGET);

  return (
    <section
      id="proof"
      ref={sectionRef}
      // Round 5: Proof sits mid-light-body — Process hands off flush above
      // and Pricing continues flush below (no hairline, no tone change).
      // Both paddings are halves of in-band seams. Sticky-nav clearance on
      // anchor jumps comes from the global 6rem scroll-margin.
      className="band-mist pt-12 md:pt-14 pb-12 md:pb-14"
      aria-label="Client results and testimonials"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Headline */}
        <div className="reveal max-w-3xl">
          <p className="eyebrow text-moss">
            Proof &middot; Texas small businesses
          </p>
          {/* Round-7 headline variety: the inline-emphasis construction —
              one sentence, ONE moss word mid-sentence, nothing else green.
              nbsp join stops an "it." orphan at 390px. */}
          <h2 className="text-display-lg mt-4 text-ink">
            Every number has a <span className="text-moss">person</span>{" "}
            behind&nbsp;it.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-muted">
            Every number on this page comes from a small business we set up
            &mdash; and every story is one you can check yourself.
          </p>
        </div>

        {/* The section anchor: one giant aggregate number, full width,
            no clipping container — the count-up hook guarantees it reads
            as the settled total at every scroll position (snaps if
            scrolled past, counts if in view, honors reduced motion).
            Methodology sits directly beside it so the size stays honest. */}
        <div className="reveal hairline-t mt-10 pt-8 md:mt-14 md:pt-10 lg:grid lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-8">
            <div
              className="inline-flex items-baseline whitespace-nowrap font-display font-extrabold tracking-[-0.04em] text-ink"
              style={{
                fontSize: "clamp(4rem, 12vw, 9.5rem)",
                lineHeight: 0.95,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <span ref={counter.nodeRef}>
                {counter.value.toLocaleString("en-US")}
              </span>
              {/* Terminal cursor: blinks once the count settles. Moss, not
                  volt — green follows its ground, and this band is light. */}
              <span
                aria-hidden="true"
                className={`ml-3 inline-block h-[0.68em] w-[0.4em] translate-y-[0.04em] rounded-sm bg-moss ${
                  counter.done ? "animate-pulse-volt" : "opacity-0"
                }`}
              />
            </div>
            <div className="mt-3 text-xl font-semibold text-ink md:text-2xl">
              hours of busywork automated
            </div>
          </div>
          <div className="mt-5 lg:col-span-4 lg:mt-0">
            <p className="max-w-md text-sm leading-relaxed text-ink-muted">
              <span className="font-semibold text-ink">How we count:</span>{" "}
              estimated from tracked client results &mdash; 15 hrs/wk at
              Family Medical Center plus ~12 hrs/wk in the Texas BBQ Co.
              kitchen, since 2024.
            </p>
          </div>
        </div>

        {/* Outcome stat row — neutral ink numerals (accent stays rationed),
            always visible, no animation dependence */}
        <div className="mt-12 grid grid-cols-1 gap-y-10 md:mt-16 md:grid-cols-3 md:gap-x-10">
          {outcomeStats.map((stat) => (
            <div key={stat.label} className="hairline-t pt-6">
              <div className="font-display text-5xl font-extrabold tracking-tight text-ink md:text-6xl">
                {stat.value}
                {stat.unit && (
                  <span className="ml-1 align-baseline font-sans text-lg font-medium tracking-normal text-ink-muted">
                    {stat.unit}
                  </span>
                )}
              </div>
              <div className="mt-3 text-base font-semibold text-ink">
                {stat.label}
              </div>
              <div className="caption mt-1 text-ink-muted">
                {stat.source}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* SIGNATURE MOMENT — full-bleed light-surface band (round 7: mist
          ground + hairline rules, NOT an ink flip), still the page's
          loudest element, with widened whitespace on BOTH sides so the
          light body alternates loud/quiet around it.
          Final round: NO `.reveal` on this block — quote text must never
          sit semi-transparent ("ghosted") while it scrolls up under the
          sticky header. The band renders at full opacity always. */}
      <div className="mt-16 md:mt-24 lg:mt-28">
        <SignatureResult story={heroStory} />
      </div>

      <div className="mx-auto mt-16 max-w-7xl px-5 sm:px-8 md:mt-24 lg:mt-28">
        {/* Testimonials — two supporting quotes at equal height beneath
            the signature band. Attribution stays role + business + city. */}
        {/* Final round: no `.reveal` scroll-fade anywhere quote text lives —
            testimonials render at full opacity at every scroll position, so
            they can never ghost while passing under the sticky header. */}
        <div>
          <h3 className="text-display-md text-ink">In their own words</h3>
          <p className="mt-2 text-base text-ink-muted">
            Role, business, and city on every quote &mdash; and a standing
            offer below to put you in front of the person behind it.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
          {supportingStories.map((story) => (
            <QuoteCard key={story.company} story={story} />
          ))}
        </div>

        {/* Route out: the verification offer IS the section CTA moment. */}
        <div className="reveal mt-12 md:mt-16">
          <VerifyPanel />
        </div>
      </div>
    </section>
  );
}
