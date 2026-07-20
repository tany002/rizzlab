import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LANDING } from "@/constants/testIds";

const CTA = "Find Out Why";
const CTA_HINT = "Upload your profile · Get your score in ~2 min · Private";

const CTA_BASE =
  "rounded-full bg-brand hover:bg-brand-hover text-white font-semibold " +
  "shadow-[0_0_0_1px_rgba(109,94,247,0.3),0_8px_32px_-4px_rgba(109,94,247,0.55),0_20px_50px_-12px_rgba(109,94,247,0.35)] " +
  "hover:shadow-[0_0_0_1px_rgba(109,94,247,0.5),0_12px_40px_-4px_rgba(109,94,247,0.7),0_24px_60px_-12px_rgba(109,94,247,0.45)] " +
  "hover:scale-[1.03] active:scale-[0.98] transition-all duration-200";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
};

function LandingCta({ testId, size = "default", className = "", onClick, showHint = false, fullWidth = false }) {
  const sizeClass =
    size === "large"
      ? "h-16 px-10 text-lg"
      : size === "compact"
        ? "h-12 px-6 text-sm"
        : size === "nav"
          ? "h-10 px-4 sm:px-5 text-xs sm:text-sm"
          : "h-14 px-8 text-base";

  const iconClass = size === "large" ? "w-5 h-5" : size === "nav" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <div className={`${showHint ? "text-center" : ""} ${fullWidth ? "w-full" : ""} ${className}`}>
      <div className={`relative ${showHint && !fullWidth ? "inline-block" : ""} ${fullWidth ? "w-full" : ""}`}>
        {showHint && (
          <span className="absolute inset-0 rounded-full bg-brand/50 blur-xl animate-pulse pointer-events-none" />
        )}
        <Button
          data-testid={testId}
          onClick={onClick}
          className={`relative ${CTA_BASE} ${sizeClass} ${fullWidth ? "w-full" : ""}`}
        >
          {CTA}
          <ArrowRight className={`ml-2 ${iconClass}`} />
        </Button>
      </div>
      {showHint && <p className="mt-3 text-sm text-ink-muted">{CTA_HINT}</p>}
    </div>
  );
}

function CtaBlock({ testId, size = "default", className = "" }) {
  const navigate = useNavigate();
  return (
    <LandingCta
      testId={testId}
      size={size}
      className={className}
      onClick={() => navigate("/payment?plan=ai_review")}
      showHint
    />
  );
}

const BEFORE_THOUGHTS = [
  { text: "Why am I not getting replies?", className: "top-[14%] left-[4%] max-w-[130px]" },
  { text: "Am I just unattractive?", className: "top-[8%] right-[2%] max-w-[115px]" },
  { text: "What's wrong with my profile?", className: "bottom-[38%] left-[2%] max-w-[140px]" },
  { text: "No matches again...", className: "bottom-[18%] right-[4%] max-w-[120px]" },
];

const AFTER_CLARITY = [
  "I know what's hurting my profile",
  "I know which photo to lead with",
  "I know exactly what to fix first",
];

function HeroTransformation() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-xl lg:max-w-none mx-auto">
      {/* Before */}
      <div className="rounded-[20px] sm:rounded-[24px] border border-zinc-300/80 overflow-hidden shadow-[0_20px_50px_-20px_rgba(15,23,42,0.35)] bg-slate-900">
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800/90 border-b border-slate-700/60">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-slate-400 font-semibold">
            Before RizzLab
          </span>
        </div>
        <div className="relative aspect-[3/4]">
          <img
            src="/images/hero-before.png"
            alt="Man alone, anxious, checking his phone with no replies"
            className="absolute inset-0 w-full h-full object-cover object-center saturate-[0.65] brightness-[0.82]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-slate-800/20" />
          {BEFORE_THOUGHTS.map((thought) => (
            <div
              key={thought.text}
              className={`absolute ${thought.className} z-10 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl rounded-bl-sm bg-white/95 text-[9px] sm:text-[11px] leading-snug text-slate-700 font-medium shadow-lg border border-slate-200/80`}
            >
              {thought.text}
            </div>
          ))}
        </div>
      </div>

      {/* After */}
      <div className="rounded-[20px] sm:rounded-[24px] border border-amber-200/60 overflow-hidden shadow-[0_20px_50px_-20px_rgba(245,158,11,0.25)] bg-amber-50">
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-amber-100/80 border-b border-amber-200/60">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-amber-800/70 font-semibold">
            After RizzLab
          </span>
        </div>
        <div className="relative aspect-[3/4]">
          <img
            src="/images/hero-after.png"
            alt="Same man confident outdoors, relaxed and clear on what to improve"
            className="absolute inset-0 w-full h-full object-cover object-center brightness-[1.05] saturate-[1.08]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-amber-950/25 via-transparent to-amber-100/10" />
          <div className="absolute bottom-3 sm:bottom-4 inset-x-2 sm:inset-x-3 z-10">
            <div className="rounded-2xl bg-white/95 backdrop-blur-sm border border-white/80 shadow-xl p-2.5 sm:p-3 space-y-1.5 sm:space-y-2">
              {AFTER_CLARITY.map((line) => (
                <div key={line} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-[9px] sm:text-[11px] text-ink font-medium leading-snug">{line}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const goPay = () => navigate("/payment?plan=ai_review");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          <LandingCta testId="nav-cta" size="nav" onClick={goPay} />
        </div>
      </motion.header>

      {/* HERO */}
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
              className="font-outfit text-[42px] leading-[1.02] sm:text-6xl lg:text-[76px] font-bold tracking-[-0.03em] text-ink text-balance"
            >
              Women Swipe Left Because Of This.
            </motion.h1>

            <motion.div
              initial="hidden"
              animate="visible"
              custom={1}
              variants={fadeUp}
              className="mt-5 sm:mt-6 text-lg sm:text-xl text-ink-muted max-w-lg leading-snug space-y-1"
            >
              <p>Don't guess.</p>
              <p>Find out what's really pushing matches away before she even reads your bio.</p>
            </motion.div>

            <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp} className="mt-7">
              <CtaBlock testId={LANDING.ctaPrimary} className="text-left sm:text-center lg:text-left" />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <HeroTransformation />
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
        <LandingCta testId="mobile-sticky-cta" onClick={goPay} size="default" fullWidth />
      </div>
    </div>
  );
}
