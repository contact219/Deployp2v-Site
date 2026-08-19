import { Link } from "wouter";
import { MapPin, Phone, Mail } from "lucide-react";

/**
 * Footer — ink band, hairline top. On a diet (round 7): ONE message +
 * contact + link columns in a single row, then the legal baseline.
 * The newsletter block is GONE entirely — no form, no input, nothing
 * competing with the page's one ask. Volt stays rationed to the wordmark
 * accent + the live dot; link hovers brighten to mist, never green.
 */

const EXPLORE_LINKS: Array<{ label: string; hash: string }> = [
  { label: "What we automate", hash: "#explorer" },
  { label: "Services", hash: "#services" },
  { label: "How it works", hash: "#how-it-works" },
  { label: "Proof", hash: "#proof" },
  { label: "Pricing", hash: "#pricing" },
  { label: "Contact", hash: "#contact" },
];

const RESOURCE_LINKS: Array<{ label: string; href: string }> = [
  { label: "Blog", href: "/blog" },
  { label: "Case studies", href: "/case-studies" },
  { label: "Industries", href: "/industries" },
  { label: "ROI calculator", href: "/roi-calculator" },
  { label: "Free resources", href: "/resources" },
  { label: "FAQ", href: "/faq" },
];

const COMPANY_LINKS: Array<{ label: string; href: string }> = [
  { label: "Contact", href: "/contact" },
  { label: "Privacy policy", href: "/privacy-policy" },
  { label: "Terms of service", href: "/terms-of-service" },
];

export default function Footer() {
  // Neutral hover — footer links never flash green (volt is rationed
  // to the wordmark accent + the live dot down in the baseline row).
  const linkClass =
    "text-sm text-mist-muted transition-colors duration-150 hover:text-mist";

  return (
    <footer className="band-ink hairline-t" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        DeployP2V — site footer
      </h2>

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* One row: brand message + contact on the left, link columns on
            the right. Nothing else — the newsletter is gone (round 7). */}
        <div className="grid gap-12 py-14 md:py-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <div>
            <Link
              href="/"
              className="font-display inline-flex items-baseline text-2xl font-bold tracking-tight"
            >
              Deploy<span className="text-volt">P2V</span>
            </Link>
            <p className="mt-4 font-display text-lg font-semibold text-mist">
              The busywork runs itself now.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-mist-muted">
              {/* Neutral icons — volt stays reserved for CTAs + live dots */}
              <li className="flex items-center gap-2.5">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-mist-muted" aria-hidden="true" />
                Wylie, Texas — working with owners everywhere
              </li>
              <li>
                <a
                  href="tel:+12146045735"
                  className="flex items-center gap-2.5 transition-colors duration-150 hover:text-mist"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0 text-mist-muted" aria-hidden="true" />
                  (214) 604-5735
                </a>
              </li>
              <li>
                <a
                  href="mailto:tsparks@deployp2v.com"
                  className="flex items-center gap-2.5 transition-colors duration-150 hover:text-mist"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0 text-mist-muted" aria-hidden="true" />
                  tsparks@deployp2v.com
                </a>
              </li>
            </ul>
          </div>

          <nav
            className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:pt-1"
            aria-label="Footer navigation"
          >
            <div>
              <h3 className="eyebrow text-mist-muted">Explore</h3>
              <ul className="mt-4 space-y-2.5">
                {EXPLORE_LINKS.map((item) => (
                  <li key={item.hash}>
                    <a href={`/${item.hash}`} className={linkClass}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="eyebrow text-mist-muted">Resources</h3>
              <ul className="mt-4 space-y-2.5">
                {RESOURCE_LINKS.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="eyebrow text-mist-muted">Company</h3>
              <ul className="mt-4 space-y-2.5">
                {COMPANY_LINKS.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        {/* Baseline */}
        <div className="hairline-t flex flex-col items-start justify-between gap-3 py-7 text-xs text-mist-muted sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} DeployP2V. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block h-1.5 w-1.5 rounded-full bg-volt"
            />
            Agents online 24/7
            {/* Admin stays reachable at /admin by URL only — no public link. */}
          </p>
        </div>
      </div>
    </footer>
  );
}
