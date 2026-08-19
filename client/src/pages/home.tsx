import { useEffect } from "react";
import ChatbotWidget from "@/components/ChatbotWidget";
import MobileQuoteBar from "@/components/MobileQuoteBar";
import Header from "@/components/sections/Header";
import Hero from "@/components/sections/Hero";
import TrustBar from "@/components/sections/TrustBar";
import AutomationExplorer from "@/components/sections/AutomationExplorer";
import Services from "@/components/sections/Services";
import Process from "@/components/sections/Process";
import Proof from "@/components/sections/Proof";
import Pricing from "@/components/sections/Pricing";
import FinalCTA from "@/components/sections/FinalCTA";
import LeadCapture from "@/components/sections/LeadCapture";
import Footer from "@/components/sections/Footer";

export default function Home() {
  // Support /#anchor deep links (e.g. /#explorer): handle both initial load and
  // later hashchange events. Sections mount/layout over several frames, so on
  // load we retry until the target exists, jump instantly, then re-assert once
  // after layout settles (fonts/images can shift the target). The sticky-header
  // offset is handled by the global `scroll-margin-top` rule in index.css.
  useEffect(() => {
    let raf = 0;
    let settleTimer = 0;

    const scrollToHash = (behavior: ScrollBehavior) => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return false;
      const el = document.getElementById(id);
      if (!el) return false;
      el.scrollIntoView({ behavior, block: "start" });
      return true;
    };

    if (window.location.hash) {
      let attempts = 0;
      const tryScroll = () => {
        if (scrollToHash("auto")) {
          // Layout can still shift under us — correct once, instantly.
          settleTimer = window.setTimeout(() => scrollToHash("auto"), 250);
        } else if (attempts++ < 30) {
          raf = requestAnimationFrame(tryScroll);
        }
      };
      raf = requestAnimationFrame(tryScroll);
    }

    const onHashChange = () => scrollToHash("smooth");
    window.addEventListener("hashchange", onHashChange);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settleTimer);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  return (
    <div className="band-ink min-h-screen font-sans antialiased">
      <Header />
      {/* Background logic (DESIGN.md §12, round 5): a deliberate three-act
          arc. Act I DARK: Header, Hero, TrustBar. Act II — ONE LONG LIGHT
          BODY, all mist: AutomationExplorer, Services, Process, Proof,
          Pricing (in-band seams flush: pb-12 md:pb-14 / pt-12 md:pt-14,
          no hairline, no tone change). Act III DARK: FinalCTA, LeadCapture,
          Footer. Exactly TWO ink↔mist seams on the page, both hard edges.
          Do not add bands or split the light body. */}
      <main>
        <Hero />
        <TrustBar />
        <AutomationExplorer />
        <Services />
        <Process />
        <Proof />
        <Pricing />
        <FinalCTA />
        <LeadCapture />
      </main>
      <Footer />
      <ChatbotWidget />
      {/* Phone-only sticky ask: appears after ~60% scroll, yields to the
          closing sequence, and clears the chat FAB while visible. */}
      <MobileQuoteBar />
    </div>
  );
}
