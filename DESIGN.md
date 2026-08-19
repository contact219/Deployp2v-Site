# DeployP2V Design Contract — "Ink & Volt"

This is the binding visual contract for the homepage rebuild. Every builder follows it exactly.
Quality bar: zapier.com homepage (refs in /home/tsparks/deployp2v/refs/zapier/). We match its
discipline — alternating bands, giant numerals, hairline borders, generous whitespace, product-as-proof —
but we do NOT clone its cream/orange. Our identity is deep-space ink + one electric volt-green accent.

---

## 1. Identity in one paragraph

DeployP2V is the small-business automation shop that ships in days, not quarters. The page feels like
a precision instrument switched on at night: near-black "ink" bands with a single live wire of
volt green, alternating with calm warm-white "mist" bands where the product does the talking.
One accent. No gradient soup. Numbers are the heroes.

## 2. Palette (exact values — do not invent others)

CSS variables are defined in `client/src/index.css`. Use the Tailwind color names below.

| Token (CSS var)      | Tailwind name | Value                       | Hex approx | Role |
|----------------------|---------------|-----------------------------|------------|------|
| `--ink`              | `ink`         | `hsl(225, 45%, 6%)`         | `#080C16`  | Dark band background, text on light bands |
| `--ink-2`            | `ink-2`       | `hsl(224, 40%, 11%)`        | `#111727`  | Raised cards / panels on ink |
| `--ink-3`            | `ink-3`       | `hsl(224, 35%, 16%)`        | `#1A2337`  | Hover state of ink-2, input fields on ink |
| `--mist`             | `mist`        | `hsl(75, 25%, 96%)`         | `#F6F7F2`  | Warm light band background |
| `--paper`            | `paper`       | `hsl(0, 0%, 100%)`          | `#FFFFFF`  | Second light band tone + cards on mist |
| `--volt`             | `volt`        | `hsl(74, 92%, 56%)`         | `#C6F628`  | THE accent — action color ONLY: `.btn-volt` CTAs, live dots, the hero gradient (see §11.1) |
| `--volt-bright`      | `volt-bright` | `hsl(74, 100%, 68%)`        | `#DCFC5C`  | Volt hover / gradient end |
| `--moss`             | `moss`        | `hsl(96, 62%, 22%)`         | `#315B15`  | THE deep green on light bands — text, links, and button fills (volt fails contrast on white — always use moss there). Final hex, round 6. |
| `--ink-muted`        | `ink-muted`   | `hsl(222, 12%, 42%)`        | `#5E6675`  | Secondary text on light bands |
| `--mist-muted`       | `mist-muted`  | `hsl(222, 18%, 72%)`        | `#A6B0C3`  | Secondary text on dark bands |

Hairlines: on light bands `rgba(8,12,22,0.12)`; on dark bands `rgba(246,247,242,0.14)`.
Volt glow shadow: `0 8px 40px rgba(198,246,40,0.25)` — CTAs and the live counter only.

**Rules**
- **Volt = action color only (round 4, binding — see §11.1).** Volt appears on `.btn-volt`
  primary CTAs, tiny pulsing live dots, the hero "runs itself" gradient, and at most ONE
  designated non-button highlight per viewport. Headline accents, stat numerals, checkmarks,
  list markers, icons, and links are NOT volt.
