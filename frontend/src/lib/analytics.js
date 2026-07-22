import { api } from "./api";

const SESSION_KEY = "_rl_sid";

function generateUUID() {
  if (typeof crypto?.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function getOrCreateSessionId() {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = generateUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return generateUUID();
  }
}

function getUtmAndClickParams() {
  try {
    const p = new URLSearchParams(window.location.search);
    const result = {};
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "fbclid"]) {
      const val = p.get(key);
      if (val) result[key] = val;
    }
    return result;
  } catch {
    return {};
  }
}

/**
 * Fire-and-forget analytics event. Never throws.
 */
export function trackEvent(name, extra = {}) {
  try {
    const payload = {
      event: name,
      sessionId: getOrCreateSessionId(),
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
      ...extra,
    };
    api.post("/analytics/event", payload).catch(() => {});
  } catch {
    // swallow all errors
  }
}

/**
 * Track the landing page view with full attribution context.
 * Call once on Landing mount.
 */
export function trackLandingView() {
  try {
    trackEvent("landing_view", {
      referrer: document.referrer || undefined,
      userAgent: navigator.userAgent,
      ...getUtmAndClickParams(),
    });
  } catch {
    // swallow
  }
}
