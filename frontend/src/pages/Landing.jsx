import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LANDING } from "@/constants/testIds";

const CTA = "Find Out Why";
const CTA_HINT = "Upload your profile · Get your score in ~2 min · Private";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
};

function CtaBlock({ testId, size = "default", className = "" }) {
  const navigate = useNavigate();
  const goPay = () => navigate("/payment?plan=ai_review");

  const btnClass =
    size === "large"
      ? "h-16 px-10 text-lg"
      : size === "compact"
        ? "h-12 px-6 text-sm"
        : "h-14 px-8 text-base";

  return (
    <div className={`text-center ${className}`}>
      <div className="relative inline-block">
        <span className="absolute inset-0 rounded-full bg-brand/40 blur-xl animate-pulse" />
        <Button
          data-testid={testId}
          onClick={goPay}
          className={`relative rounded-full bg-gradient-to-r from-brand to-[#8B5CF6] hover:opacity-95 text-white font-medium shadow-[0_16px_50px_-12px_rgba(109,94,247,0.6)] hover:-translate-y-0.5 transition-all ${btnClass}`}
        >
          {CTA}
          <ArrowRight className={`ml-2 ${size === "large" ? "w-5 h-5" : "w-4 h-4"}`} />
        </Button>
      </div>
      <p className="mt-3 text-sm text-ink-muted">{CTA_HINT}</p>
    </div>
  );
}

