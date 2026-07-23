import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LANDING } from "@/constants/testIds";
import heroBefore from "../assets/hero-before.png";
import heroAfter from "../assets/hero-after.png";
import { trackLandingView, trackEvent, trackPricingOfferView, trackPricingOfferCtaClick } from "@/lib/analytics";

const CTA = "Find Out Why";
const CTA_HINT = "Upload your profile · Get your score in ~2 min · Private";

const CTA_BASE =
  "rounded-full bg-brand hover:bg-brand-hover text-white font-semibold group " +
  "shadow-[0_4px_28px_-2px_rgba(109,94,247,0.45)] " +
  "hover:shadow-[0_16px_48px_-4px_rgba(109,94,247,0.62)] " +
  "hover:scale-[1.045] active:scale-[0.96] transition-all duration-100";

function WeekendBadge() {
  useEffect(() => {
    trackPricingOfferView();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.4 }}
      className="inline-flex items-baseline gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-orange-200 shadow-[0_2px_12px_-2px_rgba(234,88,12,0.18)] select-none"
    >
      <span className="text-base font-extrabold text-orange-500 leading-none">🔥 90% OFF</span>
      <span className="text-[10px] font-medium text-orange-400/90 leading-none">Valid until midnight only</span>
    </motion.div>
  );
}

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
          <span className="absolute inset-0 rounded-full bg-brand/18 blur-3xl animate-pulse pointer-events-none" />
        )}
        <Button
          data-testid={testId}
          onClick={onClick}
          className={`relative ${CTA_BASE} ${sizeClass} ${fullWidth ? "w-full" : ""}`}
        >
          {CTA}
          <ArrowRight className={`ml-2 ${iconClass} transition-transform duration-100 group-hover:translate-x-1`} />
        </Button>
      </div>
      {showHint && <p className="mt-3.5 text-xs tracking-[0.05em] text-ink-muted/75">{CTA_HINT}</p>}
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
      onClick={() => {
        trackEvent("find_out_why_click");
        navigate("/payment?plan=ai_review");
      }}
      showHint
    />
  );
}

const BEFORE_THOUGHTS = [
  { text: "Why am I not getting replies?", pos: "top-4 left-2 sm:left-3" },
  { text: "Am I just unattractive?", pos: "top-[28%] right-2 sm:right-3" },
  { text: "What's wrong with my profile?", pos: "top-[52%] left-2 sm:left-3" },
  { text: "No matches again...", pos: "bottom-[22%] right-2 sm:right-3" },
];

const AFTER_CLARITY = [
  "I know what's hurting my profile",
  "I know which photo to lead with",
  "I know exactly what to fix first",
];

/* Stick-figure SVG — simple, readable, no external deps */
function PersonSilhouette({ mood }) {
  const isAnxious = mood === "anxious";
  return (
    <svg
      viewBox="0 0 80 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      {/* head */}
      <circle cx="40" cy="22" r="12" fill={isAnxious ? "#94a3b8" : "#f59e0b"} opacity={isAnxious ? "0.5" : "0.85"} />
      {/* body */}
      <rect x="28" y="36" width="24" height="36" rx="6" fill={isAnxious ? "#64748b" : "#fbbf24"} opacity={isAnxious ? "0.4" : "0.75"} />
      {/* legs */}
      {isAnxious ? (
        /* seated — legs bent down */
        <>
          <line x1="34" y1="72" x2="26" y2="100" stroke="#64748b" strokeWidth="5" strokeLinecap="round" opacity="0.4" />
          <line x1="46" y1="72" x2="54" y2="100" stroke="#64748b" strokeWidth="5" strokeLinecap="round" opacity="0.4" />
        </>
      ) : (
        /* standing — legs straight */
        <>
          <line x1="34" y1="72" x2="28" y2="112" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" opacity="0.75" />
          <line x1="46" y1="72" x2="52" y2="112" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" opacity="0.75" />
        </>
      )}
      {/* arms */}
      {isAnxious ? (
        /* arms hunched inward holding phone */
        <>
          <line x1="28" y1="44" x2="14" y2="60" stroke="#64748b" strokeWidth="5" strokeLinecap="round" opacity="0.4" />
          <line x1="52" y1="44" x2="66" y2="60" stroke="#64748b" strokeWidth="5" strokeLinecap="round" opacity="0.4" />
          {/* phone */}
          <rect x="30" y="62" width="20" height="14" rx="3" fill="#1e293b" opacity="0.5" />
          <rect x="32" y="64" width="16" height="10" rx="2" fill="#334155" opacity="0.4" />
        </>
      ) : (
        /* arms relaxed, one slightly raised */
        <>
          <line x1="28" y1="44" x2="10" y2="56" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round" opacity="0.75" />
          <line x1="52" y1="44" x2="70" y2="52" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round" opacity="0.75" />
        </>
      )}
      {/* expression */}
      {isAnxious ? (
        /* frown */
        <path d="M34 26 Q40 23 46 26" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.7" />
      ) : (
        /* smile */
        <path d="M34 26 Q40 30 46 26" stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.8" />
      )}
    </svg>
  );
}