- Volt is never body text and never sits on mist/paper as text — use `moss` there.
- Volt-filled buttons always have `ink` text (contrast ~14:1).
- Maximum one volt-filled element per viewport-height of content. Scarcity = electricity.
- No indigo, cyan, purple, or multi-hue gradients anywhere. The only allowed gradient is
  volt→volt-bright (used by the hero's `.gradient-text` and `.btn-volt` sheen).

## 3. Typography

Loaded from Google Fonts in `client/index.html`.

| Role    | Family                  | Tailwind    | Weights | Usage |
|---------|-------------------------|-------------|---------|-------|
| Display | **Bricolage Grotesque** | `font-display` | 500–800 | All headlines, giant numerals, pull quotes |
| Body    | **Inter**               | `font-sans`    | 400–700 | Everything else |
| Mono    | **JetBrains Mono**      | `font-mono`    | 400–600 | Eyebrows, stat labels, counters, code-ish chips |

Type scale (clamp — already responsive, use as-is):
- `.text-display-xl` → `clamp(2.75rem, 6.5vw, 5.25rem)` / line-height 1.02 / tracking -0.03em / weight 800 — hero only
- `.text-display-lg` → `clamp(2rem, 4.5vw, 3.5rem)` / 1.08 / -0.02em / 700 — section headlines
- `.text-display-md` → `clamp(1.5rem, 2.6vw, 2.25rem)` / 1.15 / -0.01em / 600 — card titles, sub-heads
- `.stat-giant` → `clamp(3.5rem, 11vw, 8.5rem)` / 1.0 / -0.04em / 800 / tabular-nums — proof numerals
- Body: `text-lg` (1.125rem) for lede paragraphs, `text-base` default, `leading-relaxed`
- `.eyebrow` → JetBrains Mono 0.75rem, uppercase, tracking 0.18em — every section opens with one

Headline pattern (steal from Zapier): mostly-neutral headline with ONE phrase in accent
(volt on ink via `.gradient-text`, moss on light via `text-moss`). Never two accent phrases.

## 4. Spacing, radius, layout

- 8px base grid. Section vertical padding: `py-20 md:py-28 lg:py-32`. Never less on the homepage.
- Container: `max-w-7xl mx-auto px-5 sm:px-8`.
- Cards: `rounded-2xl` (1rem). Buttons: pill `rounded-full`. Inputs: `rounded-xl`. `--radius: 0.75rem`.
- Card treatment: hairline border + flat fill. Shadows only on hover-lift and the volt CTA glow.
  No permanent drop shadows, no glassmorphism blur except the sticky nav.
- Mobile (390px): single column, `.stat-giant` still fills the width, CTAs full-width `w-full sm:w-auto`.

## 5. Motion language

- Durations: 150ms (micro: color/opacity), 300ms (hover lift/border), 600ms (scroll reveal).
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` — exposed as `--ease-out-expo` and Tailwind `ease-out-expo`.
- Reveal pattern: element gets class `reveal` (opacity 0, translateY 24px). An IntersectionObserver
  (threshold 0.15, once) adds `is-visible`. Stagger siblings with inline `style={{ '--reveal-delay': '120ms' }}`.
- Hover lift: `translateY(-4px)` + border brightens toward volt/moss. Cards only, 300ms.
- Live counter (Proof): numbers tick up when scrolled into view, ~1.2s, then a volt cursor blinks (`.animate-pulse-volt`).
- Marquee (TrustBar/chips): `animation: marquee 30s linear infinite`, pause on hover, duplicated track.
- framer-motion is installed and allowed for the AutomationExplorer interaction; everywhere else prefer
  the CSS reveal pattern. Everything respects `prefers-reduced-motion` (handled globally in index.css).

## 6. Band pattern (homepage, in order)

> **Superseded by §12.1 (round 5):** the page is now a three-act arc — DARK opening (Header,
> Hero, TrustBar) → ONE continuous LIGHT body (AutomationExplorer, Services, Process, Proof,
> Pricing, all `band-mist`) → DARK closer (FinalCTA, LeadCapture, Footer). The per-section table
> below is kept for section content reference only — its Band column is stale for
> AutomationExplorer, Services, Process, Proof, and Pricing.

| # | Section              | Band  | Wrapper class | One-liner |
|---|----------------------|-------|---------------|-----------|
| 1 | Header/Nav           | ink   | sticky, `nav-blur` | Translucent ink bar, hairline bottom, volt pill CTA "Book a free AI fit call", links to existing routes |
| 2 | Hero                 | ink   | `band-ink hero-bg` | Eyebrow "AI AUTOMATION FOR SMALL BUSINESS · WYLIE, TX" → display-xl headline with one volt phrase → lede → volt CTA + ghost CTA → 3 mono proof stats (5–7 days live, $149/mo start, 24/7 agents) |
| 3 | TrustBar             | ink   | `band-ink` (thin, hairline top) | Marquee of automation chips ("Missed-call text back", "Invoice chasing", "Review requests"…) — what we automate, since we don't have Fortune-500 logos |
| 4 | AutomationExplorer   | mist  | `band-mist` | Interactive: pick your business type + pain, see the exact automation pipeline we'd deploy (product-as-proof, our answer to Zapier's workflow UI) |
| 5 | Services             | mist  | `band-mist` (paper cards) | 2×2 hairline card grid: AI Agents & Chatbots, Workflow Automation, Web Development, AI Tools & Design — each with one concrete outcome line |
| 6 | Process              | ink   | `band-ink` | "Live in 5–7 days" timeline: 01 Free fit call → 02 We build it → 03 You go live — giant mono step numerals |
| 7 | Proof                | mist  | `band-mist` | Testimonial spread (display-font pull quote) + stat row with `.stat-giant` numerals (hours saved/week, days to launch, $ saved/mo) in moss |
| 8 | Pricing              | paper | `band-white` | Three hairline tiers: Starter $149/mo, Professional $499/mo (featured: ink card, volt accents), Enterprise custom |
| 9 | FinalCTA             | ink   | `band-ink` | Dark full-bleed: display-lg headline, volt CTA "Book your free AI fit call", phone (214) 604-5735 + tsparks@deployp2v.com in mono |
| 10| Footer               | ink   | `band-ink` (hairline top) | Ink footer: routes (/faq /case-studies /blog /industries /contact /roi-calculator /resources /privacy-policy /terms-of-service), Wylie TX, contact |

Rhythm: ink → light → light → ink → light → light(white) → ink. Adjacent light sections are
differentiated by mist vs paper. Every ink→light seam is a hard edge — no gradient transitions.

## 7. Copy voice

- Plain small-business talk. Second person. Say "your front desk", not "customer engagement layer".
- Every claim gets a number: "Live in 5–7 days." "From $149/mo." "Answers every call, 2 a.m. included."
- Verbs first: "Stop chasing invoices." "Book more jobs while you sleep."
- Banned words: leverage, empower, synergy, seamless, cutting-edge, revolutionize, unlock, elevate,
  solutions (as a noun by itself), "AI-powered" as filler.
- Sentence fragments are fine. Hype is not. If Zapier says "No AI hype. Just results." — we out-plain them.
- CTAs are specific: "Book a free AI fit call", "See what we'd automate", never "Learn more"/"Get started".

## 8. Implementation notes for builders

- Tokens/utilities live in `client/src/index.css`; fonts in `client/index.html`; Tailwind extensions
  (font families, ink/volt/mist/moss colors, keyframes marquee/float/shimmer/fade-up/pulse-volt,
  `ease-out-expo`) in `tailwind.config.ts`.
- Band wrappers: `.band-ink`, `.band-mist`, `.band-white` set background, text color, and the right
  hairline/border variables for children. Always wrap a section in one of these.
- Legacy classes `.hero-bg .gradient-text .glass-card .service-card .pricing-card .btn-glow
  .grid-overlay .neon-border .floating-orb .shimmer-border` are redefined in the new identity and
  safe to keep using; `.btn-volt` and `.btn-ghost` are the canonical buttons.
- Do not `npm install` anything. framer-motion@11, tailwindcss-animate are already present.
- Dark-band sections must not rely on the shadcn `.dark` class — use `.band-ink`, which is self-contained.

## 9. Round-2 layout laws (post-critique, binding)

Cross-cutting rules from the blind critic round. These override any earlier guidance that conflicts.

1. **No half-empty section intros at 1440px.** A section's intro block may not leave its right half
   empty on desktop. Two accepted patterns: (a) full-width heading with a supporting element on the
   right (stat cluster, proof line, illustration, CTA), or (b) a centered intro. A `max-w-3xl`
   left-aligned heading floating alone in a 7xl container is a defect.
2. **Reveal must never hide content.** `.reveal` starts at 8px lift / 320ms (`--dur-reveal`), with a
   CSS failsafe animation that forces visibility ~0.8s after load even if no observer ever fires.
   Observers use `threshold: 0.05` + `rootMargin: "0px 0px 240px 0px"`, and any element already in
   the initial viewport gets `.is-visible` immediately instead of being observed. Never reintroduce
   large translates, long durations, or observer-gated opacity for above-the-fold content.
3. **Sticky-nav clearance.** Every `[id]` anchor target has `scroll-margin-top: 6rem` (global rule in
   `index.css`). The header is `z-50`; nothing inside a section may exceed `z-40`, and elevated cards
   (e.g. the featured pricing tier) stay inside an `isolate` stacking context. `.nav-blur` is
   effectively opaque (0.97, round 4) so giant stats, the proof counter, and elevated cards cannot
   ghost through it at ANY scroll position — not just at anchor stops.
4. **Mono microcopy contrast.** Secondary text uses `--mist-muted` (on ink) / `--ink-muted` (on
   light) at full strength — both tuned to pass WCAG AA for small mono text. Do not re-add `/40`–`/70`
   alpha modifiers or one-off low-alpha rgba() values to readable text; alpha fades are reserved for
   decorative, `aria-hidden` marks only.
5. **Hash deep links must work.** `/#anchor` scrolls on initial load (with retry until the target
   mounts, plus one post-layout correction) and on `hashchange` — handled in `pages/home.tsx`. New
   anchor targets only need an `id`; the global scroll-margin rule handles the header offset.

