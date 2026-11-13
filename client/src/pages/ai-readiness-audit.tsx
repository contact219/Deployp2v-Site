import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  Archive,
  FileWarning,
  KeyRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";

/**
 * AI Readiness Audit — service page for the file share audit line.
 *
 * Band logic follows DESIGN.md: ink hero → ONE mist body → ink closer,
 * exactly two hard ink↔mist seams. Volt is the action color only (the two
 * .btn-volt CTAs); accents on light are moss, never volt.
 *
 * Copy rules: capability statements only. No client names, no metrics and
 * no third-party statistics appear here until there is a real engagement
 * or a checked source to cite. Prices live in TIERS below — one place.
 */

const TITLE = "AI Readiness Audit for File Shares | DeployP2V";
const DESCRIPTION =
  "Before you switch on Copilot or another AI assistant, find the overshared folders, exposed sensitive files and stale data on your file servers. Read-only scan, fixed price, fixes with rollback.";
const URL = "https://deployp2v.com/ai-readiness-audit";

interface Check {
  icon: LucideIcon;
  title: string;
  body: string;
  looksFor: string[];
}

const CHECKS: Check[] = [
  {
    icon: UsersRound,
    title: "Oversharing",
    body: "Folders that almost anyone in the company can open or change.",
    looksFor: [
      "Everyone and Domain Users access",
      "Write access for broad groups",
      "Where each permission is set",
    ],
  },
  {
    icon: FileWarning,
    title: "Sensitive data",
    body: "Files that look sensitive and sit inside those open folders.",
    looksFor: [
      "Payroll, tax and HR records",
      "Passwords, keys and card numbers",
      "Matched text is never stored",
    ],
  },
  {
    icon: KeyRound,
    title: "Permission hygiene",
    body: "Leftovers that hide who really has access.",
    looksFor: [
      "Deleted accounts still on the list",
      "Folders with broken inheritance",
      "Unique permissions nobody documented",
    ],
  },
  {
    icon: Archive,
    title: "Stale data",
    body: "Old content an AI assistant would still read and quote.",
    looksFor: [
      "Data untouched for three years",
      "The largest stale folders",
      "What to archive before migrating",
    ],
  },
];

const STEPS: { num: string; title: string; body: string }[] = [
  {
    num: "01",
    title: "Scan",
    body: "A read-only script runs inside your network against the shares you choose. It records permissions and file details and changes nothing.",
  },
  {
    num: "02",
    title: "Report",
    body: "You get a readiness score out of 100, a ranked list of exposures and a fix plan, walked through on a call in plain English.",
  },
  {
    num: "03",
    title: "Fix",
    body: "You approve each change. Permissions are backed up first, every change is logged, and a rollback script puts them back.",
  },
];

interface Tier {
  name: string;
  price: string;
  unit?: string;
  summary: string;
  includes: string[];
}

// Starting prices — confirm before this page is merged to main.
const TIERS: Tier[] = [
  {
    name: "Snapshot",
    price: "From $3,000",
    summary: "One environment, scored.",
    includes: ["One file server or share set", "Readiness scorecard", "One-hour readout call"],
  },
  {
    name: "Assessment",
    price: "From $15,000",
    summary: "The full picture and the plan.",
    includes: ["All file shares in scope", "Ranked exposure list", "Prioritized fix plan"],
  },
  {
    name: "Assessment + Remediation",
    price: "From $35,000",
    summary: "We find it and fix it.",
    includes: ["Everything in Assessment", "Approved fixes applied with rollback", "Verification rescan"],
  },
  {
    name: "Monitoring",
    price: "From $500",
    unit: "/mo",
    summary: "Stay ready after the cleanup.",
    includes: ["Quarterly rescans", "Score trend over time", "A report on what changed"],
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Does the scan change anything on our servers?",
    a: "No. The scan only reads permissions and file details. Nothing is changed until you approve specific fixes, and those are backed up first.",
  },
  {
    q: "Does our data leave our network?",
    a: "The scan runs inside your network and writes its results to a folder you control. It records file paths, permissions and match counts, never the contents of a matched file.",
  },
  {
    q: "What access do you need?",
    a: "An account that can read the shares in scope and their permissions. No agents are installed on your servers.",
  },
  {
    q: "Do you cover SharePoint, OneDrive and Teams?",
    a: "Today the audit covers Windows file servers, DFS and NAS shares, which is the data most often migrated into Microsoft 365. Coverage for SharePoint, OneDrive and Teams is in development.",
  },
];

