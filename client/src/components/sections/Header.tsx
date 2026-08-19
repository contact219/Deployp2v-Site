import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ArrowRight } from "lucide-react";

// SVG Logo — reused from the original home.tsx mark, recolored to the volt accent
const DeployP2VLogo = ({ className = "w-8 h-8 text-volt" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

const anchorLinks: { id: string; label: string }[] = [
  { id: "services", label: "Services" },
  { id: "how-it-works", label: "How it works" },
  { id: "pricing", label: "Pricing" },
];

const routeLinks: { href: string; label: string }[] = [
  { href: "/case-studies", label: "Case studies" },
  { href: "/faq", label: "FAQ" },
];

const mobileOnlyRoutes: { href: string; label: string }[] = [
  { href: "/industries", label: "Industries" },
  { href: "/roi-calculator", label: "ROI calculator" },
  { href: "/blog", label: "Blog" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // scrollIntoView honors the global `scroll-margin-top` on [id] targets
  // (index.css) — the one source of truth for sticky-nav clearance. Never
  // reintroduce a hand-tuned pixel offset here.
  const scrollToAnchor = (id: string) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // Not on the homepage — go home first, then scroll
      setLocation("/");
      window.setTimeout(() => {
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  };

  return (
    <header
      className={`nav-blur sticky top-0 z-50 text-mist transition-shadow duration-300 ${
        scrolled ? "shadow-[0_8px_32px_rgba(8,12,22,0.45)]" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex h-16 md:h-[72px] items-center justify-between gap-4">
          {/* Logo */}
          <button
            onClick={() => scrollToAnchor("hero")}
            className="flex items-center gap-2.5 shrink-0"
            aria-label="DeployP2V — back to top"
          >
            <DeployP2VLogo />
            <span className="font-display font-bold text-lg tracking-tight text-mist">
              DeployP2V
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Primary">
            {anchorLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToAnchor(link.id)}
                className="text-sm font-medium text-mist-muted hover:text-mist transition-colors duration-150"
              >
                {link.label}
              </button>
            ))}
            {routeLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-mist-muted hover:text-mist transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Secondary: the call, as a text link that keeps tel: */}
            <a
              href="tel:+12146045735"
              className="hidden xl:inline-block text-sm font-medium text-mist-muted hover:text-mist transition-colors duration-150 whitespace-nowrap"
            >
              Book a free 15-min call
            </a>
            {/* Primary: the ONE volt ask, one line, never wraps */}
            <button
              onClick={() => scrollToAnchor("contact")}
              className="btn-volt hidden sm:inline-flex !py-2.5 !px-5 text-sm whitespace-nowrap"
            >
              Get my quote
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="lg:hidden p-2 -mr-2 text-mist hover:text-volt transition-colors duration-150"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-50 bg-ink overflow-y-auto">
          <nav className="px-5 py-6 flex flex-col" aria-label="Mobile">
            <p className="eyebrow text-mist-muted mb-3">On this page</p>
            {anchorLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToAnchor(link.id)}
                className="text-left font-display text-2xl font-semibold py-2.5 text-mist hover:text-volt transition-colors duration-150"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => scrollToAnchor("proof")}
              className="text-left font-display text-2xl font-semibold py-2.5 text-mist hover:text-volt transition-colors duration-150"
            >
              Results
            </button>

            <div className="hairline-t my-5" />
            <p className="eyebrow text-mist-muted mb-3">More</p>
            <div className="grid grid-cols-2 gap-x-4">
              {[...routeLinks, ...mobileOnlyRoutes].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="py-2 text-base text-mist-muted hover:text-mist transition-colors duration-150"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <button
              onClick={() => scrollToAnchor("contact")}
              className="btn-volt w-full mt-7"
            >
              Get my quote
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
            <a
              href="tel:+12146045735"
              onClick={() => setMenuOpen(false)}
              className="mt-4 text-center text-sm font-medium text-mist underline decoration-[rgba(246,247,242,0.35)] underline-offset-4 hover:decoration-[rgba(246,247,242,0.8)] transition-colors duration-150"
            >
              Book a free 15-min call
            </a>

            {/* Inter (round 8): contact details are content, not terminal
                chrome — mono is reserved for .eyebrow + in-world demo UI. */}
            <div className="mt-6 pb-10 caption text-mist-muted space-y-1.5">
              <p>
                <a href="tel:+12146045735" className="hover:text-mist">(214) 604-5735</a>
              </p>
              <p>
                <a href="mailto:tsparks@deployp2v.com" className="hover:text-mist">tsparks@deployp2v.com</a>
              </p>
              <p>Wylie, Texas</p>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
