import { useEffect } from 'react';
import { useLocation } from 'wouter';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

interface GoogleAnalyticsProps {
  measurementId: string;
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const [location] = useLocation();

  useEffect(() => {
    // Load GA4 script dynamically
    if (!document.getElementById('ga-script')) {
      const script = document.createElement('script');
      script.id = 'ga-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', measurementId, {
        page_path: location,
      });
    }
  }, [measurementId]);

  // Track page views on route change
  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', measurementId, {
        page_path: location,
      });
    }
  }, [location, measurementId]);

  return null;
}

// Event tracking helper
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

// Lead capture tracking
export function trackLeadCapture(source: string) {
  trackEvent('generate_lead', 'engagement', source);
}

// Contact form submission tracking
export function trackContactSubmission() {
  trackEvent('contact_form_submit', 'conversion', 'contact_page');
}
