import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import Home from "@/pages/home";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import Admin from "@/pages/admin";
import FAQ from "@/pages/faq";
import CaseStudies from "@/pages/case-studies";
import ROICalculator from "@/pages/roi-calculator";
import Resources from "@/pages/resources";
import NotFound from "@/pages/not-found";

// New markdown-based pages
import { BlogIndex } from "@/pages/blog/BlogIndex";
import { BlogPost } from "@/pages/blog/BlogPost";
import { IndustryIndex } from "@/pages/industries/IndustryIndex";
import { IndustryPage } from "@/pages/industries/IndustryPage";
import { Contact } from "@/pages/Contact";

// Analytics
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";

// GA4 Measurement ID - set this in your environment or replace directly
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "G-RTJ4NNJN7H";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={Admin} />
      <Route path="/faq" component={FAQ} />
      <Route path="/case-studies" component={CaseStudies} />
      <Route path="/blog" component={BlogIndex} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/industries" component={IndustryIndex} />
      <Route path="/industries/:slug" component={IndustryPage} />
      <Route path="/contact" component={Contact} />
      <Route path="/roi-calculator" component={ROICalculator} />
      <Route path="/resources" component={Resources} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {/* Google Analytics 4 - tracks page views automatically */}
          {GA_MEASUREMENT_ID && (
            <GoogleAnalytics measurementId={GA_MEASUREMENT_ID} />
          )}
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
