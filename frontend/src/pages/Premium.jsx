import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, MessageCircle, User, Shirt, PenLine, Calendar, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";

const BENEFITS = [
  { i: User, t: "1-on-1 Video Session", d: "60-minute deep dive with a real dating coach." },
  { i: Shirt, t: "Wardrobe Review over Video", d: "Show your closet. Get a shopping list built for you." },
  { i: PenLine, t: "Profile Review by Expert", d: "Manual optimization — not AI-only." },
  { i: MessageCircle, t: "Conversation Review", d: "Send us your actual chats. We'll debug them." },
  { i: Users, t: "Mock Date Roleplay", d: "Practice the flow before it matters." },
  { i: Calendar, t: "30 Days of WhatsApp Support", d: "In-the-moment help before, during, and after dates." },
];

export default function Premium() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <section className="max-w-6xl mx-auto px-6 pt-14 pb-24">
        <Link to="/" className="inline-flex items-center gap-2 text-ink-muted hover:text-ink text-sm mb-6"><ArrowLeft className="w-4 h-4" /> Back</Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-5 gap-10 items-start">
          <div className="lg:col-span-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-soft border border-brand/20 text-xs text-brand mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Premium · Human Coach
            </div>
            <h1 className="font-outfit text-4xl lg:text-6xl font-semibold tracking-tight text-ink text-balance leading-[1.05]">
              Work with a dating expert who's helped 500+ men.
            </h1>
            <p className="mt-6 text-lg text-ink-muted max-w-xl leading-relaxed">
              AI is a great start. But real transformation comes from someone in your corner — reviewing your actual chats, dates, and decisions.
            </p>

            <div className="mt-10 grid sm:grid-cols-2 gap-4">
              {BENEFITS.map(b => {
                const Icon = b.i;
                return (
                  <div key={b.t} className="bg-white rounded-[20px] border border-zinc-200 shadow-card p-5">
                    <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand grid place-items-center mb-3"><Icon className="w-5 h-5" /></div>
                    <div className="font-outfit font-medium text-ink mb-1">{b.t}</div>
                    <div className="text-sm text-ink-muted leading-relaxed">{b.d}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2 lg:sticky lg:top-24">
            <div className="bg-ink text-white rounded-[24px] p-8 shadow-brand relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-brand/40 blur-3xl" />
              <div className="relative">
                <div className="text-xs uppercase tracking-widest text-white/60 font-semibold">Premium Coaching</div>
                <div className="flex items-baseline gap-2 mt-4">
                  <span className="font-outfit text-5xl font-semibold">₹4,999</span>
                  <span className="text-white/60 text-sm">one-time</span>
                </div>
                <p className="mt-3 text-white/70 text-sm">Includes the full AI Review. No subscription.</p>

                <ul className="mt-6 space-y-2.5 text-sm">
                  {["Everything in AI Review", "60-min Live Session", "Wardrobe Review", "Mock Date", "WhatsApp Support 30 days", "Manual Profile Optimization"].map(x => (
                    <li key={x} className="flex items-start gap-2.5"><Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />{x}</li>
                  ))}
                </ul>

                <Button data-testid="premium-book-btn" onClick={() => navigate("/payment?plan=premium")}
                  className="mt-8 w-full h-12 rounded-full bg-brand hover:bg-brand-hover text-white">
                  Book Consultation
                </Button>
                <p className="text-white/50 text-xs text-center mt-3">100% money-back after first session if not useful.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
      <Footer />
    </div>
  );
}
