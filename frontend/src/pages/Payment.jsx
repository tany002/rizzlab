import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, ArrowLeft, Sparkles, Check, Loader2, AlertTriangle, RotateCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PAY } from "@/constants/testIds";
import { api, assertApiConfigured } from "@/lib/api";
import { toast } from "sonner";
import {
  INITIATE_CHECKOUT_TRACKED_PREFIX,
  PURCHASE_PENDING_KEY,
  trackMetaEventOnce,
} from "@/lib/metaPixel";
import { VERIFIED_PAYMENT_KEY } from "@/lib/paymentSession";
import { trackEvent, trackPaymentStarted, trackPaymentSuccess } from "@/lib/analytics";

const RAZORPAY_SDK = "https://checkout.razorpay.com/v1/checkout.js";

const PRICING = {
  regularPrice: 499,
  salePrice: 249,
  discountPercent: 50,
  discountAmount: 250,
  offerName: "Weekend Offer",
};

const PLANS = {
  ai_review: { name: "AI Rizz Score Report", price: PRICING.salePrice, subtitle: "One-time payment", desc: "Personalized AI analysis of your dating profile" },
  premium: { name: "Premium Coaching", price: 4999, subtitle: "One-time payment", desc: "Everything above + 1:1 expert session" },
};

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector(`script[src="${RAZORPAY_SDK}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      return;
    }
    const s = document.createElement("script");
    s.src = RAZORPAY_SDK;
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function Payment() {
  const [params] = useSearchParams();
  const plan = params.get("plan") || "ai_review";
  const info = PLANS[plan] || PLANS.ai_review;

  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [failure, setFailure] = useState(null);
  const [closedMsg, setClosedMsg] = useState(false);
  const [lastOrderId, setLastOrderId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { loadRazorpayScript().then(setSdkReady); }, []);

  const startCheckout = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setClosedMsg(false);
    setFailure(null);

    try {
      const ok = sdkReady || (await loadRazorpayScript());
      if (!ok || !window.Razorpay) {
        setFailure({ title: "Payment SDK failed to load", message: "Please check your internet connection and try again." });
        return;
      }

      const apiBase = assertApiConfigured();
      trackPaymentStarted();
      console.info("[payment] Creating order", { plan, amount: info.price, apiBase });
      const { data } = await api.post("/payments/create-order", { plan, amount: info.price });
      setLastOrderId(data.order_id);
      console.info("[payment] Order created", { orderId: data.order_id, amount: data.amount, currency: data.currency });

      const rzp = new window.Razorpay({
        key: data.key_id || process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        order_id: data.order_id,
        name: "RizzLab",
        description: info.name,
        image: "/favicon.ico",
        theme: { color: "#6D5EF7" },
        modal: {
          ondismiss: () => {
            console.warn("[payment] Razorpay checkout dismissed by user", { orderId: data.order_id });
            setLoading(false);
            setClosedMsg(true);
            api.post("/payments/failure", { order_id: data.order_id, reason: "user_dismissed" }).catch(() => {});
          },
        },
        handler: async (response) => {
          console.info("[payment] Razorpay callback received", {
            orderId: response?.razorpay_order_id,
            paymentId: response?.razorpay_payment_id,
          });
          try {
            console.info("[payment] Sending verify request", { orderId: response.razorpay_order_id, paymentId: response.razorpay_payment_id });
            const verify = await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verify.data?.status === "paid") {
              console.info("[payment] Signature verification passed and payment activated", verify.data);
              toast.success("Payment verified. Let's build your report…");
              if (plan === "ai_review") {
                trackPaymentSuccess(PRICING.regularPrice, PRICING.salePrice);
              }
              const paidValue = data.amount / 100;
              sessionStorage.setItem(
                PURCHASE_PENDING_KEY,
                JSON.stringify({
                  payment_id: response.razorpay_payment_id,
                  order_id: response.razorpay_order_id,
                  value: paidValue,
                  currency: data.currency || "INR",
                  content_name: plan === "premium" ? "Premium Coaching" : "AI Rizz Score",
                  content_type: "product",
                }),
              );
              sessionStorage.setItem(
                VERIFIED_PAYMENT_KEY,
                JSON.stringify({
                  payment_id: response.razorpay_payment_id,
                  order_id: response.razorpay_order_id,
                }),
              );
              console.info("[payment] Redirecting to /thank-you");
              navigate("/thank-you", { replace: true });
            } else {
              console.error("[payment] Verify response did not return paid status", verify.data);
              setFailure({ title: "Verification failed", message: "We couldn't verify this payment. If money was deducted, it will auto-refund in 5-7 days." });
            }
          } catch (err) {
            console.error("[payment] Verify request failed", err?.response?.data || err);
            setFailure({ title: "Verification failed", message: err?.response?.data?.detail || "Signature verification failed. If money was deducted, it will auto-refund." });
          } finally {
            setLoading(false);
          }
        },
      });

      rzp.on("payment.failed", (resp) => {
        console.error("[payment] Razorpay reported payment.failed", resp);
        setLoading(false);
        api.post("/payments/failure", { order_id: data.order_id, reason: resp?.error?.description || "payment.failed" }).catch(() => {});
        setFailure({ title: "Payment wasn't completed.", message: resp?.error?.description || "Please try again or use a different payment method." });
      });

      const checkoutParams = {
        value: data.amount / 100,
        currency: data.currency || "INR",
        content_name: info.name,
        content_type: "product",
      };
      const initiateTrackedKey = `${INITIATE_CHECKOUT_TRACKED_PREFIX}${data.order_id}`;
      const checkoutEventFired = trackMetaEventOnce(initiateTrackedKey, "InitiateCheckout", checkoutParams);
      if (checkoutEventFired) {
        console.info("[payment] Meta InitiateCheckout event fired", checkoutParams);
      }

      trackEvent("razorpay_opened");
      rzp.open();
      console.info("[payment] Razorpay checkout opened", { orderId: data.order_id });
    } catch (err) {
      console.error("[payment] Failed to start checkout", err?.response?.data || err);
      setLoading(false);
      setFailure({ title: "Couldn't start payment", message: err?.response?.data?.detail || err?.message || "Please try again." });
    }
  }, [loading, sdkReady, plan, info, navigate]);

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-ink-muted hover:text-ink text-sm" data-testid="pay-back">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 grid gap-6">
        {/* Order summary */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[24px] border border-zinc-200 shadow-card p-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-ink-muted mb-4">
            <Lock className="w-3.5 h-3.5" /> Secure Checkout · Razorpay
          </div>
          <h1 className="font-outfit text-3xl font-semibold text-ink">Complete your payment</h1>
          <p className="text-ink-muted mt-1">You'll be redirected to Razorpay's secure checkout. UPI, cards, netbanking & wallets supported.</p>

          <div className="mt-8 pb-5 border-b border-zinc-100 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-brand" />
                <span className="font-outfit font-medium text-ink">{info.name}</span>
              </div>
              <div className="text-sm text-ink-muted">{info.desc}</div>
              <div className="text-xs text-ink-muted mt-1">{info.subtitle}</div>
            </div>
            <div className="font-outfit font-medium text-ink text-lg">₹{info.price.toLocaleString("en-IN")}</div>
          </div>

          <div className="py-4 space-y-2 text-sm">
            <div className="flex justify-between text-ink-muted"><span>Subtotal</span><span>₹{info.price.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between text-ink-muted"><span>Taxes</span><span>Included</span></div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
            <span className="font-medium text-ink">Total</span>
            <span className="font-outfit text-2xl font-semibold text-ink">₹{info.price.toLocaleString("en-IN")}</span>
          </div>

          {plan === "ai_review" && (
            <div className="mt-6 rounded-2xl bg-orange-50 border border-orange-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-orange-600">🔥 {PRICING.offerName}</span>
                <span className="text-xs font-semibold text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full">
                  {PRICING.discountPercent}% OFF
                </span>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Regular Price</span>
                  <span>₹{PRICING.regularPrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount</span>
                  <span>−₹{PRICING.discountAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between font-bold text-ink text-base pt-2 border-t border-orange-200 mt-1">
                  <span>Today You Pay</span>
                  <span>₹{PRICING.salePrice.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          )}

          <Button data-testid={PAY.payBtn} onClick={startCheckout} disabled={loading}
            className="mt-6 w-full h-14 rounded-full bg-gradient-to-r from-brand to-[#8B5CF6] hover:opacity-95 text-white text-base font-medium shadow-[0_16px_50px_-12px_rgba(109,94,247,0.6)] hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0">
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Preparing checkout…</>
            ) : (
              <>Pay ₹{info.price.toLocaleString("en-IN")} securely</>
            )}
          </Button>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-ink-muted">
            <Lock className="w-3 h-3" /> 256-bit encryption · Powered by Razorpay
          </div>
        </motion.div>

        {/* Trust points */}
        <div className="grid sm:grid-cols-3 gap-3">
          {["Instant delivery", "One-time payment", "Personalized to you"].map((x) => (
            <div key={x} className="bg-white rounded-2xl border border-zinc-200 p-4 text-sm text-ink-muted flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" /> {x}
            </div>
          ))}
        </div>

        {/* Non-intrusive closed-modal notice */}
        <AnimatePresence>
          {closedMsg && !failure && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-800 flex items-center gap-3"
              data-testid="pay-closed-msg">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              You closed the checkout. Your payment wasn't started — try again when you're ready.
              <button onClick={() => setClosedMsg(false)} className="ml-auto text-amber-700 hover:text-amber-900"><X className="w-4 h-4" /></button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Failure Modal */}
      <Dialog open={!!failure} onOpenChange={(o) => !o && setFailure(null)}>
        <DialogContent data-testid="pay-failure-modal" className="rounded-[20px]">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 grid place-items-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <DialogTitle className="font-outfit text-2xl">{failure?.title || "Payment wasn't completed."}</DialogTitle>
            <DialogDescription className="text-ink-muted">
              {failure?.message || "Something went wrong. If money was deducted, it will auto-refund in 5-7 days."}
              {lastOrderId && <div className="mt-2 text-xs font-mono text-ink-muted">Order: {lastOrderId}</div>}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => { setFailure(null); navigate(-1); }} data-testid="pay-goback-btn" className="rounded-full">
              Go Back
            </Button>
            <Button onClick={() => { setFailure(null); startCheckout(); }} data-testid="pay-retry-btn"
              className="rounded-full bg-brand hover:bg-brand-hover text-white">
              <RotateCw className="w-4 h-4 mr-2" /> Retry Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
