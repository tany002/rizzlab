/**
 * Meta Pixel conversion event helpers (ViewContent, InitiateCheckout, Purchase).
 * Base init + first PageView: public/index.html (Meta Get Started base code).
 * @see https://developers.facebook.com/docs/meta-pixel/get-started
 */

function fbqTrack(eventName, params) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }
  if (params && Object.keys(params).length > 0) {
    window.fbq("track", eventName, params);
  } else {
    window.fbq("track", eventName);
  }
}

export function trackViewContent(params = {}) {
  fbqTrack("ViewContent", params);
}

export function trackInitiateCheckout(params = {}) {
  fbqTrack("InitiateCheckout", params);
}

export function trackPurchase(params = {}) {
  fbqTrack("Purchase", params);
}

export function trackMetaEvent(eventName, params) {
  fbqTrack(eventName, params);
}
