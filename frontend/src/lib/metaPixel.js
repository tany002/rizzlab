/**
 * Meta Pixel standard event helpers.
 * Base init + first PageView: public/index.html (Meta Get Started base code).
 * SPA PageView on route change: MetaPixelTracker.jsx
 * @see https://developers.facebook.com/docs/meta-pixel/reference
 * @see https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events
 */

function fbqTrack(eventName, params, eventId) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }
  const hasParams = params && Object.keys(params).length > 0;
  const eventData = eventId ? { eventID: eventId } : undefined;

  if (eventData) {
    window.fbq("track", eventName, hasParams ? params : {}, eventData);
  } else if (hasParams) {
    window.fbq("track", eventName, params);
  } else {
    window.fbq("track", eventName);
  }
}

/**
 * Deterministic event_id for Purchase — reuse the same value as CAPI `event_id`
 * when sending server-side Purchase events for Pixel + CAPI deduplication.
 */
export function purchaseEventId(paymentId) {
  return paymentId;
}

/**
 * Fire a standard Meta event at most once per browser tab session.
 * Prevents duplicate conversion events on page refresh.
 *
 * @param {string} [eventId] — optional 4th fbq arg `{ eventID }` for CAPI dedup
 */
export function trackMetaEventOnce(storageKey, eventName, params = {}, eventId) {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem(storageKey)) return false;
    sessionStorage.setItem(storageKey, "1");
  } catch {
    return false;
  }
  fbqTrack(eventName, params, eventId);
  return true;
}

export function trackCompleteRegistration(params = {}) {
  fbqTrack("CompleteRegistration", params);
}

export function trackInitiateCheckout(params = {}) {
  fbqTrack("InitiateCheckout", params);
}

export function trackPurchase(params = {}, eventId) {
  fbqTrack("Purchase", params, eventId);
}

export function trackViewContent(params = {}) {
  fbqTrack("ViewContent", params);
}

export function trackMetaEvent(eventName, params) {
  fbqTrack(eventName, params);
}

/** sessionStorage key — one CompleteRegistration per tab session */
export const COMPLETE_REGISTRATION_TRACKED_KEY = "rizzlab_complete_registration_tracked";

/** sessionStorage key prefix — one InitiateCheckout per Razorpay order */
export const INITIATE_CHECKOUT_TRACKED_PREFIX = "rizzlab_initiate_checkout_";

/** sessionStorage key prefix — one Purchase per verified payment */
export const PURCHASE_TRACKED_PREFIX = "rizzlab_purchase_tracked_";

/** Pending purchase payload written after backend verify succeeds */
export const PURCHASE_PENDING_KEY = "rizzlab_purchase_pending";
