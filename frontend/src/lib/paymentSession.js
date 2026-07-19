/** Session handoff after successful payment verification (not used for Meta Pixel). */
export const VERIFIED_PAYMENT_KEY = "rizzlab_verified_payment";

export function readVerifiedPayment() {
  try {
    const raw = sessionStorage.getItem(VERIFIED_PAYMENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