## 10. Round-3 rhythm laws (post-critique, binding — override §6 where they conflict)

Blind critics read the old page as "assembled template blocks": lurching dark/light bands, dead
vertical gaps, headings clipped under the sticky nav, mono-caps noise, mixed greens. These rules
close that. They override the §6 band table and any earlier guidance that conflicts.

1. **One background logic: ink base, ONE light band.** The homepage is a continuous dark ink base
   with a SINGLE continuous light (mist) band shared by **Proof + Pricing**. Everything else —
   Hero, TrustBar, AutomationExplorer, Services, Process, FinalCTA, LeadCapture, Footer — is
   `band-ink`. Proof→Pricing is flush: same mist ground, no hairline, no tone change (paper lives
   only on cards inside the band). Exactly two ink↔mist seams exist on the page, both hard edges.
   Never add another light band, and never end a light section with a stray strip of its own
   color below a dark full-bleed card.

2. **Seam budget (kills the dead gaps).** Standard band-opening padding stays
   `pt-20 md:pt-28 lg:pt-32`. But:
   - Same-ground continuation sections (an ink section following another ink section) run one step
     tighter: `pt-16 md:pt-20 lg:pt-24`, separated by a `hairline-t` — never a color change.
   - A section that closes with a full-bleed card ends at `pb-16 md:pb-20 lg:pb-24`.
   - The internal Proof↔Pricing seam is `pb-12 md:pb-14` / `pt-12 md:pt-14` (one band, two chapters).
   - No single empty strip may exceed ~120px at 1440px; a hairline seam splits the whitespace into
     two readable paddings.

