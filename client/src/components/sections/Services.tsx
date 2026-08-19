import {
  ArrowRight,
  Bot,
  Cable,
  Globe,
  PenTool,
  ServerCog,
  Workflow,
  type LucideIcon,
} from "lucide-react";

/**
 * Services — mist band (round-4 rhythm: continues the light band opened
 * by AutomationExplorer), paper service cards.
 * Six services, each with one concrete
 * outcome line, a "What we wire up" micro-list rendered as a circuit rail
 * (hairline wire + moss nodes) that energizes on hover, and one proof line
 * pinned to the card foot (drawn from the case studies in
 * client/src/pages/case-studies.tsx — no invented clients or metrics).
 *
 * Cards render fully visible immediately — no scroll-reveal opacity here.
 */

interface Service {
  num: string;
  icon: LucideIcon;
  title: string;
  outcome: string;
  wires: string[];
  /** One proof line: a real case-study result, or a concrete capability
   *  statement where no repo metric exists. Never a fabricated number. */
  proof: string;
  /** false → the foot line is a plain capability statement, so it renders
   *  WITHOUT the "Proven" label (03 Web Development, 06 IT Solutions). */
  proven?: boolean;
}

const SERVICES: Service[] = [
  {
    num: "01",
    icon: Bot,
    title: "AI Agents & Chatbots",
    outcome: "Answers every call and chat. 2 a.m. included.",
    wires: [
      "Missed-call text back",
      "Website chat that books jobs",
      "Instant quotes & FAQ answers",
      "Every lead logged, none lost",
    ],
    // Source: Artisan Crafts Online case study (case-studies.tsx)
    proof:
      "Auto-resolved 80% of 500+ daily questions for an online craft retailer.",
  },
  {
    num: "02",
    icon: Workflow,
    title: "Workflow Automation",
    outcome: "Get back 10+ hours a week of copy-paste.",
    wires: [
      "Invoice chasing on autopilot",
      "Review requests after every job",
      "Appointment reminders that stick",
      "New leads followed up in 5 minutes",
    ],
    // Source: Premier Properties Dallas case study (case-studies.tsx)
    proof:
      "Cut a Dallas realty team's lead response time 85% — 25 extra closings a quarter.",
  },
  {
    num: "03",
    icon: Globe,
    title: "Web Development",
    outcome: "A site that books jobs — live in 5–7 days.",
    wires: [
      "Booking & quote forms",
      "Local SEO for your town",
      "Loads fast on any phone",
      "Analytics you can actually read",
    ],
    // No repo metric for web builds — concrete capability, not a fake number,
    // and no "Proven" label claiming it is one.
    proof:
      "Every build ships with booking forms wired straight into your calendar and CRM.",
    proven: false,
  },
  {
    num: "04",
    icon: PenTool,
    title: "AI Design & Content",
    outcome: "A month of marketing made in one afternoon.",
    wires: [
      "Logo & brand refresh",
      "Social posts on a schedule",
      "Before/after job showcases",
      "Email campaigns that get opened",
    ],
    // No repo metric for design work — concrete capability, not a fake number.
    proof:
      "Built from photos of your real jobs — not stock templates anyone can spot.",
  },
  {
    num: "05",
    icon: Cable,
    title: "Integrations",
    outcome: "Your tools finally talk. Enter data once.",
    wires: [
      "QuickBooks ↔ CRM sync",
      "Calendar & booking apps",
      "Stripe / Square payments",
      "Google Sheets, everywhere",
    ],
    // Source: Texas BBQ Co. case study (case-studies.tsx)
    proof:
      "Cut manual inventory entry 75% for a Texas BBQ kitchen by syncing orders and stock.",
  },
  {
    num: "06",
    icon: ServerCog,
    title: "IT Solutions",
    outcome:
      "The boring-but-critical layer under your automations — handled.",
    wires: [
      "Email & domain done right",
      "Backups that actually run",
      "Passwords & access cleanup",
      "New-hire tech in a day",
    ],
    // Capability statement — positions IT as the foundation for the AI work.
    // No "Proven" label: it isn't a case-study metric.
    proof:
      "Automations only run on solid ground. We keep the ground solid, one call away.",
    proven: false,
  },
];

