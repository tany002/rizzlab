import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { readVerifiedPayment } from "@/lib/paymentSession";
import { toast } from "sonner";

export default function CompleteDetails() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const verified = readVerifiedPayment();
    if (!verified?.payment_id) {
      console.warn("[complete-details] No verified payment in session; redirecting to payment");
      navigate("/payment?plan=ai_review", { replace: true });
      return;
    }

    setPaymentId(verified.payment_id);
    setOrderId(verified.order_id || "");

    (async () => {
      try {
        const { data } = await api.get("/payments/payer-prefill", {
          params: { payment_id: verified.payment_id },
        });
        if (data?.name) setName(data.name);
        if (data?.email) setEmail(data.email);
        if (data?.phone) setPhone(data.phone);
      } catch (err) {
        console.error("[complete-details] Failed to load prefill", err?.response?.data || err);
        if (err?.response?.status === 401) {
          navigate("/login", { replace: true });
          return;
        }
        if (err?.response?.status === 403 || err?.response?.status === 404) {
          navigate("/payment?plan=ai_review", { replace: true });
          return;
        }
        toast.error("Could not load your details. You can still fill them in below.");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const canSubmit = name.trim().length > 0 && email.trim().length > 0 && !saving;

  const handleContinue = async (e) => {
    e.preventDefault();
    if (!canSubmit || !paymentId) return;

    setSaving(true);
    try {
      await api.post("/payments/payer-details", {
        payment_id: paymentId,
        order_id: orderId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
      });
      navigate("/onboarding", { replace: true });
    } catch (err) {
      console.error("[complete-details] Save failed", err?.response?.data || err);
      toast.error(err?.response?.data?.detail || "Could not save your details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-[24px] border border-zinc-200 shadow-card p-8"
      >
        <div className="mx-auto mb-6 w-14 h-14 rounded-full bg-brand-soft text-brand grid place-items-center">
          <UserCircle2 className="w-7 h-7" />
        </div>

        <h1 className="font-outfit text-2xl font-semibold tracking-tight text-ink text-center mb-2">
          Let&apos;s personalize your report
        </h1>
        <p className="text-ink-muted text-sm text-center mb-8">
          A few details help us tailor your AI Rizz Score to you.
        </p>

        <form onSubmit={handleContinue} className="space-y-5">
          <div>
            <Label htmlFor="payer-name">Full Name</Label>
            <Input
              id="payer-name"
              data-testid="complete-details-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
              className="mt-2 h-12 rounded-xl"
            />
          </div>

          <div>
            <Label htmlFor="payer-email">Email</Label>
            <Input
              id="payer-email"
              data-testid="complete-details-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="mt-2 h-12 rounded-xl"
            />
          </div>

          <div>
            <Label htmlFor="payer-phone">
              Phone Number <span className="text-ink-muted font-normal">(optional)</span>
            </Label>
            <Input
              id="payer-phone"
              data-testid="complete-details-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="mt-2 h-12 rounded-xl"
            />
          </div>

          <Button
            type="submit"
            data-testid="complete-details-continue"
            disabled={!canSubmit}
            className="w-full h-12 rounded-full bg-gradient-to-r from-brand to-[#8B5CF6] hover:opacity-95 text-white font-medium shadow-[0_16px_50px_-12px_rgba(109,94,247,0.6)] disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