3. **Sticky-nav clearance has ONE source of truth.** The global `:where([id]) { scroll-margin-top:
   6rem }` rule in `index.css` is the only offset. No section may set a smaller per-element
   `scroll-mt-*`, and all programmatic jumps use `el.scrollIntoView({ block: "start" })` (which
   honors scroll-margin) — never `window.scrollTo` with a hand-tuned pixel offset. Header stays
   `z-50`; nothing in a section exceeds `z-40`; elevated cards (featured pricing tier) stay inside
   an `isolate` stacking context.

4. **Mono all-caps has exactly one role.** JetBrains Mono uppercase = `.eyebrow` (tiny section /
   card labels) — nothing else. Stat captions, disclaimers, trust strips, contact details, and
   metric chips are Inter via the `.caption` utility (0.8125rem, weight 500, normal case) or plain
   `text-sm`/`text-xs` Inter, in `-muted` at full strength. Mono without caps is still allowed for
   its original roles: numerals/counters, tabular digits, and *diegetic* terminal/product chrome
   (which is lowercase — e.g. "live", "quote request", "agent log"), plus speaker tags inside
   simulated product UI.

5. **Green follows its ground.** Volt `#C6F628` appears only on ink surfaces; moss `#315B15` only
   on mist/paper surfaces. The *surface* decides, not the section: an ink card inside the light
   band uses volt (featured pricing tier), and a light chip inside an ink band uses moss (active
   explorer chip). Never volt text/marks directly on mist/paper, never moss on ink, and never both
   greens on the same surface. Accent-phrase pattern stays: `.gradient-text` on ink, `text-moss`
   on light. Volt remains scarce — numerals, CTAs, live indicators; it is never body/paragraph text.

6. **No orphaned headline wraps.** Display headings may not wrap a single word (or a dangling
   fragment like "— we do the setup.") onto their last line. Enforce with `&nbsp;` joins on the
   final two words, `whitespace-nowrap` on short accent phrases (only when the phrase provably fits
   at 390px), and `max-w-[Nch]` on long headings. Check every display heading at 390 / 768 / 1440.

7. **Card grammar per ground.** Light band: `.service-card` / `.pricing-card` (paper + light
   hairline). Ink band: `.service-card-dark` / `card-hairline bg-ink-2` (raised ink panel + dark
   hairline, hover border warms toward volt). A full-bleed offer card on ink is `bg-ink-2`, never
   `bg-ink`-on-ink or a light island.

## 11. Round-4 accent & rhythm laws (post-critique, binding — override §2 rules, §10.1 and §10.5 where they conflict)

Round-3 blind critics scored "overall craft" against us decisively: volt sprayed across headlines,
numerals, checkmarks, markers, AND buttons meant CTAs lost pull; the Hero→Process run was one
unrelieved dark slab; giant stats could ghost under the sticky nav; the hero sprawled. These rules
close that.

