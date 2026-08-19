import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { Check } from "lucide-react";

/**
 * Process — "How it works" timeline for the DeployP2V homepage.
 * Mist band (round 5: mid-light-body). Three connected steps with a
 * neutral ink progress line that darkens as the visitor scrolls (moss is
 * rationed to accent phrases and the consultation CTA), plus the paper
 * consultation card (our answer to Zapier's "Request a consultation"
 * band).
 *
 * All step content renders fully visible immediately — no scroll-fade
 * ghosting. The timeline is COMPLETE at rest: every node is filled and the
 * track connects 01 → 02 → 03 in dim ink with zero scroll and zero JS.
 * Scroll only darkens the track and nodes — it can never leave the
 * timeline looking broken, half-drawn, or with a hollow node.
 *
 * Anchor: #how-it-works
 */

interface Step {
  num: string;
  /** Column header AFTER the numeral — carries the duration inline, e.g.
      "Free 15-min call" / "We build it — days 1–5" / "You go live — days 5–7". */
  title: ReactNode;
  happens: ReactNode[];
  deliverable: ReactNode;
}

/** Risk-reversal phrases get real emphasis — the promise must be scannable. */
const Em = ({ children }: { children: ReactNode }) => (
  <em className="not-italic font-semibold text-ink">{children}</em>
);

/* Bullets are written to hold to two lines max at every breakpoint —
   trim copy here before letting a line run to three. Risk-reversal terms
   ("free either way", "$149/mo", "month-to-month") live in the highlighted
   terms strip in the CTA card below, NOT buried mid-bullet. */
const STEPS: Step[] = [
  {
    num: "01",
    title: <>Free 15-min&nbsp;call</>,
    happens: [
      "How your week actually runs — missed calls, stale invoices, slipped follow-ups.",
      "We pick the two or three automations that pay back fastest.",
      <>
        If automation won&rsquo;t help yet, <Em>we say so on the call</Em>.
      </>,
    ],
    deliverable: (
      <>
        A one-page automation plan with a fixed monthly price. Yours to keep,{" "}
        <Em>free either way</Em>.
      </>
    ),
  },
  {
    num: "02",
    title: <>We build it &mdash; days&nbsp;1&ndash;5</>,
    happens: [
      "We connect the tools you already run. You change nothing.",
      "Agents scripted in your voice, tested on the 2 a.m. call and the late invoice.",
      "You approve a working demo before anything touches a customer.",
    ],
    deliverable:
      "A working system you've seen handle your real situations. Nothing to install.",
  },
  {
    num: "03",
    title: <>You go live &mdash; days&nbsp;5&ndash;7</>,
    happens: [
      "We flip the switch and tune replies through the first live week.",
      "A 30-minute handoff walks you through the dashboard.",
      "Your agents work nights and weekends. You get the summary.",
    ],
    deliverable:
      "A front desk that never sleeps — and a direct line to us for tweaks.",
  },
];

/**
 * Compact proof stats shown beside the heading at desktop widths.
 * Labels are written to wrap as complete phrases — the trailing pair of
 * words is glued with a non-breaking space so no line ever ends in a
 * single orphaned word.
 */
const INTRO_STATS = [
  { value: "$0", label: "for the 15-minute fit call and one-page plan — free either way" },
  { value: "5–7", label: "days from the first call to fully live" },
  { value: "24/7", label: "agent coverage from the day you launch" },
];

/** Progress thresholds at which each step's node lights up (0–1 along the line). */
const STEP_THRESHOLDS = [0.04, 0.38, 0.72];

