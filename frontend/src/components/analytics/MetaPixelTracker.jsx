import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initMetaPixel, META_PIXEL_ID, trackPageView } from "@/lib/metaPixel";

/**
 * Mount once inside <BrowserRouter>.
 * - Initializes Meta Pixel on first render
 * - Fires PageView on initial load and every client-side navigation
 */
export default function MetaPixelTracker() {
  const location = useLocation();

  useEffect(() => {
    initMetaPixel();
  }, []);

  useEffect(() => {
    trackPageView();
  }, [location.pathname, location.search]);

  if (!META_PIXEL_ID || process.env.REACT_APP_META_PIXEL_DISABLED === "true") {
    return null;
  }

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
}