export default function Services() {
  return (
    <section
      id="services"
      // Round-5 rhythm: Services sits mid-light-body — flush seams on BOTH
      // sides (Explorer above, Process below), same mist ground throughout.
      className="band-mist pt-12 md:pt-14 pb-12 md:pb-14"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Section head */}
        <div className="max-w-3xl">
          <p className="eyebrow text-ink-muted mb-4">Services — What we deploy</p>
          {/* Round-7 headline variety: THE one deliberately plain,
              accent-free H2 on the page — a single sentence, all ink.
              (The "Plain sentence. Green sentence." construction now
              lives only on Pricing.) nbsp join keeps "itself." from
              wrapping alone. */}
          <h2 className="text-display-lg">
            You run the business &mdash; the rest runs&nbsp;itself.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-muted">
            Pick one service or stack all six. Every one is built for you, live in
            5–7 days, and backed by a real person in Wylie, TX you can call at{" "}
            <a
              href="tel:+12146045735"
              className="link-moss whitespace-nowrap"
            >
              (214) 604-5735
            </a>
            .
          </p>
        </div>

        {/* Card grid — grid stretch + flex-col with mt-auto proof foot keeps
            every card in a row the same height, proof lines aligned. */}
        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 items-stretch">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <article
                key={service.num}
                className="service-card group relative flex flex-col p-6 md:p-7 h-full"
              >
                {/* Corner numeral */}
                <span
                  aria-hidden="true"
                  // Inter (round 8): corner numerals are labels — mono is
                  // reserved for .eyebrow + in-world demo UI only.
                  className="absolute top-6 right-6 font-sans text-xs font-medium tracking-[0.18em] tabular-nums text-ink-muted group-hover:text-moss transition-colors duration-300"
                >
                  {service.num}
                </span>

                {/* Icon chip — moss on light, per green-follows-its-ground */}
                <div className="w-11 h-11 rounded-xl bg-mist text-moss flex items-center justify-center transition-transform duration-300 ease-out-expo group-hover:-translate-y-0.5">
                  <Icon className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
                </div>

                <h3 className="font-display text-xl md:text-2xl font-semibold tracking-tight mt-5 text-ink">
                  {service.title}
                </h3>

                {/* Outcome line */}
                <p className="mt-2 text-base leading-snug font-medium text-ink">
                  {service.outcome}
                </p>

                {/* "What we wire up" — circuit rail micro-list */}
                <div className="mt-5 pt-5 hairline-t">
                  <p className="caption !text-xs text-ink-muted mb-3">
                    What we wire up
                  </p>
                  <ul className="relative ml-[3px] border-l border-[color:var(--hairline)] group-hover:border-moss transition-colors duration-300">
                    {service.wires.map((wire) => (
                      <li
                        key={wire}
                        className="relative pl-4 py-1 text-sm leading-snug text-ink-muted group-hover:text-ink transition-colors duration-300"
                      >
                        <span
                          aria-hidden="true"
                          className="absolute left-[-3.5px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[rgba(94,102,117,0.4)] group-hover:bg-moss transition-colors duration-300"
                        />
                        {wire}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Proof line — pinned to the card foot so rows align.
                    Accent-free: proof copy is plain ink on paper. */}
                <p className="mt-auto pt-5 text-[0.8125rem] leading-snug font-medium text-ink">
                  {service.proven !== false && (
                    <span className="caption !text-xs text-ink-muted block mb-1">
                      Proven
                    </span>
                  )}
                  {service.proof}
                </p>
              </article>
            );
          })}
        </div>

        {/* Section close — the offer, promoted: real subhead + volt CTA.
            Paper card on the mist band (no dark island right above the ink
            Process band — the mist strip below it must stay its own color). */}
        <div className="card-hairline mt-14 md:mt-16 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10 rounded-2xl bg-paper text-ink p-7 md:p-9">
          <div className="flex-1">
            <h3 className="font-display text-2xl md:text-3xl font-semibold tracking-tight leading-tight max-w-[26ch]">
              All six services from{" "}
              {/* nowrap: "we do the setup." moves as ONE unit, so the line
                  can never orphan "the setup." alone. moss on light — the
                  card's one accent */}
              <span className="text-moss">$149/mo</span> &mdash;{" "}
              <span className="whitespace-nowrap">we do the setup.</span>
            </h3>
            <p className="mt-2 text-base leading-relaxed text-ink-muted">
              Nothing to install, nothing to learn. One plan, one person to call.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 w-full lg:w-auto shrink-0">
            {/* Round 8: the volt fill is the ONE primary treatment and it's
                rationed to one per viewport — this in-page jump is not it.
                Ghost pill + text link keep the card's hierarchy quiet. */}
            <a
              href="#pricing"
              className="btn-ghost border-[rgba(8,12,22,0.25)] text-ink hover:border-moss hover:text-moss w-full sm:w-auto"
              data-testid="button-services-pricing"
            >
              See the plan
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
            <a
              href="#explorer"
              className="link-moss text-center sm:text-left text-sm whitespace-nowrap"
            >
              See what we&rsquo;d automate for you
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