export default function Process() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const hLineRef = useRef<HTMLDivElement>(null);
  const vLineRef = useRef<HTMLDivElement>(null);
  const [litSteps, setLitSteps] = useState(0);

  // Scroll-linked progress line: fills as the timeline moves through the viewport.
  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    const apply = (p: number) => {
      if (hLineRef.current) hLineRef.current.style.transform = `scaleX(${p})`;
      if (vLineRef.current) vLineRef.current.style.transform = `scaleY(${p})`;
      const count = STEP_THRESHOLDS.filter((t) => p >= t).length;
      setLitSteps((prev) => (prev === count ? prev : count));
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply(1);
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = timeline.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.85; // fill begins as the timeline's top crosses 85% of the viewport
      const end = vh * 0.4; //   ...and completes as its bottom reaches 40%
      const total = rect.height + start - end;
      const p = total > 0 ? Math.min(1, Math.max(0, (start - rect.top) / total)) : 1;
      apply(p);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    // Sticky-nav clearance comes from the single global
    // `scroll-margin-top: 6rem` rule in index.css — no per-section override.
    // Round-5 rhythm: Process sits mid-light-body (Explorer → Pricing is
    // ONE continuous mist band) — flush seams on both sides, same mist
    // ground, no hairline, no tone change. All accents here are moss/ink
    // per green-follows-its-ground; the CTA card is paper.
    <section id="how-it-works" className="band-mist">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 md:pt-14 pb-12 md:pb-14">
        {/* Header — heading left, proof stats filling the right half at desktop */}
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(21rem,25rem)] lg:items-center lg:gap-16">
          <div className="max-w-3xl">
            <p className="eyebrow text-ink-muted">How it works</p>
            {/* Round-7 headline variety: the kicker-NUMBER construction —
                the claim's numeral leads the headline in moss, the rest of
                the sentence is plain ink. Same text-display-lg scale as
                every section H2; only the construction differs. nowrap +
                nbsp keep "5–7 days" one unit and stop a "live." orphan. */}
            <h2 className="text-display-lg mt-4">
              <span className="text-moss whitespace-nowrap tabular-nums">
                5&ndash;7&nbsp;days
              </span>{" "}
              from first call to fully&nbsp;live.
            </h2>
            <p className="text-lg text-ink-muted leading-relaxed mt-5">
              No discovery phase. No 40-page proposal. No software for you to
              learn. Three steps, one week &mdash; then your business answers,
              books, and follows up by itself.
            </p>
          </div>

          {/* Proof card — desktop only; mobile stays a clean single column.
              Deliberately NOT sticky: it renders in normal flow, fully
              visible at its natural height, so it can never clip mid-list
              or leave a floating CTA. */}
          <aside
            className="hidden lg:block card-hairline rounded-2xl bg-paper p-8"
            aria-label="What the first week costs and delivers"
          >
            <p className="eyebrow !text-[0.8125rem] text-moss">
              Day 0 &middot; Free
            </p>
            <dl className="mt-5">
              {INTRO_STATS.map((stat, i) => (
                <div
                  key={stat.value}
                  className={`flex items-baseline gap-4 ${
                    i > 0 ? "mt-4 pt-4 hairline-t" : ""
                  }`}
                >
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="contents">
                    <span className="font-display text-3xl font-bold tracking-tight tabular-nums text-ink w-20 shrink-0">
                      {stat.value}
                    </span>
                    <span className="text-sm text-ink-muted leading-snug [text-wrap:pretty]">
                      {stat.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
            <a
              href="tel:+12146045735"
              className="link-moss inline-flex items-center gap-2 text-sm mt-6"
            >
              Book a free 15-min&nbsp;call <span aria-hidden="true">&rarr;</span>
            </a>
          </aside>
        </div>

        {/* Timeline */}
        <div ref={timelineRef} className="relative mt-10 md:mt-12">
          {/* Desktop: horizontal track across the top of the three columns.
              The base track is a complete dim-ink line connecting all three
              nodes at rest; the scroll-linked overlay only darkens it.
              (Round 5: the timeline is neutral ink on the light body —
              greens stay rationed to CTAs and accent phrases.) */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-2 inset-x-0 h-[2px] rounded-full bg-[rgba(8,12,22,0.15)]"
          >
            <div
              ref={hLineRef}
              className="absolute -top-px left-0 h-[3px] w-full origin-left scale-x-0 rounded-full bg-ink transition-transform duration-150 ease-linear"
            />
          </div>
          {/* Mobile: vertical track down the left edge — same complete-at-rest
              dim-ink base, darkened by scroll. */}
          <div
            aria-hidden="true"
            className="md:hidden absolute left-2 top-2 bottom-10 w-[2px] rounded-full bg-[rgba(8,12,22,0.15)]"
          >
            <div
              ref={vLineRef}
              className="absolute -left-px top-0 w-[3px] h-full origin-top scale-y-0 rounded-full bg-ink transition-transform duration-150 ease-linear"
            />
          </div>

          <ol className="grid gap-10 md:gap-x-8 lg:gap-x-12 md:grid-cols-3">
            {STEPS.map((step, i) => {
              const lit = i < litSteps;
              return (
                <li
                  key={step.num}
                  // md+: each step is a 3-row subgrid (header / bullets /
                  // deliverable) spanning the shared implicit rows of the ol —
                  // so headers, bullet blocks, and "You walk away with"
                  // footers sit on one shared baseline grid across all three
                  // columns. gap-y-0 keeps internal rhythm on the children's
                  // own margins.
                  // Step 03 is the rightmost column: lg:pr-16 keeps its copy
                  // clear of the fixed chat bubble (~80px square, bottom-right)
                  // at every desktop width.
                  className={`relative pl-10 md:pl-0 md:pt-10 md:grid md:grid-rows-subgrid md:row-span-3 md:gap-y-0 md:content-start ${
                    i === 2 ? "lg:pr-16" : ""
                  }`}
                >
                  {/* Node dot, sitting on the line — always filled ink so
                      the timeline is never hollow; lighting up only adds a
                      soft glow ring. */}
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-0 h-[17px] w-[17px] rounded-full border-2 bg-ink border-ink transition-shadow duration-300 ease-out-expo ${
                      lit ? "shadow-[0_0_0_5px_rgba(8,12,22,0.15)]" : ""
                    }`}
                  />

                  {/* Column header: step numeral + title with its duration
                      inline — "01 · Free 15-min call", "02 · We build it —
                      days 1–5", "03 · You go live — days 5–7". The numeral
                      inherits the display face (round 8: mono is reserved
                      for .eyebrow + in-world demo UI), stays tabular, and
                      darkens as the line reaches it. */}
                  <h3 className="text-display-md min-w-0">
                    <span className="sr-only">Step </span>
                    <span
                      className={`tabular-nums transition-colors duration-500 ease-out-expo ${
                        lit ? "text-ink" : "text-ink-muted"
                      }`}
                    >
                      {step.num}
                    </span>
                    <span aria-hidden="true" className="text-ink-muted">
                      {" "}&middot;{" "}
                    </span>
                    {step.title}
                  </h3>

                  <ul className="mt-3 space-y-2.5 self-start">
                    {step.happens.map((line, j) => (
                      <li key={j} className="flex gap-3">
                        <span
                          aria-hidden="true"
                          className="font-sans text-ink-muted select-none"
                        >
                          &rarr;
                        </span>
                        <span className="text-ink leading-relaxed">
                          {line}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 pt-4 hairline-t">
                    {/* Readable Inter label at full ink — NOT the mono
                        microcap eyebrow; this line has to be legible at a
                        glance, not decorative. */}
                    <p className="font-sans text-sm font-semibold text-ink">
                      You walk away with
                    </p>
                    <p className="mt-1.5 leading-snug text-ink">
                      {step.deliverable}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Proof line — real client outcome from /case-studies, set in Inter
              (the body sans), attributed by role + business per policy.
              Margins run tight (mt-8/mt-10, not mt-10/mt-14) so the whole
              sentence clears the fold with the timeline at typical scroll
              stops instead of getting cut mid-line at the viewport edge. */}
          <p className="mt-8 md:mt-10 pt-6 hairline-t font-sans text-ink-muted leading-relaxed max-w-3xl [text-wrap:pretty]">
            It holds up in practice:{" "}
            <span className="text-ink font-medium">
              35% fewer no-shows and 15 hours a week back from admin work
            </span>{" "}
            once the system went live. &mdash;&nbsp;Practice Manager,
            Family&nbsp;Medical&nbsp;Center &middot;{" "}
            <Link
              href="/case-studies"
              className="link-moss"
            >
              read the case study
            </Link>
          </p>
        </div>

        {/* Consultation CTA — our answer to Zapier's consultation section,
            now a paper card on the light body (round 5: no dark islands
            outside the Explorer window and the featured pricing tier).
            One moss primary (light surface); the call is the secondary
            text link beside the number. */}
        <div className="mt-16 md:mt-24">
          <div className="card-hairline rounded-2xl bg-paper px-6 py-10 sm:px-10 md:px-14 md:py-12">
            <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12">
              <div className="flex-1">
                <p className="eyebrow !text-[0.8125rem] text-moss">
                  Step 01 is free
                </p>
                <h3 className="text-display-md mt-3">
                  Not sure what you&rsquo;d automate first? That&rsquo;s what
                  step&nbsp;01 is for.
                </h3>
                <p className="text-ink-muted leading-relaxed mt-3 max-w-xl">
                  Send one short note and get a plain-English plan with a fixed
                  price — or take the free 15-minute call and we&rsquo;ll map
                  it live. No pitch deck, no obligation, and the plan is free
                  either way.
                </p>
              </div>
              {/* Right half of the card: CTA + risk-reversal badges. The
                  badges are the deal's terms promoted to prominent chips
                  beside the ask — they fill the column instead of hiding
                  in a footnote strip. */}
              <div className="flex flex-col items-stretch sm:items-start gap-5 shrink-0 lg:max-w-sm">
                {/* Round 8: ONE primary treatment site-wide — the volt fill
                    with ink text, legal on any ground. This is the card's
                    (and viewport's) one primary. */}
                <a href="#contact" className="btn-volt w-full sm:w-auto">
                  Get my quote <span aria-hidden="true">&rarr;</span>
                </a>
                {/* The deal's terms, surfaced from the step copy into one
                    highlighted strip. Grid (not flex-wrap) = a clean 2×2 with
                    equal-width chips at every viewport — no ragged wrap. */}
                <ul className="grid w-full grid-cols-2 gap-2" aria-label="Terms of the deal">
                  {[
                    "Free either way",
                    "From $149/mo",
                    "Month-to-month",
                    "Cancel anytime",
                  ].map((term) => (
                    <li
                      key={term}
                      className="flex items-center gap-1.5 rounded-full border border-[rgba(8,12,22,0.15)] bg-mist px-3 py-1.5 text-sm font-semibold text-ink whitespace-nowrap"
                    >
                      <Check
                        aria-hidden="true"
                        className="h-3.5 w-3.5 flex-none text-moss"
                        strokeWidth={2.5}
                      />
                      {term}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-ink-muted">
                  <a
                    href="tel:+12146045735"
                    className="hover:text-ink transition-colors duration-150"
                  >
                    (214) 604-5735 &mdash;{" "}
                    {/* Neutral link, neutral rule — greens are tokens only */}
                    <span className="underline decoration-[rgba(8,12,22,0.3)] underline-offset-4">
                      book a free 15-min&nbsp;call
                    </span>
                  </a>
                  <span aria-hidden="true" className="mx-2">
                    &middot;
                  </span>
                  <a
                    href="mailto:tsparks@deployp2v.com"
                    className="hover:text-ink transition-colors duration-150"
                  >
                    tsparks@deployp2v.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