1. **Volt is the ACTION color — nothing else.** Volt appears on exactly three things, plus one
   ration:
   - `.btn-volt` primary CTA buttons (any ground);
   - tiny pulsing **live dots** (the `animate-pulse-volt` chrome dots — dot only, their text
     labels are `-muted`);
   - the hero's `.gradient-text` on "runs itself" — the ONE volt text gradient on the site.
     `.gradient-text` may not be used anywhere else.
   - Ration: AT MOST one designated non-button volt highlight per viewport (currently: the
     Explorer payback "hrs" numeral inside the dark recipe window; the featured pricing card's
     volt border). Everything else that was volt — headline accent spans, stat numerals,
     checkmarks, list markers, icons, static links — is mist/white or `-muted` on ink, and
     ink/moss on light. Hover/focus feedback (focus rings, hover border warms) may still flash
     volt; static ink-band accents may not.

2. **Two light bands, strict alternation.** The homepage is an ink base broken by TWO continuous
   mist bands: **AutomationExplorer + Services** and **Proof + Pricing**. Reading order:
   ink (Hero, TrustBar) → mist (Explorer, Services) → ink (Process) → mist (Proof, Pricing) →
   ink (FinalCTA, LeadCapture, Footer). Each in-band chapter seam is flush (`pb-12 md:pb-14` /
   `pt-12 md:pt-14`, no hairline, no tone change); all four ink↔mist seams are hard edges with
   standard band-opening padding (`pt-20 md:pt-28 lg:pt-32`) on the opening side. The Explorer's
   recipe window stays a DARK product screen (`bg-ink`) inside its light band — the mirror of the
   featured pricing tier — and is the only ink island there.

3. **Sticky-nav clearance at every scroll position.** `.nav-blur` is 0.97 — effectively opaque —
   so giant numerals, the proof counter, and the elevated pricing card can never ghost through the
   header mid-scroll. The global `scroll-margin-top: 6rem` rule stays the single anchor offset.

4. **Hero stays on a diet.** Kicker + H1 + subhead + CTA pair + price line + 3 stats share one
   tight rhythm (`mt-4/5/7/3/9`), and the trust strip is ONE neutral Inter line (stats in mist,
   prose in mist-muted) linking to /case-studies. Locked: the H1 reads exactly "The busywork runs
   itself now." with the volt gradient on "runs itself".

5. **Card grammar addendum to §10.7.** On the Explorer+Services light band: paper `.service-card`
   for the six services, paper offer card (`bg-paper`, moss accent, `.btn-volt` CTA), paper picker
   card with an ink active chip. Never a dark full-width card as the last element of a light band
   (it strands a mist strip against the next ink band).

## 12. Round-5 arc & green laws (post-critique, binding — override §6, §10.1, §11.1–§11.5 where they conflict)

Round-4 blind critics conceded 7/9 axes but took "overall craft" decisively: the two-light-band
rhythm still lurched, volt CTAs sat on paper, the featured pricing card sliced across its seam,
the chat bubble was off-brand indigo, and the hero still carried two buttons and a price line.
These laws are the converged critic demands, implemented exactly.

1. **Three-act arc — ONE long light body.** The homepage is a deliberate three-act composition:
   - **Act I, DARK:** Header, Hero, TrustBar (`band-ink`).
   - **Act II, LIGHT:** AutomationExplorer, Services, Process, Proof, Pricing — ONE continuous
     `band-mist` body. Every in-band seam is flush: `pb-12 md:pb-14` / `pt-12 md:pt-14`, no
     hairline, no tone change, no strips.
   - **Act III, DARK:** FinalCTA, LeadCapture, Footer (`band-ink`).
   Exactly TWO ink↔mist seams exist (TrustBar→Explorer, Pricing→FinalCTA), both hard edges with
   no hairline. Explorer opens the body with the relocated hero trust strip + header filling the
   band-opening measure; Pricing closes it at `pb-20 md:pb-28 lg:pb-32`. The only ink islands
   inside the light body are the Explorer's recipe window and the featured pricing tier.

2. **Exactly two greens, decided by the surface.** The single deep green on light surfaces is
   **moss (`--moss`) — deepened to `#315B15` / `hsl(96, 62%, 22%)` in round 6, see §13.1.** No other dark
   green value may be introduced.
   - **Volt `#C6F628` appears on dark (ink) surfaces only:** `.btn-volt` CTAs, live/activity
     dots, the hero's `.gradient-text`, the Explorer payback numeral, the featured pricing
     card's border, the chat launcher's mark. Never on mist/paper — not even as a button fill.
   - **Moss appears on light (mist/paper) surfaces only,** and identically for every accent
     role there: `.btn-moss` primary CTAs (moss fill, white text, ~5.5:1 AA), the ONE accent
     phrase per section headline (`text-moss`), and every text link
     (round 6: every text link is the `.link-moss` utility — full-strength moss text AND
     underline, hover thickens the rule; alpha-tinted decorations are banned, see §13.1).
   - The *surface* decides, never the section: the ink recipe window and ink featured tier use
     volt inside the light body; a paper card inside a dark band would use moss. Never both
     greens on one surface.

