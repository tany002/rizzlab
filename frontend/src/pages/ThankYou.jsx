import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PURCHASE_PENDING_KEY,
  PURCHASE_TRACKED_PREFIX,
  purchaseEventId,
  trackMetaEventOnce,
} from "@/lib/metaPixel";

const DEFAULT_PURCHASE = {
  value: 249,
  currency: "INR",
  content_name: "AI Rizz Score",
  content_type: "product",
};

function readPendingPurchase() {
  try {
    const raw = sessionStorage.getItem(PURCHASE_PENDING_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function ThankYou() {
  const navigate = useNavigate();
  const purchaseFiredRef = useRef(false);

  useEffect(() => {
    const pending = readPendingPurchase();

    if (pending?.payment_id) {
      const trackedKey = `${PURCHASE_TRACKED_PREFIX}${pending.payment_id}`;
      if (!purchaseFiredRef.current && !sessionStorage.getItem(trackedKey)) {
        purchaseFiredRef.current = true;

        const payload = {
          value: pending.value ?? DEFAULT_PURCHASE.value,
          currency: pending.currency ?? DEFAULT_PURCHASE.currency,
          content_name: pending.content_name ?? DEFAULT_PURCHASE.content_name,
          content_type: pending.content_type ?? DEFAULT_PURCHASE.content_type,
        };
        const eventId = purchaseEventId(pending.payment_id);

        const fired = trackMetaEventOnce(trackedKey, "Purchase", payload, eventId);
        if (fired) {
          console.info("[thank-you] Meta Purchase event fired", { ...payload, eventID: eventId });
        }
      } else if (purchaseFiredRef.current) {
        console.info("[meta-pixel] Purchase skipped", {
          reason: "purchaseFiredRef already set",
          payment_id: pending.payment_id,
          eventID: pending.payment_id,
        });
      } else if (sessionStorage.getItem(trackedKey)) {
        console.info("[meta-pixel] Purchase skipped", {
          reason: "already tracked (ThankYou guard)",
          payment_id: pending.payment_id,
          eventID: pending.payment_id,
          storageKey: trackedKey,
        });
      }
      sessionStorage.removeItem(PURCHASE_PENDING_KEY);
      return;
    }

    const alreadyTracked = Object.keys(sessionStorage).some((k) =>
      k.startsWith(PURCHASE_TRACKED_PREFIX),
    );
    console.info("[meta-pixel] Purchase skipped", {
      reason: alreadyTracked ? "missing payment (already tracked in session)" : "missing payment",
      pending,
    });
    if (!alreadyTracked) {
      console.warn("[thank-you] No verified purchase in session; redirecting to payment");
      navigate("/payment?plan=ai_review", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-[24px] border border-zinc-200 shadow-card p-8 text-center"
      >
        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 grid place-items-center">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-soft text-brand text-xs font-medium mb-4">
          <Sparkles className="w-3.5 h-3.5" /> Payment confirmed
        </div>

        <h1 className="font-outfit text-3xl font-semibold tracking-tight text-ink mb-2">
          Payment Successful
        </h1>
        <p className="text-ink-muted mb-3">
          Your AI Rizz Report is being generated
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium mb-6">
          You saved ₹450 today 🎉
        </div>

        <Button
          onClick={() => navigate("/complete-details")}
          className="w-full h-12 rounded-full bg-gradient-to-r from-brand to-[#8B5CF6] hover:opacity-95 text-white font-medium shadow-[0_16px_50px_-12px_rgba(109,94,247,0.6)]"
        >
          Continue
        </Button>
      </motion.div>
    </div>
  );
}
