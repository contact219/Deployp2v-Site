import { useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  Check,
  ArrowRight,
  Phone,
  CalendarDays,
  ShieldCheck,
  Wrench,
  Zap,
} from "lucide-react";

/**
 * Pricing — #pricing. Continues the single continuous light (mist) band
 * opened by Proof; paper cards carry the contrast inside it.
 * Three hairline tiers per DESIGN.md: Starter $149/mo, Professional $499/mo
 * (featured ink card — volt appears only as its border + CTA), Custom
 * (quoted — the tier is named "Custom", never "Enterprise": the H2 says
 * "Not enterprise" and the tier name must not contradict it).
 * Card internal order (round 7, FINAL): plan name → price (big) → one-line
 * outcome → attributed proof chip → features → bottom-anchored CTA.
 * Reassurance chips (month-to-month / cancel-anytime / setup-included) sit
 * with the section head, in the first pricing viewport.
 * Every CTA dispatches a `dp2v:lead-context` CustomEvent with plan context,
 * then scrolls to #contact.
 */

type Tier = {
  id: string;
  name: string;
  price: string;
  per: string | null;
  tagline: string;
  /** Optional ROI bridge shown right under the price (exact copy, real case-study number). */
  roi?: string;
  /** Concrete dollar/time outcome from an existing case study (see pages/case-studies.tsx). Do not invent numbers. */
  proof: string;
  /** The business the proof number belongs to — must match a company in pages/case-studies.tsx. */
  proofBusiness: string;
  includesLabel: string;
  features: string[];
  cta: string;
  featured: boolean;
};

const TIERS: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$149",
    per: "/mo",
    tagline: "Your first automation, live in 5–7 days.",
    // Family Medical Center case study: "15 hours weekly saved on admin tasks"
    proof: "15 hrs/wk of admin erased",
    proofBusiness: "Family Medical Center",
    includesLabel: "What you get",
    features: [
      "1 automation, built and deployed for you — most owners start with missed-call text back",
      "AI chat on your website, trained on your services, hours, and prices",
      "Done-for-you setup — no software for you to learn",
      "Email support, replies within 1 business day",
      "Monthly report: leads captured, hours saved",
    ],
    // Printed price → transactional label; only the quoted Custom tier asks for a quote.
    cta: "Start with Starter",
    featured: false,
  },
  {
    id: "professional",
    name: "Professional",
    price: "$499",
    per: "/mo",
    tagline: "Your whole front office, on autopilot.",
    // ROI bridge: Texas BBQ Co. case study — $2,400/mo labor savings. Documented, not invented.
    roi: "$499/mo vs ≈$2,400/mo of recovered labor (documented client result)",
    // Texas BBQ Co. case study: "$2,400 monthly savings in labor costs"
    proof: "$2,400/mo in labor recovered",
    proofBusiness: "Texas BBQ Co.",
    includesLabel: "Everything in Starter, plus",
    features: [
      "Up to 5 automations — invoice chasing, review requests, booking reminders, lead follow-up",
      "24/7 AI agent that answers calls and messages, 2 a.m. included",
      "Web work included: landing pages, booking forms, updates on request",
      "Priority support — same-day, a direct line to us",
      "One new automation built every quarter, on us",
    ],
    cta: "Start with Professional",
    featured: true,
  },
  {
    id: "enterprise",
    name: "Custom",
    price: "Let's talk",
    per: null,
    tagline: "Multi-location, custom builds, heavier lifting.",
    // Premier Properties Dallas case study: "25 additional closings per quarter"
    proof: "25 extra closings in a quarter",
    proofBusiness: "Premier Properties Dallas",
    includesLabel: "Everything in Professional, plus",
    features: [
      "Unlimited automations across locations and teams",
      "Custom AI tools and full web development, scoped to your operation",
      "Integrations with what you already run — CRM, QuickBooks, scheduling",
      "A dedicated point person with a direct phone line",
      "Quarterly on-site or video strategy review",
    ],
    cta: "Get my quote",
    featured: false,
  },
];

const REASSURANCES: { label: string; Icon: typeof Check }[] = [
  { label: "Month to month", Icon: CalendarDays },
  { label: "Cancel anytime", Icon: ShieldCheck },
  { label: "$0 setup fee", Icon: Wrench },
  { label: "Live in 5–7 days", Icon: Zap },
];

function sendLeadContext(plan: string, price: string) {
  window.dispatchEvent(
    new CustomEvent("dp2v:lead-context", {
      detail: { plan, price, source: "pricing" },
    }),
  );
  const contact = document.getElementById("contact");
  if (contact) {
    contact.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    window.location.assign("/contact");
  }
}