function ReportTeaser({ compact = false }) {
  return (
    <div
      className={`relative rounded-[24px] bg-white border border-zinc-200 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.18)] overflow-hidden ${
        compact ? "max-w-sm mx-auto" : ""
      }`}
    >
      <div className={compact ? "p-5" : "p-6 sm:p-8"}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-ink text-white rounded-2xl p-5 sm:p-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-brand/40 blur-3xl" />
            <div className="relative">
              <div className="text-[10px] uppercase tracking-widest text-white/60 font-semibold">
                Dating Score
              </div>
              <div className="mt-2 font-outfit text-5xl sm:text-6xl font-semibold">
                78 <span className="text-white/60 text-2xl">/100</span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-red-50/60 border border-red-100 p-5 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-red-600 font-semibold mb-2">
              <AlertCircle className="w-3.5 h-3.5" /> Biggest Mistake
            </div>
            <div className="text-sm text-ink font-medium">
              Your lead photo is working against you.
            </div>
          </div>
        </div>
      </div>
      <div className="relative border-t border-zinc-100">
        <div className="p-5 sm:p-6 pt-0 filter blur-[6px] select-none pointer-events-none">
          <div className="space-y-3">
            <div className="h-16 rounded-xl bg-zinc-50 border border-zinc-100" />
            <div className="h-12 rounded-xl bg-zinc-50 border border-zinc-100" />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/80 to-white z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-4 z-20 grid place-items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink text-white text-[11px] font-medium shadow-lg">
            <Lock className="w-3 h-3" /> Full diagnosis locked
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goPay = () => navigate("/payment?plan=ai_review");

  const problems = [
    {
      t: "Your first photo might be costing you matches.",
      d: "Before anyone reads your bio.",
    },
    {
      t: "Your bio might be saying the wrong things.",
      d: "Generic lines signal a generic personality.",
    },
    {
      t: "Your replies might be killing momentum.",
      d: "Small patterns quietly end conversations.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-ink overflow-x-hidden pb-24 lg:pb-0">
      {/* NAVBAR */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`sticky top-0 z-50 transition-all ${
          scrolled ? "bg-white/70 backdrop-blur-xl border-b border-zinc-200/60" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <span className="font-outfit font-semibold text-lg tracking-tight" data-testid="nav-logo">
            RizzLab
          </span>
          <Button
            data-testid="nav-cta"
            onClick={goPay}
            className="rounded-full bg-ink text-white hover:bg-zinc-900 h-10 px-4 sm:px-5 text-xs sm:text-sm shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all"
          >
            {CTA}
            <ArrowRight className="ml-2 w-3.5 h-3.5" />
          </Button>
        </div>
      </motion.header>

      {/* HERO — copy + CTA first, visual second on mobile */}
      <section className="relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-brand/25 via-fuchsia-400/15 to-transparent blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-10 sm:pt-16 pb-12 sm:pb-20 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <motion.h1
              initial="hidden"
              animate="visible"
              custom={0}
              variants={fadeUp}
              className="font-outfit text-[38px] leading-[1.04] sm:text-5xl lg:text-[64px] font-semibold tracking-[-0.03em] text-ink text-balance"
            >
              What If Your Profile Is{" "}
              <span className="bg-gradient-to-r from-brand via-[#8B5CF6] to-fuchsia-500 bg-clip-text text-transparent">
                The Problem?
              </span>
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              custom={1}
              variants={fadeUp}
              className="mt-5 text-lg sm:text-xl text-ink-muted max-w-lg leading-relaxed"
            >
              Most people never know what's killing their matches. RizzLab tells you — exactly.
            </motion.p>

            <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp} className="mt-7">
              <CtaBlock testId={LANDING.ctaPrimary} className="text-left sm:text-center lg:text-left" />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <ReportTeaser compact />
          </motion.div>
        </div>
      </section>

      {/* PAIN + DIAGNOSIS — merged */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-12"
        >
          <h2 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] text-ink text-balance leading-[1.08]">
            You match. They ghost.
            <span className="block mt-2 text-ink-muted">
              Something's off — and no one tells you what.
            </span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-4 sm:gap-5 max-w-5xl mx-auto">
          {problems.map((f, i) => (
            <motion.div
              key={f.t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-[20px] border border-zinc-200 p-5 sm:p-6 shadow-card"
            >
              <div className="font-outfit font-medium text-base sm:text-lg text-ink mb-1.5">{f.t}</div>
              <div className="text-sm text-ink-muted leading-relaxed">{f.d}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-10 sm:mt-12"
        >
          <CtaBlock testId="pain-section-cta" size="compact" />
        </motion.div>
      </section>

      {/* REPORT PREVIEW — tease hard, lock the rest */}
      <section className="relative py-16 sm:py-24 bg-gradient-to-b from-zinc-50 to-white">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-2xl mx-auto mb-8 sm:mb-10"
          >
            <h3 className="font-outfit text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
              Here's what you'll find out.
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-[28px] bg-white border border-zinc-200 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.15)] overflow-hidden"
          >
            {/* Visible tease */}
            <div className="p-6 sm:p-10">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="bg-ink text-white rounded-2xl p-6 sm:p-7 relative overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-brand/40 blur-3xl" />
                  <div className="relative">
                    <div className="text-[10px] uppercase tracking-widest text-white/60 font-semibold">
                      Dating Score
                    </div>
                    <div className="mt-2 font-outfit text-6xl sm:text-7xl font-semibold">
                      78 <span className="text-white/60 text-3xl">/100</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl bg-red-50/60 border border-red-100 p-5 sm:p-6 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-red-600 font-semibold mb-2">
                    <AlertCircle className="w-3.5 h-3.5" /> Biggest Mistake
                  </div>
                  <div className="text-sm sm:text-base text-ink font-medium">
                    Your lead photo is working against you.
                  </div>
                </div>
              </div>
            </div>

            {/* Locked insights */}
            <div className="relative border-t border-zinc-100">
              <div className="p-6 sm:p-10 pt-0 filter blur-[5px] select-none pointer-events-none">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                    <div className="text-[10px] uppercase tracking-widest text-emerald-600 font-semibold mb-3">
                      Top Strength
                    </div>
                    <p className="text-sm text-ink">Photo 3 shows genuine warmth — use it higher in your lineup.</p>
                  </div>
                  <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                    <div className="text-[10px] uppercase tracking-widest text-brand font-semibold mb-3">
                      Top Recommendation
                    </div>
                    <p className="text-sm text-ink">
                      Swap your first photo for one with natural light, direct eye contact, and a relaxed smile...
                    </p>
                  </div>
                  <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                    <div className="text-[10px] uppercase tracking-widest text-ink-muted font-semibold mb-3">
                      Photo Ranking
                    </div>
                    <div className="space-y-2">
                      {[91, 74, 62, 58].map((v, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-zinc-200" />
                          <div className="flex-1 h-2 rounded-full bg-zinc-200 overflow-hidden">
                            <div className="h-full bg-brand" style={{ width: `${v}%` }} />
                          </div>
                          <span className="text-xs font-mono w-8 text-right">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                    <div className="text-[10px] uppercase tracking-widest text-ink-muted font-semibold mb-3">
                      Bio Rewrite + 4-Week Roadmap
                    </div>
                    <p className="text-sm text-ink">
                      Engineer at a Bangalore fintech, but weekends are for road trips...
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/70 to-white z-10 pointer-events-none" />
              <div className="absolute inset-x-0 bottom-8 z-20 grid place-items-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ink text-white text-xs font-medium shadow-lg">
                  <Lock className="w-3.5 h-3.5" /> 8 more insights locked
                </div>
              </div>
            </div>

            <div className="p-8 sm:p-10 pt-4 border-t border-zinc-100">
              <CtaBlock testId="report-unlock-cta" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-20 sm:py-32">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="font-outfit text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.03em] text-ink text-balance leading-[1.05]"
          >
            Stop guessing. Find out why.
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-10"
          >
            <CtaBlock testId={LANDING.pricingReview} size="large" />
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6 text-center text-xs text-ink-muted">
          <span className="font-outfit font-semibold text-ink">RizzLab</span>
          <span className="mx-2">·</span>
          Private &amp; secure · Your photos are never shared
        </div>
      </footer>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-4 inset-x-4 z-40">
        <Button
          data-testid="mobile-sticky-cta"
          onClick={goPay}
          className="w-full rounded-full h-14 bg-gradient-to-r from-brand to-[#8B5CF6] hover:opacity-95 text-white text-base font-medium shadow-[0_16px_50px_-12px_rgba(109,94,247,0.7)]"
        >
          {CTA} <ArrowRight className="ml-1 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
