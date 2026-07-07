import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';

/**
 * useTracker — silently reports page views to the native analytics engine.
 *
 * Generates a unique session ID per browser tab (stored in sessionStorage),
 * sends the referrer + UTM parameters on the first page load,
 * and sends subsequent path changes as follow-up page views.
 *
 * This hook never throws or blocks the user experience.
 */
export default function useTracker() {
  const location = useLocation();
  const { user } = useAuth();
  const isFirstPage = useRef(true);

  useEffect(() => {
    // Generate or retrieve session ID (unique per tab)
    let sessionId = sessionStorage.getItem('aca_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('aca_session_id', sessionId);
    }

    // Generate or retrieve persistent visitor ID (unique per browser)
    let visitorId = localStorage.getItem('aca_visitor_id');
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem('aca_visitor_id', visitorId);
    }

    // Build payload
    const payload = {
      sessionId,
      visitorId,
      userId: user?.id || null,
      path: location.pathname,
    };

    // Only send referrer + UTM on the very first page of the session
    if (isFirstPage.current) {
      isFirstPage.current = false;

      // Referrer domain (external site they came from)
      try {
        const ref = document.referrer;
        if (ref) {
          const refUrl = new URL(ref);
          // Don't track internal referrals
          if (refUrl.hostname !== window.location.hostname) {
            payload.referrer = refUrl.hostname;
          }
        }
      } catch (_) { /* invalid referrer URL, ignore */ }

      // UTM parameters
      const params = new URLSearchParams(location.search);
      if (params.get('utm_source'))   payload.utmSource   = params.get('utm_source');
      if (params.get('utm_medium'))   payload.utmMedium   = params.get('utm_medium');
      if (params.get('utm_campaign')) payload.utmCampaign = params.get('utm_campaign');
    }

    // Fire and forget — never block UI
    fetch('/api/track/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true, // ensures beacon is sent even on tab close
    }).catch(() => { /* silently ignore tracking errors */ });
  }, [location.pathname, location.search]);
}
