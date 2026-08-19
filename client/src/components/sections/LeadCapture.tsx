import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Mail, MapPin, Phone, X, Zap } from "lucide-react";

/**
 * LeadCapture — homepage #contact band (ink), the FORM HALF of the merged
 * closing section (round 7): FinalCTA directly above carries the section's
 * one headline; this band carries the one primary CTA (the form's "Get my
 * quote" submit) and the page's one visible set of contact details (the
 * "Prefer to talk?" card). No duplicate banner button, no second headline.
 *
 * Split layout: pitch + contact channels on the left, the actual form on the
 * right inside a raised ink-2 card. Listens for the `dp2v:lead-context`
 * CustomEvent (fired by AutomationExplorer / pricing CTAs) and turns that
 * context into a visible "Building quote for" chip that gets prepended to the
 * message on submit — so a visitor who played with the explorer never has to
 * re-type what they want.
 */

type FormStatus = "idle" | "sending" | "success" | "error";

interface FormState {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  company: "",
  phone: "",
  message: "",
};

/** Pull a human-readable label out of whatever shape the event detail has. */
function readLeadContext(detail: unknown): string | null {
  if (!detail) return null;
  if (typeof detail === "string") return detail.trim() || null;
  if (typeof detail === "object") {
    const d = detail as Record<string, unknown>;
    const label = [d.label, d.context, d.summary, d.title, d.message].find(
      (v): v is string => typeof v === "string" && v.trim().length > 0,
    );
    if (label) return label.trim();
    const business = typeof d.business === "string" ? d.business : null;
    const pain = typeof d.pain === "string" ? d.pain : null;
    if (business && pain) return `${business} — ${pain}`;
    if (business) return business;
    if (pain) return pain;
  }
  return null;
}

/* Field affordance runs bright on purpose: borders and fills sit well
   clear of the ink-2 card so every input reads as an input at a glance
   (AA affordance, not a ghost outline). Placeholders are styled as
   EXAMPLES, not values: every one starts with "e.g. …", set italic and
   a step lighter than typed text so a filled field is unmistakable. */
const inputClasses =
  "w-full rounded-xl bg-[rgba(246,247,242,0.1)] text-mist placeholder:italic placeholder:text-[rgba(192,199,214,0.62)] " +
  "border border-[rgba(246,247,242,0.38)] px-4 py-3 text-base outline-none " +
  "transition-colors duration-150 hover:border-[rgba(246,247,242,0.55)] " +
  "focus:border-volt focus:bg-[rgba(246,247,242,0.13)] " +
  "focus:ring-2 focus:ring-[rgba(198,246,40,0.25)]";

const labelClasses = "mb-1.5 block text-sm font-semibold text-mist";