3. **No card may slice a seam.** Cards never protrude past their row or band edge: the featured
   pricing tier sits flush with its siblings (no `-my-*` elevation — its ink fill, volt border,
   and taller padding carry the emphasis). Sections that close a band keep their closing padding
   outside any card.

4. **Hero, final form (supersedes §11.4).** Kicker + H1 (locked: "The busywork runs itself now."
   with the volt gradient on "runs itself") + a subhead of at most two lines + ONE primary CTA
   ("Get my quote", `.btn-volt`) with the 15-min call as an inline text link beside it + one
   3-item stat row whose values, prefixes ("<"), and unit suffixes share a single baseline
   (flex `items-baseline`, never `align-middle`). No second button, no price line, no trust
   strip: the trust strip lives at the top of the light body (Explorer), converted to
   light-surface colors. The hero reads as exactly one screen of content.

5. **Chat widget is brand, small, and out of the way.** The floating assistant is ink with a
   volt mark and hairline/volt border — indigo is banned everywhere. `bottom-4 right-4` and
   44px on mobile (56px from `md:` up), `z-40` so it can never sit over the `z-50` header, and
   CTA rows that share its corner keep clearance (`lg:pr-16` on bottom-right CTA rows). The
   open panel is `bg-ink-2` with mist/ink-3 bubbles and a volt send button.

6. **Marquee edges + label clearance.** `.marquee` carries fixed-width (3.5rem) edge fade-masks
   so chips dissolve before the viewport edge and never hard-clip mid-word at any width. The
   TrustBar label keeps `pt-10 md:pt-12` of clearance so it cannot crop under the sticky nav at
   typical scroll stops.

7. **No dead dark band before the footer.** LeadCapture ends at `pb-14 md:pb-16 lg:pb-20`; the
   Footer's `hairline-t` + its own `py-14 md:py-16` split the remaining whitespace. No empty
   same-ground strip on the page may exceed ~120px at 1440px (reaffirms §10.2).

## 13. Round-6 finisher laws (post-critique, binding — override §2, §11.4, §12.1–§12.4 where they conflict)

Round-5 critics conceded 8/9 axes; "overall craft" lost narrowly on four tells: four countable
greens, no single oversized moment, footer bloat, and a missing price anchor. These laws close them.

1. **EXACTLY two greens — final hexes, zero exceptions.**
   - **Volt `#C6F628` / `hsl(74, 92%, 56%)`** — dark (ink) surfaces only: `.btn-volt` CTAs,
     live dots, the hero `.gradient-text`, and at most ONE designated highlight per viewport
     (the Proof signature numeral, the Explorer payback numeral, the featured pricing border).
   - **Moss `#315B15` / `hsl(96, 62%, 22%)`** — the ONE deep green on light (mist/paper)
     surfaces, always at FULL token strength, for every accent role: `.btn-moss` pill fills
     (hover never shifts hue — lift + shadow only), `text-moss` accent phrases, and `.link-moss`
     text links (moss text AND moss underline, hover thickens the rule). White-on-moss is ~8:1;
     moss-on-mist is ~7.5:1.
   - **Alpha-tinted greens are banned on light surfaces**: no moss `rgba(...)` washes, 50%
     underlines, or 40% borders anywhere on mist/paper — a green there is the full moss token
     or it does not exist (neutral ink tints replaced the old green washes). On ink, volt
     alpha survives in exactly two roles: the ambient radial washes (hero-bg, FinalCTA, the
     signature band) and focus/hover glows — never as text, border, or chip tints. Focus
     rings follow the ground too: moss on light, volt inside `band-ink` / the featured tier.

2. **ONE oversized signature moment.** The featured client result lives OUTSIDE any card, in a
   full-bleed ink band inside the light body (Proof): `stat-giant` volt numeral **$28,800/yr**
   — the documented $2,400/mo labor saving annualized and LABELED "annualized" beside the
   numeral — with the client quote at reading size beneath it. It is the page's loudest element;
   the mist whitespace either side widens to `mt-16 md:mt-24 lg:mt-28` so the body alternates
   loud/quiet. This band is the third (and last) permitted ink island in the light body; its
   edges are hard, like every ink↔mist seam. Never add a second moment at this scale.

