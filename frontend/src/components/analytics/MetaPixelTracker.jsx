import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * SPA route-change PageViews using Meta's documented API call:
 *   fbq('track', 'PageView');
 *
 * Initial PageView is sent by the base snippet in public/index.html
 * (Meta Get Started — leave that call intact).
 */
export default function MetaPixelTracker() {
  const location = useLocation();
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    if (typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
  }, [location.pathname, location.search]);

  return null;
}
