import { useEffect, useRef } from "react";

/**
 * FinalCTA — the HEADLINE of the merged closing section (round 7).
 * This band and LeadCapture (#contact) below read as ONE continuous ink
 * section: one headline (here), one primary CTA (the form's "Get my
 * quote" submit in LeadCapture), contact details exactly once (the
 * "Prefer to talk?" card in LeadCapture). Nothing else lives here — no
 * kicker, no duplicate button, no contact row. Bottom padding is zero so
 * the form band flows straight out of the headline.
 * Self-contained scroll reveal via IntersectionObserver (DESIGN.md §5).
 */
export default function FinalCTA() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const targets = Array.from(section.querySelectorAll<HTMLElement>(".reveal"));
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px 240px 0px" }
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
  }, []);

  return (
    <section
      ref={sectionRef}
      id="final-cta"
      // Round 5: opens the dark closer — the mist→ink seam above is a hard
      // edge (no hairline; hairlines belong to same-ground seams). Round 7:
      // pb-0 — LeadCapture's pt is the only gap, so headline and form share
      // one continuous band.
      className="band-ink relative overflow-hidden pb-0"
      aria-labelledby="final-cta-headline"
    >
      {/* quiet volt wash, bottom-anchored — the page's closing pulse */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 420px at 50% 118%, rgba(198, 246, 40, 0.12), transparent 62%)",
        }}
      />
      <div aria-hidden="true" className="grid-overlay pointer-events-none absolute inset-0" />

      <div className="relative mx-auto max-w-7xl px-5 pt-14 sm:px-8 md:pt-16 lg:pt-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <h2
            id="final-cta-headline"
            className="text-display-lg font-display reveal"
          >
            Their AI is already on the clock.{" "}
            {/* nbsp join: "days." never wraps alone. Same 5–7 day promise
                as everywhere else on the page — one timeline, one number.
                Plain mist — the volt gradient belongs to the hero alone;
                this section's volt is the form's submit button below
                (round-4 ration). */}
            <span>Yours can be live in 5&ndash;7&nbsp;days.</span>
          </h2>

          <p
            className="reveal mt-5 max-w-xl text-lg leading-relaxed text-mist-muted"
            style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
          >
            One short note gets you a plain-English plan, a fixed price, and a
            live-date — within one business day. If AI isn't worth it for your
            business yet, we'll say so.
          </p>
        </div>
      </div>
    </section>
  );
}
