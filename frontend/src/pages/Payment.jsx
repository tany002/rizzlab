import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CreditCard, Wallet, Smartphone, Lock, ArrowLeft, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { PAY } from "@/constants/testIds";
import { api } from "@/lib/api";
import { toast } from "sonner";

const PLANS = {
  ai_review: { name: "AI Review", price: 299, subtitle: "One-time" },
  premium: { name: "Premium Coaching", price: 4999, subtitle: "One-time" },
};

export default function Payment() {
  const [params] = useSearchParams();
  const plan = params.get("plan") || "ai_review";
  const info = PLANS[plan] || PLANS.ai_review;
  const [method, setMethod] = useState("upi");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const pay = async () => {
    setLoading(true);
    try {
      // Try to create order (requires login). If not logged in, still allow demo flow to analyzing screen.
      try {
        const { data } = await api.post("/payments/create-order", { plan, amount: info.price });
        await new Promise(r => setTimeout(r, 900));
        await api.post("/payments/verify", { order_id: data.order_id });
      } catch { /* demo flow */ }
      toast.success("Payment successful");
      navigate("/analyzing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-ink-muted hover:text-ink text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-8 grid lg:grid-cols-5 gap-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-3 bg-white rounded-[24px] border border-zinc-200 shadow-card p-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-ink-muted mb-4"><Lock className="w-3.5 h-3.5" /> Secure Checkout · Razorpay</div>
          <h1 className="font-outfit text-3xl font-semibold text-ink mb-6">Complete your payment.</h1>

          <div className="space-y-3 mb-6">
            <div className="text-xs uppercase tracking-widest text-ink-muted font-semibold">Payment Method</div>
            {[
              { id: "upi", label: "UPI", icon: Smartphone, sub: "GPay, PhonePe, Paytm" },
              { id: "card", label: "Credit / Debit Card", icon: CreditCard, sub: "Visa, Mastercard, Rupay" },
              { id: "wallet", label: "Wallets", icon: Wallet, sub: "Paytm, Mobikwik, Freecharge" },
            ].map(m => {
              const Icon = m.icon;
              const active = method === m.id;
              return (
                <button key={m.id} onClick={() => setMethod(m.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${active ? "border-brand bg-brand-soft" : "border-zinc-200 bg-white hover:border-zinc-300"}`}>
                  <div className={`w-11 h-11 rounded-xl grid place-items-center ${active ? "bg-brand text-white" : "bg-zinc-100 text-ink"}`}><Icon className="w-5 h-5" /></div>
                  <div className="flex-1 text-left">
                    <div className="text-ink font-medium">{m.label}</div>
                    <div className="text-xs text-ink-muted">{m.sub}</div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${active ? "border-brand" : "border-zinc-300"} grid place-items-center`}>
                    {active && <div className="w-2.5 h-2.5 rounded-full bg-brand" />}
                  </div>
                </button>
              );
            })}
          </div>

          {method === "upi" && (
            <div className="space-y-3">
              <Label>UPI ID</Label>
              <Input placeholder="yourname@okhdfc" className="h-12 rounded-xl" />
            </div>
          )}
          {method === "card" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Card Number</Label><Input placeholder="1234 5678 9012 3456" className="h-12 rounded-xl mt-2" /></div>
              <div><Label>Expiry</Label><Input placeholder="MM/YY" className="h-12 rounded-xl mt-2" /></div>
              <div><Label>CVV</Label><Input placeholder="123" className="h-12 rounded-xl mt-2" /></div>
            </div>
          )}
          {method === "wallet" && (
            <div className="text-sm text-ink-muted p-4 bg-zinc-50 rounded-xl">You'll be redirected to complete payment on your wallet.</div>
          )}

          <Button data-testid={PAY.payBtn} onClick={pay} disabled={loading}
            className="mt-8 w-full h-14 rounded-full bg-brand hover:bg-brand-hover text-white text-base shadow-brand hover:-translate-y-0.5 transition-transform">
            {loading ? "Processing…" : `Pay ₹${info.price.toLocaleString("en-IN")}`}
          </Button>
          <p className="text-xs text-ink-muted text-center mt-4">This is a demo checkout. No real charge is made.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white rounded-[24px] border border-zinc-200 shadow-card p-8 h-fit">
          <div className="text-xs uppercase tracking-widest text-ink-muted font-semibold mb-4">Order Summary</div>
          <div className="flex items-start justify-between pb-5 border-b border-zinc-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-brand" />
                <span className="font-outfit font-medium text-ink">{info.name}</span>
              </div>
              <div className="text-xs text-ink-muted">{info.subtitle}</div>
            </div>
            <div className="font-outfit font-medium text-ink">₹{info.price.toLocaleString("en-IN")}</div>
          </div>
          <div className="py-4 space-y-2 text-sm">
            <div className="flex justify-between text-ink-muted"><span>Subtotal</span><span>₹{info.price.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between text-ink-muted"><span>Taxes</span><span>Included</span></div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
            <span className="font-medium text-ink">Total</span>
            <span className="font-outfit text-2xl font-semibold text-ink">₹{info.price.toLocaleString("en-IN")}</span>
          </div>

          <div className="mt-6 space-y-2 text-sm text-ink-muted">
            {["Instant delivery", "Personalized to your profile", "Actionable — not generic"].map(x => (
              <div key={x} className="flex items-center gap-2"><Check className="w-4 h-4 text-brand" />{x}</div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
