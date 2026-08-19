import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

/**
 * MobileQuoteBar — the one-thumb-tap ask on a long phone page.
 *
 * A slim, bottom-anchored bar (phones only, `md:hidden`) that appears once
 * the visitor has scrolled ~60% of the page and slides away whenever the
 * closing sequence (#contact / footer) is on screen — the form itself is
 * the ask there, so the bar never doubles it. One volt CTA, "Get my quote",
 * scrolling to #contact (scrollIntoView honors the global 6rem
 * scroll-margin, so the form lands clear of the sticky header).
 *
 * Coordination with the chatbot launcher: while this bar is visible it
 * stamps `data-dp2v-quotebar="visible"` on <body>, and the scoped <style>
 * below slides the chat FAB (button[aria-label="Chat with DeployP2V"])
 * out of the corner on phones — the two can never overlap. The FAB's own
 * transition animates the hand-off; desktop is untouched.
 *
 * Safe areas: the bar pads with env(safe-area-inset-bottom) so the CTA
 * sits above the iOS home indicator, never under it.
 */

const SHOW_AFTER_SCROLL_FRACTION = 0.6;

export default function MobileQuoteBar() {
  const [scrolledEnough, setScrolledEnough] = useState(false);
  const [closingInView, setClosingInView] = useState(false);
  const ticking = useRef(false);

  // Show after ~60% of the scrollable height.
  useEffect(() => {
    const measure = () => {
      ticking.current = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolledEnough(
        max > 0 && window.scrollY / max >= SHOW_AFTER_SCROLL_FRACTION,
      );
    };
    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(measure);
      }
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Hide while the contact band (or the footer beneath it) is on screen.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const targets = Array.from(
      document.querySelectorAll("#contact, footer"),
    );
    if (targets.length === 0) return;
    const onScreen = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onScreen.add(entry.target);
        else onScreen.delete(entry.target);
      }
      setClosingInView(onScreen.size > 0);
    });
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  const visible = scrolledEnough && !closingInView;

  // Stamp visibility on <body> so the scoped style below can clear the
  // chatbot FAB out of the corner while the bar owns it.
  useEffect(() => {
    if (visible) {
      document.body.setAttribute("data-dp2v-quotebar", "visible");
    } else {
      document.body.removeAttribute("data-dp2v-quotebar");
    }
    return () => document.body.removeAttribute("data-dp2v-quotebar");
  }, [visible]);

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          body[data-dp2v-quotebar="visible"] button[aria-label="Chat with DeployP2V"] {
            transform: translateY(6rem) !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
        }
      `}</style>
      <div
        aria-hidden={!visible}
        className={[
          // Above the chat FAB/window (z-40), below the sticky header (z-50).
          "fixed inset-x-0 bottom-0 z-[45] md:hidden",
          // Explicit rgba ground: token colors are alpha-less CSS vars, so
          // Tailwind's /opacity shorthand can't apply to them.
          "border-t border-[rgba(246,247,242,0.14)] bg-[rgba(8,12,22,0.96)] backdrop-blur",
          "pb-[env(safe-area-inset-bottom)]",
          "transition-transform duration-300 ease-out motion-reduce:transition-none",
          visible
            ? "translate-y-0"
            : "translate-y-full pointer-events-none",
        ].join(" ")}
      >
        <div className="flex items-center gap-3 px-4 py-2.5">
          <p className="min-w-0 flex-1 text-sm font-medium text-mist">
            Fixed quote in 1 day
          </p>
          <button
            type="button"
            tabIndex={visible ? 0 : -1}
            onClick={() =>
              document
                .getElementById("contact")
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            className="btn-volt shrink-0 !px-5 !py-2.5 text-sm"
          >
            Get my quote
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  );
}
