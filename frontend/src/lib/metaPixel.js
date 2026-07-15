/**
 * Meta (Facebook) Pixel — programmatic loader for SPA use.
 * @see https://developers.facebook.com/docs/meta-pixel/implementation
 */

export const META_PIXEL_ID =
  process.env.REACT_APP_META_PIXEL_ID?.trim() || "871593608965861";

const FB_SCRIPT = "https://connect.facebook.net/en_US/fbevents.js";

let initStarted = false;
let initComplete = false;

function isEnabled() {
  return Boolean(META_PIXEL_ID) && process.env.REACT_APP_META_PIXEL_DISABLED !== "true";
}

/** Bootstrap fbq queue before the external script loads (standard Meta snippet pattern). */
function ensureFbqStub() {
  if (typeof window === "undefined") return null;
  if (window.fbq) return window.fbq;

  const queue = [];
  const fbq = function (...args) {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
    } else {
      queue.push(args);
    }
  };
  fbq.push = fbq;
  fbq.loaded = false;
  fbq.version = "2.0";
  fbq.queue = queue;

  window.fbq = fbq;
  window._fbq = fbq;
  return fbq;
}

function loadPixelScript() {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("Meta Pixel requires a browser environment"));
      return;
    }
    if (document.querySelector(`script[src="${FB_SCRIPT}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.async = true;
    script.src = FB_SCRIPT;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Meta Pixel script"));
    const firstScript = document.getElementsByTagName("script")[0];
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  });
}

/**
 * Initialize the pixel once per session. Safe to call multiple times.
 */
export function initMetaPixel() {
  if (!isEnabled() || initStarted) return;
  initStarted = true;

  ensureFbqStub();
  window.fbq("init", META_PIXEL_ID);
  initComplete = true;

  loadPixelScript().catch((err) => {
    console.warn("[meta-pixel] Script load failed (events are queued):", err?.message || err);
  });
}

function track(eventName, params) {
  if (!isEnabled()) return;
  if (!initComplete) initMetaPixel();
  if (!window.fbq) return;

  if (params && Object.keys(params).length > 0) {
    window.fbq("track", eventName, params);
  } else {
    window.fbq("track", eventName);
  }
}

/** Standard SPA page view — call on every route change. */
export function trackPageView() {
  track("PageView");
}

/**
 * ViewContent — product/report page views, pricing sections, sample report, etc.
 * @param {Object} [params]
 * @param {string|string[]} [params.content_ids]
 * @param {string} [params.content_name]
 * @param {string} [params.content_type]
 * @param {number} [params.value]
 * @param {string} [params.currency]
 */
export function trackViewContent(params = {}) {
  track("ViewContent", params);
}

/**
 * InitiateCheckout — user opens payment / starts Razorpay checkout.
 * @param {Object} [params]
 * @param {number} [params.value] — amount in major currency units (e.g. INR rupees)
 * @param {string} [params.currency]
 * @param {string|string[]} [params.content_ids]
 * @param {number} [params.num_items]
 */
export function trackInitiateCheckout(params = {}) {
  track("InitiateCheckout", params);
}

/**
 * Purchase — successful payment verified.
 * @param {Object} [params]
 * @param {number} [params.value]
 * @param {string} [params.currency]
 * @param {string|string[]} [params.content_ids]
 * @param {string} [params.content_name]
 */
export function trackPurchase(params = {}) {
  track("Purchase", params);
}

/** Generic escape hatch for custom / future standard events. */
export function trackMetaEvent(eventName, params) {
  track(eventName, params);
}
