// Ten chips, not twelve (round 7): a shorter loop keeps chip density down
// so at any pause point fewer chips sit inside the edge-fade zones.
const CHIPS = [
  "Missed-call text back",
  "Invoice chasing",
  "Review requests",
  "Appointment reminders",
  "Lead follow-up in 60 seconds",
  "After-hours phone answering",
  "Quote follow-ups",
  "No-show recovery",
  "Inbox triage",
  "Job scheduling",
];

/* Edge fade MASK — progressive enhancement only (round 8). The
   guaranteed mechanism is the pair of .marquee-edge overlay divs
   below: plain background-gradient strips matching the band's ink
   ground, which render in every engine (headless Chromium included,
   where mask-image has been seen not to apply). Both the standard
   and -webkit- mask properties still ship inline for the dissolve
   where masks DO work; the fade width matches the overlays —
   12vw clamped to 3.5–7rem. */
const EDGE_FADE =
  "linear-gradient(90deg, transparent 0, black clamp(3.5rem, 12vw, 7rem), black calc(100% - clamp(3.5rem, 12vw, 7rem)), transparent 100%)";

function ChipTrack({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div className="marquee-track items-center" aria-hidden={ariaHidden}>
      {CHIPS.map((chip) => (
        <span
          key={chip}
          // Inter, not mono (round 8): chips are labels, and mono is
          // reserved for .eyebrow + in-world demo UI only.
          className="card-hairline flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-ink-2 px-4 py-2 text-xs font-medium text-mist-muted"
        >
          {/* Neutral marker — volt stays reserved for CTAs and live dots */}
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-mist-muted" aria-hidden="true" />
          {chip}
        </span>
      ))}
    </div>
  );
}

export default function TrustBar() {
  return (
    // Round 5: closes the dark opening act. pt runs one step taller than pb
    // so the eyebrow label always clears the sticky nav with room to spare
    // at typical scroll stops (no more label cropping under the header).
    // id="trustbar" is the hook ChatbotWidget's corner-clearance guard
    // observes so the chat launcher never sits over this row.
    <section id="trustbar" className="band-ink hairline-t pt-10 md:pt-12 pb-8 md:pb-10" aria-label="Automations we deploy every week">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <p className="eyebrow mb-5 text-center text-mist-muted">What we automate every week</p>
      </div>
      {/* Clipping, final kill (round 8): two independent mechanisms.
          1. GUARANTEED — the .marquee-edge overlay divs: absolutely
             positioned ink→transparent gradient strips over both edges,
             z-indexed ABOVE the transformed tracks, pointer-events-none.
             They are ordinary painted backgrounds, so they cannot fail
             to render; the outer ~30% of each strip is fully opaque ink,
             so a chip crossing the viewport edge is covered exactly
             where it would otherwise shear mid-word.
          2. ENHANCEMENT — the inline mask (both properties) dissolves
             chips smoothly where mask-image is supported. */}
      <div
        className="marquee"
        role="presentation"
        style={{ maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE }}
      >
        <ChipTrack />
        <ChipTrack ariaHidden />
        <div className="marquee-edge marquee-edge-l" aria-hidden="true" />
        <div className="marquee-edge marquee-edge-r" aria-hidden="true" />
      </div>
    </section>
  );
}