/** Attributed proof chip — links the number to the case study it comes from. */
function ProofChip({ tier }: { tier: Tier }) {
  const featured = tier.featured;
  return (
    <Link
      href="/case-studies"
      className={[
        "group mt-4 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 rounded-lg px-3 py-2.5",
        "text-sm leading-snug transition-colors",
        featured
          ? "bg-[rgba(246,247,242,0.08)] hover:bg-[rgba(246,247,242,0.14)]"
          : "bg-[rgba(8,12,22,0.04)] hover:bg-[rgba(8,12,22,0.08)]",
      ].join(" ")}
      aria-label={`${tier.proof} at ${tier.proofBusiness} — read the case study`}
    >
      <span
        className={
          "font-semibold tabular-nums " +
          (featured ? "text-mist" : "text-ink")
        }
      >
        {tier.proof}
      </span>
      <span className={featured ? "text-mist-muted" : "text-ink-muted"}>
        — {tier.proofBusiness}
      </span>
      <span
        aria-hidden="true"
        className={
          "font-semibold transition-transform group-hover:translate-x-0.5 " +
          (featured ? "text-mist" : "text-moss")
        }
      >
        &rarr;
      </span>
    </Link>
  );
}

export default function Pricing() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const targets = Array.from(section.querySelectorAll<HTMLElement>(".reveal"));
    if (targets.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px 240px 0px" },
    );
    targets.forEach((t) => {
      // Content already in the viewport must never start hidden.
      if (t.getBoundingClientRect().top < window.innerHeight) {
        t.classList.add("is-visible");
      } else {
        observer.observe(t);
      }
    });
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="pricing"
      ref={sectionRef}
      // Continues the single light band opened by Proof — same mist ground,
      // no hairline, no tone change, so the two sections read as one band.
      // The short top padding is the other half of the in-band seam.
      className="band-mist pt-12 md:pt-14 pb-20 md:pb-28 lg:pb-32"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Section head — two-column grid at desktop: copy left, plan picker
            right. Each occupies its own grid cell aligned to the top, so the
            picker can never collide with or clip under the headline. */}
        <div className="reveal lg:grid lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start lg:gap-12">
          <div className="max-w-3xl">
            <p className="eyebrow text-moss">Pricing · Month to month</p>
            <h2 className="text-display-lg mt-4">
              Priced for small business.{" "}
              <span className="text-moss whitespace-nowrap">Not&nbsp;enterprise.</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-muted">
              One flat monthly price, month to month. Setup is done for you,
              you&rsquo;re live in 5&ndash;7 days, and you can cancel any time.
            </p>
          </div>
          <aside className="hidden lg:block rounded-2xl card-hairline bg-paper px-6 py-6">
            <h3 className="font-display text-lg font-semibold text-ink">
              Which plan fits?
            </h3>
            <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-ink">
              <li>
                <span className="font-semibold">One task</span> eating your
                week &rarr; <span className="text-moss font-semibold">Starter</span>
              </li>
              <li>
                <span className="font-semibold">A whole front office</span> to
                hand off &rarr;{" "}
                <span className="text-moss font-semibold">Professional</span>
              </li>
              <li>
                <span className="font-semibold">Multi-location</span> or heavier
                lifting &rarr;{" "}
                <span className="text-moss font-semibold">Custom</span>
              </li>
            </ul>
            <p className="mt-4 pt-4 border-t border-[rgba(8,12,22,0.12)] text-sm leading-relaxed text-ink-muted">
              Still unsure? The free fit call below tells you in 15 minutes.
            </p>
          </aside>
        </div>

        {/* Reassurance chips live UP HERE with the section head (round 7):
            month-to-month / cancel-anytime / setup-included are buying
            conditions, so they sit in the first pricing viewport right
            above the price cards — not buried below the fold. No `reveal`
            class: they ship at full contrast even if scroll animation
            never fires. */}
        <div className="mt-8 flex flex-wrap gap-2.5 sm:gap-3">
          {REASSURANCES.map(({ label, Icon }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(8,12,22,0.15)] bg-paper px-3.5 py-2 text-sm font-semibold text-ink"
            >
              <Icon aria-hidden="true" className="h-4 w-4 text-moss" strokeWidth={2.25} />
              {label}
            </span>
          ))}
        </div>

        {/* Tier cards — `isolate` keeps the featured card's z-index scoped to this
            grid so its elevation can never stack against the sticky nav (z-50).
            Round 5: NO vertical protrusion on the featured card (the old
            lg:-my-4 sliced its edges across the seam line) — all three tiers
            sit flush in one row; the ink fill + volt border + taller padding
            carry the emphasis instead. */}
        <div className="isolate mt-8 md:mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-0 lg:items-stretch">
          {TIERS.map((tier, i) => {
            const featured = tier.featured;
            return (
              <div
                key={tier.id}
                className={[
                  "reveal flex",
                  featured ? "lg:z-[1]" : "",
                  i === 0 ? "lg:pr-0" : "",
                ].join(" ")}
                style={{ ["--reveal-delay" as string]: `${i * 120}ms` }}
              >
                <div
                  className={[
                    "pricing-card flex flex-col w-full p-7 md:p-8",
                    featured
                      ? "pricing-card-featured lg:py-10"
                      : i === 0
                        ? "lg:rounded-r-none lg:border-r-0"
                        : "lg:rounded-l-none lg:border-l-0",
                  ].join(" ")}
                >
                  {/* Card head */}
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-xl font-semibold">
                      {tier.name}
                    </h3>
                    {featured && (
                      // Neutral badge — the featured card's volt lives in its
                      // border + CTA only (round-4 ration).
                      <span className="text-xs font-semibold tracking-wide text-mist border border-[rgba(246,247,242,0.35)] rounded-full px-3 py-1.5 whitespace-nowrap">
                        Most picked
                      </span>
                    )}
                  </div>

                  {/* Price directly under the plan name (round 7 final
                      order: name → price → outcome → features → CTA) —
                      the buy fact leads every card. */}
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-display-md font-display !font-bold tabular-nums">
                      {tier.price}
                    </span>
                    {tier.per && (
                      <span
                        className={
                          "font-sans text-sm font-medium " +
                          (featured ? "text-mist-muted" : "text-ink-muted")
                        }
                      >
                        {tier.per}
                      </span>
                    )}
                  </div>

                  {/* ROI bridge — sits right against the price so the $499
                      is never read without the ≈$2,400 it buys back. Real
                      Texas BBQ Co. number; never invent figures here. */}
                  {tier.roi && (
                    <p
                      className={
                        "mt-1.5 text-sm leading-snug tabular-nums " +
                        (featured ? "text-mist-muted" : "text-ink-muted")
                      }
                    >
                      {tier.roi}
                    </p>
                  )}

                  {/* One-line outcome */}
                  <p
                    className={
                      "mt-2 text-base leading-relaxed " +
                      (featured ? "text-mist-muted" : "text-ink-muted")
                    }
                  >
                    {tier.tagline}
                  </p>

                  {/* Proof up top — a real number from a named case study
                      (see pages/case-studies.tsx), linked to the full
                      write-up. Never invent figures here. */}
                  <ProofChip tier={tier} />

                  {/* Inclusions */}
                  <p
                    className={
                      "mt-6 pt-5 border-t text-sm font-semibold " +
                      (featured
                        ? "text-mist-muted border-[rgba(246,247,242,0.14)]"
                        : "text-ink-muted border-[rgba(8,12,22,0.12)]")
                    }
                  >
                    {tier.includesLabel}
                  </p>
                  <ul className="mt-4 mb-6 space-y-3.5 flex-1">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex gap-3 text-sm leading-relaxed">
                        <Check
                          aria-hidden="true"
                          className={
                            "h-4 w-4 mt-0.5 shrink-0 " +
                            (featured ? "text-mist" : "text-moss")
                          }
                          strokeWidth={2.5}
                        />
                        <span
                          className={featured ? "text-mist" : "text-ink"}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA — bottom-anchored in EVERY card (mt-auto): the one
                      primary lands on a shared baseline across the row, and
                      the featured card's extra height is absorbed by the
                      feature list, never a dead void. */}
                  <div
                    className={
                      "mt-auto pt-6 border-t " +
                      (featured
                        ? "border-[rgba(246,247,242,0.14)]"
                        : "border-[rgba(8,12,22,0.12)]")
                    }
                  >
                    <button
                      type="button"
                      onClick={() =>
                        sendLeadContext(
                          tier.name,
                          tier.per ? `${tier.price}${tier.per}` : tier.price,
                        )
                      }
                      // One filled primary per section (round 5): the volt
                      // fill lives on the ink featured card only; paper tiers
                      // get the quiet ghost treatment in ink/moss.
                      className={
                        (featured
                          ? "btn-volt"
                          : "btn-ghost border-[rgba(8,12,22,0.25)] text-ink hover:border-moss hover:text-moss") +
                        " w-full"
                      }
                      data-testid={`button-pricing-${tier.id}`}
                    >
                      {tier.cta}
                      <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cancellation reassurance — sits directly under the row of
            bottom-anchored CTAs so it reads as part of the buy decision. */}
        <p className="mt-6 text-center text-sm font-medium leading-relaxed text-ink">
          Cancel anytime &mdash; the workflows we built stay yours.
        </p>

        {/* Honest framing for the per-tier proof numbers */}
        <p className="mt-3 text-center text-sm leading-relaxed text-ink-muted">
          The numbers above come from real client builds &mdash; read them in
          full on the{" "}
          <Link
            href="/case-studies"
            className="link-moss"
          >
            case studies
          </Link>
          . Your results will vary.
        </p>

        {/* Escape hatch — no `reveal` class: this card must render without
            depending on the IntersectionObserver animation. */}
        <div className="mt-12 md:mt-16 max-w-2xl mx-auto text-center rounded-2xl card-hairline bg-paper px-6 py-8 md:px-10">
          <p className="font-display text-lg font-semibold">
            Not sure which one fits?
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Take the free fit call. 15 minutes, we tell you exactly what
            we&rsquo;d automate first and what it costs. No pitch deck.
          </p>
          {/* Secondary by design — a quiet text link, so the featured card's
              filled button stays the section's one primary. This is the only
              "book a call" path under the cards. */}
          <a
            href="tel:+12146045735"
            className="link-moss mt-5 inline-flex items-center gap-2 text-sm"
            data-testid="button-pricing-fit-call"
          >
            <Phone aria-hidden="true" className="h-4 w-4" />
            Book a free 15-min&nbsp;call
          </a>
        </div>
      </div>
    </section>
  );
}