function HeroTransformation() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-xl lg:max-w-none mx-auto">
      {/* ── BEFORE ── */}
      <div className="rounded-[20px] sm:rounded-[24px] border border-slate-700/60 overflow-hidden shadow-[0_20px_50px_-20px_rgba(15,23,42,0.4)] bg-slate-900">
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800 border-b border-slate-700/60">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-slate-400 font-semibold">
            Before RizzLab
          </span>
        </div>

        {/* illustration area */}
        <div className="relative aspect-[3/4] overflow-hidden bg-slate-900">
          <img
            src={heroBefore}
            alt="Man alone at night, anxiously checking his phone"
            className="absolute inset-0 w-full h-full object-cover object-top saturate-[0.6] brightness-[0.75]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/20 to-transparent" />

          {/* thought bubbles */}
          {BEFORE_THOUGHTS.map((t) => (
            <div
              key={t.text}
              className={`absolute ${t.pos} max-w-[110px] z-10 px-2 py-1.5 rounded-lg rounded-bl-none bg-white/90 text-[8px] sm:text-[10px] leading-snug text-slate-700 font-medium shadow border border-slate-200/60`}
            >
              {t.text}
            </div>
          ))}

          {/* dark vignette bottom */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/80 to-transparent" />
        </div>
      </div>

      {/* ── AFTER ── */}
      <div className="rounded-[20px] sm:rounded-[24px] border border-amber-200/50 overflow-hidden shadow-[0_20px_50px_-20px_rgba(245,158,11,0.3)] bg-amber-50">
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-amber-100 border-b border-amber-200/60">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-amber-800/70 font-semibold">
            After RizzLab
          </span>
        </div>

        {/* illustration area */}
        <div className="relative aspect-[3/4] overflow-hidden bg-amber-50">
          <img
            src={heroAfter}
            alt="Same man confident outdoors, relaxed and self-assured"
            className="absolute inset-0 w-full h-full object-cover object-top brightness-[1.04] saturate-[1.1]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-amber-950/30 via-transparent to-transparent" />

          {/* clarity cards overlay */}
          <div className="absolute bottom-3 sm:bottom-4 inset-x-2 sm:inset-x-3 z-10">
            <div className="rounded-xl bg-white/95 backdrop-blur-sm border border-white/80 shadow-lg p-2 sm:p-2.5 space-y-1.5">
              {AFTER_CLARITY.map((line) => (
                <div key={line} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-[8px] sm:text-[10px] text-ink font-medium leading-snug">{line}</span>
                </div>
              ))}
            </div>
          </div>

          {/* warm vignette bottom */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-amber-950/20 to-transparent" />
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const goPay = () => {
    trackEvent("find_out_why_click");
    trackPricingOfferCtaClick();
    navigate("/payment?plan=ai_review");
  };

  useEffect(() => {
    trackLandingView();
  }, []);

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
          <span className="font-outfit font-bold text-xl tracking-[-0.02em]" data-testid="nav-logo">
            RizzLab
          </span>
          <LandingCta testId="nav-cta" size="nav" onClick={goPay} />
        </div>
      </motion.header>

      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[750px] h-[750px] rounded-full bg-gradient-to-br from-brand/20 via-fuchsia-400/12 to-transparent blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-20 sm:pb-28 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <motion.h1
              initial="hidden"
              animate="visible"
              custom={0}
              variants={fadeUp}
              className="font-outfit text-[46px] leading-[1.0] sm:text-[64px] lg:text-[88px] font-bold tracking-[-0.05em] text-ink text-balance"
            >
              Women Swipe Left Because Of This.
            </motion.h1>

            <motion.div
              initial="hidden"
              animate="visible"
              custom={1}
              variants={fadeUp}
              className="mt-7 sm:mt-8 text-lg sm:text-xl text-ink-muted/90 max-w-[340px] leading-relaxed space-y-1.5"
            >
              <p>Don't guess.</p>
              <p>Find out what's really pushing matches away before she even reads your bio.</p>
            </motion.div>

            <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp} className="mt-7 sm:mt-9">
              <WeekendBadge />
            </motion.div>

            <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp} className="mt-5 sm:mt-7">
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
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-24 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-14"
        >
          <h2 className="font-outfit text-3xl sm:text-[44px] lg:text-[58px] font-semibold tracking-[-0.05em] text-ink text-balance leading-[1.05]">
            You match. They ghost.
            <span className="block mt-2 text-ink-muted">
              Something's off — and no one tells you what.
            </span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {problems.map((f, i) => (
            <motion.div
              key={f.t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white/90 backdrop-blur-md rounded-[28px] border border-zinc-200/50 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)] hover:-translate-y-1 transition-all duration-200"
            >
              <div className="font-outfit font-semibold text-xl sm:text-[22px] text-ink mb-2.5 leading-snug">{f.t}</div>
              <div className="text-sm text-ink-muted/85 leading-relaxed">{f.d}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-12 sm:mt-14"
        >
          <CtaBlock testId="pain-section-cta" size="compact" />
        </motion.div>
      </section>

      {/* REPORT PREVIEW — tease hard, lock the rest */}
      <section className="relative py-24 sm:py-32 bg-gradient-to-b from-zinc-50/80 to-white">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-2xl mx-auto mb-10 sm:mb-12"
          >
            <h3 className="font-outfit text-3xl sm:text-[44px] font-semibold tracking-[-0.05em] text-ink leading-[1.05]">
              Here's what you'll find out.
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-[36px] bg-white border border-zinc-200/60 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.10)] overflow-hidden"
          >
            <div className="p-6 sm:p-10">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="bg-ink text-white rounded-2xl p-6 sm:p-7 relative overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-brand/40 blur-3xl" />
                  <div className="relative">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/60 font-semibold">
                      Dating Score
                    </div>
                    <div className="mt-2 font-outfit text-6xl sm:text-7xl font-semibold">
                      78 <span className="text-white/60 text-3xl">/100</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl bg-red-50/60 border border-red-100 p-5 sm:p-6 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-red-600 font-semibold mb-2">
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
                    <div className="text-[10px] uppercase tracking-[0.14em] text-emerald-600 font-semibold mb-3">
                      Top Strength
                    </div>
                    <p className="text-sm text-ink">Photo 3 shows genuine warmth — use it higher in your lineup.</p>
                  </div>
                  <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-brand font-semibold mb-3">
                      Top Recommendation
                    </div>
                    <p className="text-sm text-ink">
                      Swap your first photo for one with natural light, direct eye contact, and a relaxed smile...
                    </p>
                  </div>
                  <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-ink-muted font-semibold mb-3">
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
                    <div className="text-[10px] uppercase tracking-[0.14em] text-ink-muted font-semibold mb-3">
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
      <section className="relative py-24 sm:py-36">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="font-outfit text-[36px] sm:text-[52px] lg:text-[68px] font-bold tracking-[-0.05em] text-ink text-balance leading-[1.04]"
          >
            Stop guessing. Find out why.
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-11 sm:mt-14"
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
      <div className="lg:hidden fixed bottom-5 inset-x-5 z-40">
        <LandingCta testId="mobile-sticky-cta" onClick={goPay} size="default" fullWidth />
      </div>
    </div>
  );
}