export default function LeadCapture() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [leadContext, setLeadContext] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  // Scroll-reveal, scoped to this section.
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const targets = root.querySelectorAll<HTMLElement>(".reveal");
    if (typeof IntersectionObserver === "undefined") {
      targets.forEach((el) => el.classList.add("is-visible"));
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
    targets.forEach((el) => {
      // Content already in the viewport must never start hidden.
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add("is-visible");
      } else {
        io.observe(el);
      }
    });
    return () => io.disconnect();
  }, []);

  // Listen for quote context handed over by other sections.
  useEffect(() => {
    const onLeadContext = (e: Event) => {
      const label = readLeadContext((e as CustomEvent).detail);
      if (!label) return;
      setLeadContext(label);
      setStatus((s) => (s === "success" ? "idle" : s));
      // A hand-off means intent — put the cursor where the visitor types.
      requestAnimationFrame(() => messageRef.current?.focus());
    };
    window.addEventListener("dp2v:lead-context", onLeadContext);
    return () => window.removeEventListener("dp2v:lead-context", onLeadContext);
  }, []);

  const setField = useCallback(
    (field: keyof FormState) =>
      (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => {
        const value = e.target.value;
        setForm((prev) => ({ ...prev, [field]: value }));
      },
    [],
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setErrorMsg(null);

    const message = leadContext
      ? `[Quote context: ${leadContext}]\n\n${form.message.trim()}`
      : form.message.trim();

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          company: form.company.trim() || undefined,
          phone: form.phone.trim() || undefined,
          message,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Something went wrong on our end.");
      }
      setStatus("success");
      setForm(EMPTY_FORM);
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error && err.message
          ? err.message
          : "Couldn't send that. Call us instead — (214) 604-5735.",
      );
    }
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      // Top padding is deliberately shallow: FinalCTA directly above is a
      // compact band, and its headline should hand off to these form fields
      // within one viewport transition. Bottom runs tight too (round 5):
      // the Footer's hairline-t + its own py split the seam whitespace, so
      // no empty black band can open up between the form and the footer.
      className="band-ink pt-10 pb-14 md:pt-12 md:pb-16 lg:pt-14 lg:pb-20"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          {/* ---------- Left: pitch + channels ----------
              Sticky at desktop: the right column (form + proof card) is the
              taller side, so the pitch tracks alongside it instead of
              stranding half the band empty as the visitor scrolls. top-24
              (6rem) matches the global sticky-nav clearance. */}
          <div className="reveal lg:sticky lg:top-24">
            {/* The merged closing section's ONE headline lives in FinalCTA
                directly above — this column opens with a subheading, never
                a second display headline (round 7 merge). */}
            <h3 className="font-display text-xl font-semibold text-mist [text-wrap:balance]">
              Tell us what eats your week. We&rsquo;ll automate it.
            </h3>

            {/* What happens next */}
            <ol className="mt-7 space-y-5">
              {[
                ["01", "We read your note and map the automation that fits."],
                ["02", "You get a fixed quote and a live-date — usually 5–7 days out."],
                ["03", "Say go, and we build it. You approve it before it touches a customer."],
              ].map(([num, line], i) => (
                <li
                  key={num}
                  className="reveal flex items-start gap-4"
                  style={{ "--reveal-delay": `${i * 120}ms` } as React.CSSProperties}
                >
                  <span className="font-sans text-sm font-semibold text-mist-muted tabular-nums">
                    {num}
                  </span>
                  <span className="text-base leading-relaxed text-mist">
                    {line}
                  </span>
                </li>
              ))}
            </ol>

            {/* Contact channels */}
            <div className="card-hairline mt-8 rounded-2xl bg-ink-2 p-6">
              <p className="eyebrow text-mist-muted">Prefer to talk?</p>
              <ul className="mt-4 space-y-3 text-sm">
                {/* The ONE phone path in this band's pre-form column —
                    number + call-booking in a single line, no repeats. */}
                <li>
                  <a
                    href="tel:+12146045735"
                    className="group flex items-start gap-3 text-mist transition-colors duration-150 hover:text-mist"
                  >
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-mist-muted transition-colors duration-150 group-hover:text-mist" />
                    <span>
                      (214) 604-5735 &mdash;{" "}
                      <span className="underline decoration-[rgba(246,247,242,0.35)] underline-offset-4 transition-colors duration-150 group-hover:decoration-[rgba(246,247,242,0.8)]">
                        book a free 15-min call
                      </span>
                      , no pitch
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:tsparks@deployp2v.com"
                    className="group flex items-center gap-3 text-mist transition-colors duration-150 hover:text-mist"
                  >
                    <Mail className="h-4 w-4 shrink-0 text-mist-muted transition-colors duration-150 group-hover:text-mist" />
                    tsparks@deployp2v.com
                  </a>
                </li>
                <li className="flex items-center gap-3 text-mist-muted">
                  <MapPin className="h-4 w-4 shrink-0" />
                  Wylie, Texas
                </li>
              </ul>
            </div>

          </div>

          {/* ---------- Right: the form ---------- */}
          <div
            className="reveal"
            style={{ "--reveal-delay": "150ms" } as React.CSSProperties}
          >
            <div className="card-hairline relative rounded-2xl bg-ink-2 p-6 sm:p-8">
              {/* Mono status strip */}
              <div className="hairline-b -mx-6 flex items-center justify-between px-6 pb-4 sm:-mx-8 sm:px-8">
                {/* Inter (round 8): the form is a real page element, not an
                    in-world demo artifact — mono is reserved for .eyebrow
                    labels + the demo console/SMS UI only. */}
                <span className="caption !text-xs tracking-[0.08em] text-mist-muted">
                  Quote request
                </span>
                {/* Live dot keeps volt; the label is neutral (round-4 ration) */}
                <span className="flex items-center gap-2 caption !text-xs tracking-[0.08em] text-mist-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-volt animate-pulse-volt" />
                  reply &lt; 1 biz day
                </span>
              </div>

              {status === "success" ? (
                /* ---------- Success state ---------- */
                <div className="py-10 text-center sm:py-14" role="status">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-mist text-ink">
                    <Check className="h-7 w-7" strokeWidth={3} />
                  </span>
                  <h3 className="text-display-md mt-6 text-mist">
                    Got it. Quote incoming.
                  </h3>
                  <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-mist-muted">
                    We reply within one business day with a plan, a fixed price,
                    and a live-date. Watch your inbox — and if it&rsquo;s urgent,
                    skip the line:
                  </p>
                  <a
                    href="tel:+12146045735"
                    className="btn-ghost mt-8 w-full sm:w-auto"
                  >
                    <Phone className="h-4 w-4" />
                    Call (214) 604-5735
                  </a>
                </div>
              ) : (
                /* ---------- Form state ---------- */
                <form onSubmit={handleSubmit} className="mt-6" noValidate={false}>
                  {/* Lead-context chip from the explorer / pricing */}
                  {leadContext && (
                    <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-[rgba(246,247,242,0.3)] bg-ink-3 px-4 py-3">
                      <p className="flex items-start gap-2 text-sm text-mist">
                        <Zap className="mt-0.5 h-4 w-4 shrink-0 text-mist-muted" />
                        <span>
                          <span className="caption !text-xs text-mist-muted">
                            Building quote for:
                          </span>{" "}
                          <span className="font-medium">{leadContext}</span>
                        </span>
                      </p>
                      <button
                        type="button"
                        onClick={() => setLeadContext(null)}
                        aria-label="Remove quote context"
                        className="text-mist-muted transition-colors duration-150 hover:text-mist"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Three visible required fields — name, email, and the ask.
                      Everything else is demoted to the compact optional row
                      below so the form reads as a 30-second job. */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="lead-name"
                        className={labelClasses}
                      >
                        Name
                      </label>
                      <input
                        id="lead-name"
                        type="text"
                        required
                        autoComplete="name"
                        placeholder="e.g. Jordan Rivera"
                        value={form.name}
                        onChange={setField("name")}
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="lead-email"
                        className={labelClasses}
                      >
                        Email
                      </label>
                      <input
                        id="lead-email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="e.g. you@yourbusiness.com"
                        value={form.email}
                        onChange={setField("email")}
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="lead-message"
                      className={labelClasses}
                    >
                      What should we automate?
                    </label>
                    {/* rows=3 keeps the whole required trio + submit inside
                        one phone viewport; sm+ restores the 4-row height. */}
                    <textarea
                      id="lead-message"
                      ref={messageRef}
                      required
                      rows={3}
                      placeholder="e.g. We miss about 10 calls a day while we're on jobs, and invoices go out late every month."
                      value={form.message}
                      onChange={setField("message")}
                      className={`${inputClasses} resize-y sm:min-h-[7.5rem]`}
                    />
                  </div>

                  {/* Compact optional pair — visually lighter than the
                      required trio: smaller inputs, muted labels. Two-up
                      even at 390px so it spends one short row, keeping the
                      required trio + submit together on a phone screen. */}
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label
                        htmlFor="lead-company"
                        className="mb-1 block text-sm font-medium text-mist"
                      >
                        Company (optional)
                      </label>
                      <input
                        id="lead-company"
                        type="text"
                        autoComplete="organization"
                        placeholder="Company"
                        value={form.company}
                        onChange={setField("company")}
                        className={`${inputClasses} !py-2 !text-sm`}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="lead-phone"
                        className="mb-1 block text-sm font-medium text-mist"
                      >
                        Phone (optional)
                      </label>
                      <input
                        id="lead-phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="Phone"
                        value={form.phone}
                        onChange={setField("phone")}
                        className={`${inputClasses} !py-2 !text-sm`}
                      />
                    </div>
                  </div>

                  {status === "error" && errorMsg && (
                    <p
                      className="mt-4 rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300"
                      role="alert"
                    >
                      {errorMsg} If it keeps failing, email{" "}
                      <a
                        href="mailto:tsparks@deployp2v.com"
                        className="underline underline-offset-2"
                      >
                        tsparks@deployp2v.com
                      </a>
                      .
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="btn-volt btn-glow mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                  >
                    {status === "sending" ? "Sending…" : "Get my quote"}
                    {status !== "sending" && <ArrowRight className="h-4 w-4" />}
                  </button>

                  {/* The commitment, at full contrast right under the ask —
                      not buried in a muted footnote. */}
                  <p className="mt-4 text-sm font-semibold text-mist">
                    Fixed quote within one business day.
                  </p>
                  <p className="mt-1.5 text-sm text-mist-muted">
                    No spam, no drip campaign — one reply from a real person.
                  </p>
                </form>
              )}
            </div>

            {/* Proof — sits directly under the form so the decision moment
                has evidence in the same viewport at desktop widths (and the
                shorter right column never leaves a half-empty ink band).
                Story reused verbatim from /case-studies
                (client/src/pages/case-studies.tsx, Artisan Crafts Online).
                Do not edit these numbers here; they must stay in sync with
                the case study they quote. */}
            <figure
              className="card-hairline reveal mt-6 rounded-2xl bg-ink-2 p-6"
              style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
            >
              <blockquote className="text-base leading-relaxed text-mist">
                &ldquo;The AI handles most customer questions instantly, day or
                night. Our team can focus on complex issues while customers get
                immediate help.&rdquo;
              </blockquote>
              {/* Role + business attribution only — the "names shared on
                  request" verification device lives in Proof, once, and is
                  never repeated here (round 7). */}
              <figcaption className="mt-4 text-sm text-mist-muted">
                Customer Service Manager,{" "}
                <span className="whitespace-nowrap text-mist">Artisan Crafts Online</span>
              </figcaption>
              <div className="hairline-t mt-5 grid grid-cols-2 gap-4 pt-5 sm:gap-6">
                <div className="min-w-0">
                  <p className="font-display text-2xl font-bold tracking-tight text-mist tabular-nums sm:text-3xl">
                    80%
                  </p>
                  <p className="mt-1 text-sm leading-snug text-mist-muted">
                    of questions answered instantly
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="font-display text-2xl font-bold tracking-tight text-mist tabular-nums sm:text-3xl">
                    60%
                  </p>
                  <p className="mt-1 text-sm leading-snug text-mist-muted">
                    fewer support tickets
                  </p>
                </div>
              </div>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