export default function AIReadinessAudit() {
  return (
    <div className="band-ink min-h-screen font-sans antialiased">
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={URL} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={URL} />
        <meta property="og:image" content="https://deployp2v.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content="https://deployp2v.com/og-image.png" />
      </Helmet>

      <Header />

      <main>
        {/* Act I — ink hero */}
        <section className="band-ink relative overflow-hidden" aria-labelledby="audit-headline">
          <div aria-hidden="true" className="grid-overlay pointer-events-none absolute inset-0" />
          <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-16 md:pt-24 pb-20 md:pb-28">
            <div className="max-w-3xl">
              <p className="eyebrow text-mist-muted mb-5">AI readiness audit — File shares</p>
              <h1 id="audit-headline" className="text-display-lg font-display">
                Know what your AI assistant will find before your staff&nbsp;does.
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-mist-muted max-w-2xl">
                Copilot and other AI assistants answer with whatever the person asking is
                allowed to open. If a payroll folder is open to everyone, it is open to the
                assistant too. We scan your file servers, show you what is exposed, and fix
                it before you switch AI on or migrate to Microsoft 365.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <a href="/#contact" className="btn-volt w-full sm:w-auto" data-testid="button-audit-hero">
                  Book a scoping call
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
                <a
                  href="tel:+12146045735"
                  className="text-center sm:text-left text-sm font-medium text-mist underline decoration-[rgba(246,247,242,0.35)] underline-offset-4 hover:decoration-[rgba(246,247,242,0.8)] transition-colors duration-150"
                >
                  Or call (214) 604-5735
                </a>
              </div>
              <p className="caption text-mist-muted mt-8">
                Read-only scan &middot; Fixed price &middot; Every fix backed up and reversible
              </p>
            </div>
          </div>
        </section>

        {/* Act II — one continuous mist body */}
        <div className="band-mist">
          {/* What we check */}
          <section className="pt-20 md:pt-28 pb-12 md:pb-14" aria-labelledby="audit-checks">
            <div className="max-w-7xl mx-auto px-5 sm:px-8">
              <div className="max-w-3xl">
                <p className="eyebrow text-ink-muted mb-4">What we check</p>
                <h2 id="audit-checks" className="text-display-lg">
                  Four things decide whether you are <span className="text-moss">ready</span>.
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-ink-muted">
                  Each one is scored from 0 to 100, and together they make your readiness
                  score. You see exactly how the number was worked out.
                </p>
              </div>
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 items-stretch">
                {CHECKS.map((check) => {
                  const Icon = check.icon;
                  return (
                    <article key={check.title} className="service-card group flex flex-col p-6 md:p-7 h-full">
                      <div className="w-11 h-11 rounded-xl bg-mist text-moss flex items-center justify-center">
                        <Icon className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
                      </div>
                      <h3 className="font-display text-xl font-semibold tracking-tight mt-5 text-ink">
                        {check.title}
                      </h3>
                      <p className="mt-2 text-base leading-snug text-ink">{check.body}</p>
                      <div className="mt-5 pt-5 hairline-t">
                        <p className="caption !text-xs text-ink-muted mb-3">What we look for</p>
                        <ul className="space-y-1.5">
                          {check.looksFor.map((item) => (
                            <li key={item} className="text-sm leading-snug text-ink-muted">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="pt-12 md:pt-14 pb-12 md:pb-14" aria-labelledby="audit-steps">
            <div className="max-w-7xl mx-auto px-5 sm:px-8">
              <div className="max-w-3xl">
                <p className="eyebrow text-ink-muted mb-4">How it works</p>
                <h2 id="audit-steps" className="text-display-md font-display">
                  Scan, report, fix. Nothing changes without your sign-off.
                </h2>
              </div>
              <ol className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
                {STEPS.map((step) => (
                  <li key={step.num} className="card-hairline rounded-2xl bg-paper p-6 md:p-7">
                    <span className="font-sans text-xs font-medium tracking-[0.18em] tabular-nums text-ink-muted">
                      {step.num}
                    </span>
                    <h3 className="font-display text-xl font-semibold tracking-tight mt-3 text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-base leading-relaxed text-ink-muted">{step.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Packages */}
          <section className="pt-12 md:pt-14 pb-12 md:pb-14" aria-labelledby="audit-packages">
            <div className="max-w-7xl mx-auto px-5 sm:px-8">
              <div className="max-w-3xl">
                <p className="eyebrow text-ink-muted mb-4">Packages</p>
                <h2 id="audit-packages" className="text-display-md font-display">
                  Fixed price, agreed before we start.
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-ink-muted">
                  The final price depends on how many shares are in scope. You get the number
                  on the scoping call, in writing.
                </p>
              </div>
              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 items-stretch">
                {TIERS.map((tier) => (
                  <article key={tier.name} className="card-hairline rounded-2xl bg-paper p-6 md:p-7 flex flex-col h-full">
                    <h3 className="font-display text-lg font-semibold tracking-tight text-ink">{tier.name}</h3>
                    <p className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink">
                      {tier.price}
                      {tier.unit && <span className="text-base font-medium text-ink-muted">{tier.unit}</span>}
                    </p>
                    <p className="mt-2 text-sm leading-snug text-ink-muted">{tier.summary}</p>
                    <ul className="mt-5 pt-5 hairline-t space-y-2">
                      {tier.includes.map((item) => (
                        <li key={item} className="text-sm leading-snug text-ink">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
              <p className="mt-8 text-base text-ink-muted">
                Not sure yet?{" "}
                <a href="/#contact" className="link-moss">
                  Ask for a free one-share snapshot
                </a>{" "}
                and see your score first.
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section className="pt-12 md:pt-14 pb-20 md:pb-28" aria-labelledby="audit-faq">
            <div className="max-w-7xl mx-auto px-5 sm:px-8">
              <p className="eyebrow text-ink-muted mb-4">Questions</p>
              <h2 id="audit-faq" className="text-display-md font-display max-w-3xl">
                What IT and owners ask first.
              </h2>
              <dl className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 max-w-5xl">
                {FAQS.map((faq) => (
                  <div key={faq.q} className="hairline-t pt-5">
                    <dt className="font-display text-lg font-semibold tracking-tight text-ink">{faq.q}</dt>
                    <dd className="mt-2 text-base leading-relaxed text-ink-muted">{faq.a}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        </div>

        {/* Act III — ink closer */}
        <section className="band-ink relative overflow-hidden" aria-labelledby="audit-cta">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(900px 420px at 50% 118%, rgba(198, 246, 40, 0.12), transparent 62%)",
            }}
          />
          <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-20 md:py-28">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <h2 id="audit-cta" className="text-display-lg font-display">
                Find the open folders before the AI&nbsp;does.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-mist-muted">
                A 15-minute call sets the scope and the fixed price. If your shares are
                already in good shape, we will tell you.
              </p>
              <a href="/#contact" className="btn-volt mt-9 w-full sm:w-auto" data-testid="button-audit-cta">
                Book a scoping call
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