3. **Hero price anchor restored (supersedes §12.4's "no price line").** Directly under the CTA
   row sits ONE quiet Inter microline in `mist-muted` (`.caption`): "from $149/mo — setup
   included, cancel anytime". Every claim in it appears verbatim elsewhere on the page
   (Pricing, Process terms chips). It is never a button, never volt, never mono-caps.

4. **Footer diet.** One row: brand wordmark + the one-line message ("The busywork runs itself
   now.") + contact details on the left, the three link columns on the right; then the legal
   baseline. The newsletter has NO pitch block — a single quiet input row (ghost button) under
   the contact details at most. Footer link hovers brighten to mist, never green; volt in the
   footer is the wordmark accent + the live dot only.

5. **Small-craft floor (reaffirmed).** Marquee chips dissolve under `.marquee`'s fixed-width
   edge fade-masks — never hard-clipped mid-word. The hero stat row keeps value, `<` prefix,
   and unit suffix on one shared baseline (`items-baseline` + `whitespace-nowrap`), sized like
   its siblings. Testimonial cards equalize height (`h-full` flex column, `mt-auto` figcaption)
   in a stretched grid.

## 14. Round-7 craft laws (post-critique, binding — override §13.1's signature-band clauses and §13.2 where they conflict)

Round-6 blind critics conceded 7/9 but held "overall craft" and "proof" on four repeated nits:
every H2 stamped from the same "Plain sentence. Green sentence." mold, the $28,800 band
left-locked with half the viewport dead, a third dark flip strobing inside the light body, and
stats clipping mid-glyph under the sticky header. These laws close them.

1. **Headline variety — one formula, five constructions.** Section H2s all keep the
   `.text-display-lg` scale and the one-accent-maximum rule, but the *construction* must vary.
   The page's assignments (do not collapse them back into one mold):
   - **AutomationExplorer — question form:** "What could *run itself* in your business?"
     (moss mid-phrase; a deliberate echo of the hero's locked "runs itself").
   - **Services — plain single line:** "You run the business — the rest runs itself."
     THE one accent-free H2 on the page. Zero-accent is legal (§3 caps accents at one;
     it never required one).
   - **Process — kicker-number:** "**5–7 days** from first call to fully live." — the claim's
     numeral leads in moss (`tabular-nums`), the rest plain ink. Its eyebrow shortens to
     "How it works" so the H2's claim isn't pre-echoed one line above.
   - **Proof — inline emphasis word:** "Every number has a *person* behind it." — ONE moss
     word mid-sentence, nothing else green.
   - **Pricing — the signature two-sentence:** "Priced for small business. *Not enterprise.*"
     is the ONLY surviving "Plain sentence. Green sentence." construction. Keep it singular.
   Hero H1 stays locked (§12.4). New sections must pick a construction not already adjacent.

2. **The signature band is a LOUD LIGHT moment (supersedes §13.2's ink band and §13.1's
   signature-band volt wash).** The featured $28,800/yr result stays the page's loudest
   element and stays outside any card, but it sits on the MIST ground framed by full-bleed
   `hairline-t`/`hairline-b` rules — giant INK numeral, moss accents, no ground flip, no volt
   (light surface → moss, §12.2). Composition: numeral locked left with the verification
   badge ("Want to check? Ask — we'll make the intro." → #contact) directly beside it;
   honest counterweight right — the before/after savings bars (SVG: ink bar "~$2,400/mo
   manual" vs. a moss stub labeled "automated"; derived strictly from the documented
   case-study figure, no invented "after" dollar amount) with the client quote beneath.
   Neither half of the band may sit empty at 1440px. §13.1's volt-alpha ambient-wash list
   shrinks to hero-bg and FinalCTA. The light body's only ink islands are back to two:
   the Explorer recipe window and the featured pricing tier.

3. **Verified band sequence (round 7, the whole page).** Exactly TWO dark moments:
   - **DARK opening:** Header, Hero, TrustBar (`band-ink`).
   - **LIGHT body:** AutomationExplorer → Services → Process → Proof (including the
     signature band, now light) → Pricing — one continuous `band-mist`, flush in-band seams,
     ink *cards* only (recipe window, featured tier), never ink *bands*.
   - **DARK closing:** FinalCTA, LeadCapture, Footer (`band-ink`).
   Two ink↔mist seams total (TrustBar→Explorer, Pricing→FinalCTA). Any change that would
   introduce a third dark band inside the body is a regression, not a design choice.

4. **Sticky-header clearance, second belt.** Alongside the `:where([id]) { scroll-margin-top:
   6rem }` rule, the root carries `html { scroll-padding-top: 6rem }` so scrolls the margin
   rule can't reach (find-in-page, `:target` restores, tab-focus `scrollIntoView`) also land
   clear of the 64/72px header. Both values stay in lockstep — change one, change both.
   Giant numerals keep line-height ≥ 0.95 with no clipping ancestor (`overflow-hidden` may
   never wrap the Proof counter or stat rows).

## 15. Round-8 final laws (post-critique, binding — override §2, §11.1, §12.2, §12.6, §13.1, §13.5, and §14.2's counterweight clause where they conflict)

Round-7 critics conceded 7/9; the two narrow losses (proof, overall craft) traced to split
button grammar, marquee clipping in headless rendering, residual mono noise, and an abstract
proof counterweight. These laws close every objective remaining fix.

1. **ONE primary button treatment site-wide: primary button = volt fill + ink text on any
   ground; there is exactly one per viewport.** `.btn-volt` (volt `#C6F628` fill, ink text,
   ~14:1) is the ONLY filled button on the site and is now legal on light grounds too — the
   volt FILL is the action color everywhere; §12.2's "volt never on mist/paper" continues to
   govern volt as text/marks/borders, not button fills. `.btn-moss` is retired and deleted
   from `index.css` — no moss-filled buttons anywhere. Everything that is not the viewport's
   one primary is a ghost/outline pill (`.btn-ghost`, on light with the stronger
   `border-[rgba(8,12,22,0.25)] text-ink hover:border-moss` treatment) or a `.link-moss` /
   neutral text link — specifically demoted: "See the plan" (Services, ghost), "Ask for an
   intro" (Proof verify panel, ghost), the Explorer "Replay …" control (outline), and every
   secondary route-out link. Current volt primaries: Header nav CTA, Hero "Get my quote",
   Explorer "Get my quote for this", Process consultation "Get my quote", Pricing featured
   tier CTA, LeadCapture submit — never two in one viewport.

2. **Marquee clipping, guaranteed kill (supersedes the mask-only mechanism of §12.6/§13.5).**
   The CSS `mask-image` edge dissolve is a progressive enhancement only — headless Chromium
   has rendered the band without it, hard-clipping chips mid-word. The guaranteed mechanism
   is two `.marquee-edge` overlay divs inside `.marquee`: absolutely positioned
   ink→transparent `linear-gradient` strips (plain backgrounds — they render in every
   engine), width `clamp(3.5rem, 12vw, 7rem)`, fully opaque ink for their outer ~30%,
   `z-index: 10` above the transformed tracks, `pointer-events: none` so hover-pause still
   works, `aria-hidden`. `.marquee` is `position: relative` with `padding-inline: 1rem`.
   Never remove the overlays in favor of a mask-only approach.

3. **Monospace, final scope.** JetBrains Mono appears in exactly two places: `.eyebrow`
   labels, and INSIDE in-world product/demo artifacts (the hero AutomationFlow card, the
   Explorer recipe window incl. its payback calculator, SMS/call/console feeds, and the
   Proof CRM dashboard card). Everything else — stat captions, step numerals (display face),
   trust chips, form status strips, contact details, marker glyphs — is Inter (`.caption` /
   `font-sans`) or the display face for numerals. The TrustBar chips, Process step numerals,
   Services corner numerals, LeadCapture list numerals + form strip, and Header mobile
   contact block were converted in round 8; do not regress them to mono.

4. **The proof counterweight is a REAL product artifact.** The signature band's right column
   is a compact, faithful recreation of the product's own client CRM dashboard (source UI:
   `client/src/pages/crm.tsx` — leads pipeline stages, AI-enriched lead score, AI-drafted
   next action), rendered as a dark ink product window in the recipe-window grammar and
   labeled "The dashboard every client gets". It is the THIRD permitted ink island in the
   light body (with the Explorer recipe window and the featured pricing tier) — it is a
   compact card, never a band. Mono is legal inside it (in-world UI); its only volt is the
   live dot. Integrity: it recreates OUR OWN product UI — no invented client names on lead
   rows (industry/source labels only), and its interface figures are illustrative UI
   content, never client-result claims. The abstract before/after bars are retired.

5. **Precision consistency for the signature figure.** The featured result reads
   "≈ $28,800/yr" everywhere it appears — the approximation marker rides the numeral,
   consistent with the documented ~$2,400/mo source it annualizes ("Annualized from the
   documented ~$2,400/mo…"). Never present it as an exact figure.
