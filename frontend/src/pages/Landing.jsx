import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform, animate } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, ArrowRight, Lock, MessageSquare, AlertCircle, ArrowDown, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LANDING } from "@/constants/testIds";

const CTA = "Find Out Why";

function AnimatedNumber({ to, duration = 1.6, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, duration]);
  return <span ref={ref} className={className}>{val}</span>;
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] } }),
};

function PhoneMockup({ variant }) {
  const isEmpty = variant === "before";
  const chats = [
    { name: "Priya", msg: "That coffee spot looks amazing ☕", unread: 2, color: "from-rose-300 to-pink-400" },
    { name: "Ananya", msg: "Wait you play chess too?", unread: 1, color: "from-violet-300 to-purple-400" },
    { name: "Meera", msg: "Your bio actually made me laugh", unread: 3, color: "from-amber-300 to-orange-400" },
    { name: "Kavya", msg: "Free this weekend?", unread: 1, color: "from-teal-300 to-emerald-400" },
  ];

  return (
    <div className="relative">
      <div className="mx-auto w-[220px] sm:w-[240px]">
        <div className="rounded-[36px] bg-zinc-900 p-2 shadow-[0_30px_80px_-20px_rgba(15,15,20,0.35)]">
          <div className="rounded-[28px] bg-white overflow-hidden">
            <div className="h-6 bg-zinc-50 flex items-center justify-center">
              <div className="w-16 h-1 rounded-full bg-zinc-200" />
            </div>
            <div className="px-4 py-3 border-b border-zinc-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand to-[#8B5CF6] grid place-items-center text-white text-xs font-semibold">AJ</div>
              <div>
                <div className="text-sm font-medium text-ink">AJ, 27</div>
                <div className="text-[10px] text-ink-muted">Messages</div>
              </div>
            </div>
            <div className="h-[280px] sm:h-[300px]">
              {isEmpty ? (
                <div className="h-full flex flex-col items-center justify-center px-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-zinc-100 grid place-items-center mb-4">
                    <MessageSquare className="w-6 h-6 text-zinc-300" />
                  </div>
                  <div className="text-sm font-medium text-ink-muted">No conversations yet</div>
                  <div className="mt-1 text-xs text-zinc-400">When you match, chats appear here</div>
                  <div className="mt-8 w-full space-y-3 opacity-40">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-100" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-2 w-20 rounded bg-zinc-100" />
                          <div className="h-2 w-full rounded bg-zinc-50" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-2">
                  {chats.map((c) => (
                    <div key={c.name} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50/80">
                      <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${c.color} shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-ink">{c.name}</span>
                          <span className="text-[10px] text-ink-muted">2m</span>
                        </div>
                        <div className="text-xs text-ink-muted truncate">{c.msg}</div>
                      </div>
                      {c.unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-brand text-white text-[10px] font-semibold grid place-items-center shrink-0">
                          {c.unread}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <span className="text-xs uppercase tracking-[0.2em] text-ink-muted font-semibold">
          {isEmpty ? "Without RizzLab" : "With RizzLab"}
        </span>
      </div>
      {!isEmpty && (
        <div className="absolute -top-2 -right-2 sm:-right-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ink text-white text-[10px] font-medium shadow-lg">
            <Sparkles className="w-3 h-3" /> Optimized with RizzLab AI
          </div>
        </div>
      )}
    </div>
  );
}

function TransformationCard({ before, after, label }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-[24px] border border-zinc-200 p-6 sm:p-7 shadow-card"
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 grid place-items-center text-lg font-outfit font-semibold text-ink">
          {label}
        </div>
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-widest text-ink-muted font-semibold mb-2">Dating Score</div>
          <div className="flex items-center gap-3">
            <span className="font-outfit text-3xl font-semibold text-red-500">{before}</span>
            <ArrowDown className="w-4 h-4 text-ink-muted rotate-[-90deg]" />
            <span className="font-outfit text-3xl font-semibold text-emerald-600">{after}</span>
          </div>
          <div className="mt-1 text-xs text-ink-muted">After following recommendations</div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 15 });
  const smy = useSpring(my, { stiffness: 60, damping: 15 });
  const tx = useTransform(smx, (v) => v * 8);
  const ty = useTransform(smy, (v) => v * 8);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleMouse = (e) => {
    const r = heroRef.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(((e.clientX - r.left) / r.width - 0.5));
    my.set(((e.clientY - r.top) / r.height - 0.5));
  };

  const goPay = () => navigate("/payment?plan=ai_review");

  const problems = [
    { t: "Your first photo may be pushing people away.", d: "Most profiles lose matches before anyone reads a word." },
    { t: "Your bio might be saying the wrong things.", d: "Generic lines signal generic personality — even when you're not." },
    { t: "Your conversations lose momentum faster than you think.", d: "Small reply patterns quietly kill interest after the first message." },
  ];

  return (
    <div className="min-h-screen bg-white text-ink overflow-x-hidden">
      {/* NAVBAR */}
      <motion.header
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        className={`sticky top-0 z-50 transition-all ${scrolled ? "bg-white/70 backdrop-blur-xl border-b border-zinc-200/60" : "bg-transparent"}`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2" data-testid="nav-logo">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand to-[#8B5CF6] shadow-brand grid place-items-center">
              <Sparkles className="w-4 h-4 text-white" />
            </span>
            <span className="font-outfit font-semibold text-lg tracking-tight">RizzLab</span>
          </div>
          <Button data-testid="nav-cta" onClick={goPay}
            className="rounded-full bg-ink text-white hover:bg-zinc-900 h-10 px-4 sm:px-5 text-xs sm:text-sm shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all">
            {CTA}
            <ArrowRight className="ml-2 w-3.5 h-3.5" />
          </Button>
        </div>
      </motion.header>

      {/* HERO */}
      <section ref={heroRef} onMouseMove={handleMouse} className="relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-brand/30 via-fuchsia-400/20 to-transparent blur-3xl" />
          <div className="absolute top-64 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-300/20 to-transparent blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-16 sm:pb-24 grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-5">
            <motion.h1 initial="hidden" animate="visible" custom={0} variants={fadeUp}
              className="font-outfit text-[40px] leading-[1.02] sm:text-6xl lg:text-[72px] font-semibold tracking-[-0.03em] text-ink text-balance">
              What If Your Profile Is{" "}
              <span className="bg-gradient-to-r from-brand via-[#8B5CF6] to-fuchsia-500 bg-clip-text text-transparent">The Problem?</span>
            </motion.h1>

            <motion.p initial="hidden" animate="visible" custom={1} variants={fadeUp}
              className="mt-6 text-lg sm:text-xl text-ink-muted max-w-xl leading-relaxed">
              Most people never realize what's pushing matches away. RizzLab analyzes your photos, bio and prompts to uncover what's hurting your first impression—and exactly how to fix it.
            </motion.p>

            <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp} className="mt-8">
              <div className="relative inline-block">
                <span className="absolute inset-0 rounded-full bg-brand/40 blur-xl animate-pulse" />
                <Button data-testid={LANDING.ctaPrimary} onClick={goPay}
                  className="relative rounded-full bg-gradient-to-r from-brand to-[#8B5CF6] hover:opacity-95 text-white h-14 px-8 text-base font-medium shadow-[0_16px_50px_-12px_rgba(109,94,247,0.6)] hover:-translate-y-0.5 transition-all">
                  {CTA}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Phone transformation visual */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ x: tx, y: ty }}
            className="lg:col-span-7 relative">
            <div className="flex items-center justify-center gap-4 sm:gap-8">
              <PhoneMockup variant="before" />
              <div className="hidden sm:flex flex-col items-center shrink-0">
                <svg width="48" height="24" viewBox="0 0 48 24" fill="none" className="text-brand">
                  <path d="M4 12 C16 4, 32 20, 44 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <path d="M38 8 L44 12 L38 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
              <PhoneMockup variant="after" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* RECOGNITION */}
      <section className="relative py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-outfit text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.03em] text-ink text-balance leading-[1.06]">
            You match. They don't reply.<br />
            <span className="text-ink-muted">Or they ghost after two messages.</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-lg text-ink-muted max-w-xl mx-auto">
            Something's off — and nobody tells you what.
          </motion.p>
        </div>
      </section>

      {/* PROBLEM DIAGNOSIS */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="max-w-2xl mb-12">
          <h3 className="font-outfit text-3xl sm:text-5xl font-semibold tracking-tight text-ink">Can someone finally tell you what it is?</h3>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {problems.map((f, i) => (
              <motion.div key={f.t}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                className="group bg-white rounded-[24px] border border-zinc-200 p-6 sm:p-7 shadow-card hover:shadow-card-hover transition-all"
              >
                <div className="font-outfit font-medium text-lg text-ink mb-2">{f.t}</div>
                <div className="text-sm text-ink-muted leading-relaxed">{f.d}</div>
              </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 text-center">
          <Button onClick={goPay}
            className="rounded-full bg-ink text-white hover:bg-zinc-900 h-12 px-6 text-sm font-medium shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all">
            {CTA}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      </section>

      {/* REPORT PREVIEW — 40% reveal, 60% locked */}
      <section className="relative py-20 sm:py-28 bg-gradient-to-b from-zinc-50 to-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="font-outfit text-3xl sm:text-5xl font-semibold tracking-tight text-ink">Here's what you'll find out.</h3>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-[28px] bg-white border border-zinc-200 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.15)] overflow-hidden">

            {/* Visible ~40% */}
            <div className="p-6 sm:p-10">
              <div className="grid lg:grid-cols-2 gap-5">
                <div className="bg-ink text-white rounded-2xl p-6 sm:p-7 relative overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-brand/40 blur-3xl" />
                  <div className="relative">
                    <div className="text-[10px] uppercase tracking-widest text-white/60 font-semibold">Dating Score</div>
                    <div className="mt-2 font-outfit text-6xl sm:text-7xl font-semibold">
                      <AnimatedNumber to={78} className="" /> <span className="text-white/60 text-3xl">/100</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-2xl bg-red-50/60 border border-red-100 p-5">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-red-600 font-semibold mb-2">
                      <AlertCircle className="w-3.5 h-3.5" /> Biggest Mistake
                    </div>
                    <div className="text-sm text-ink font-medium">Your lead photo has poor lighting and a closed-off expression.</div>
                  </div>
                  <div className="rounded-2xl bg-emerald-50/60 border border-emerald-100 p-5">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-emerald-600 font-semibold mb-2">
                      <Check className="w-3.5 h-3.5" /> Top Strength
                    </div>
                    <div className="text-sm text-ink font-medium">Photo 3 shows genuine warmth — use it higher in your lineup.</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-brand-soft border border-brand/20 p-5 sm:p-6">
                <div className="text-[10px] uppercase tracking-widest text-brand font-semibold mb-2">Top Recommendation</div>
                <div className="text-sm text-ink leading-relaxed">Swap your first photo for one with natural light, direct eye contact, and a relaxed smile. This alone could lift your score by 12–18 points.</div>
              </div>
            </div>

            {/* Locked ~60% */}
            <div className="relative border-t border-zinc-100">
              <div className="p-6 sm:p-10 pt-0 filter blur-[5px] select-none pointer-events-none">
                <div className="grid lg:grid-cols-2 gap-5">
                  <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                    <div className="text-[10px] uppercase tracking-widest text-ink-muted font-semibold mb-3">Photo Ranking</div>
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
                    <div className="text-[10px] uppercase tracking-widest text-brand font-semibold mb-3">Bio Rewrite</div>
                    <p className="text-ink leading-relaxed text-sm">Engineer at a Bangalore fintech, but weekends are for road trips and hunting the city's best filter coffee...</p>
                  </div>
                  <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                    <div className="text-[10px] uppercase tracking-widest text-ink-muted font-semibold mb-3">Conversation Review</div>
                    <ul className="space-y-2 text-sm text-ink">
                      <li>→ Openers using specificity outperform 3x</li>
                      <li>→ Avoid interview mode in first 5 msgs</li>
                    </ul>
                  </div>
                  <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                    <div className="text-[10px] uppercase tracking-widest text-ink-muted font-semibold mb-3">4-Week Roadmap</div>
                    <ul className="space-y-2 text-sm text-ink">
                      <li>W1 · Photos</li><li>W2 · Bio</li><li>W3 · Style</li><li>W4 · Conversations</li>
                    </ul>
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

            <div className="p-8 sm:p-10 pt-4 grid place-items-center border-t border-zinc-100">
              <div className="relative inline-block">
                <span className="absolute inset-0 rounded-full bg-brand/40 blur-xl animate-pulse" />
                <Button data-testid="report-unlock-cta" onClick={goPay}
                  className="relative rounded-full bg-gradient-to-r from-brand to-[#8B5CF6] hover:opacity-95 text-white h-14 px-8 text-base font-medium shadow-[0_16px_50px_-12px_rgba(109,94,247,0.6)] hover:-translate-y-0.5 transition-all">
                  {CTA}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PROFILE TRANSFORMATIONS */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-12">
          <h3 className="font-outfit text-3xl sm:text-5xl font-semibold tracking-tight text-ink">Real profile transformations.</h3>
          <p className="mt-4 text-ink-muted">Example score improvements after following recommendations.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <TransformationCard label="R" before={41} after={78} />
          <TransformationCard label="A" before={36} after={71} />
          <TransformationCard label="K" before={52} after={84} />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-24 sm:py-40 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-brand/20 via-fuchsia-300/15 to-transparent blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="font-outfit text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.03em] text-ink text-balance leading-[1.03]">
            How do you find out?
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-5 text-lg text-ink-muted max-w-lg mx-auto">
            Upload your profile. Get your diagnosis. Know exactly what to fix.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-10">
            <div className="relative inline-block">
              <motion.span animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-brand/50 blur-2xl" />
              <Button data-testid={LANDING.pricingReview} onClick={goPay}
                className="relative rounded-full bg-gradient-to-r from-brand to-[#8B5CF6] hover:opacity-95 text-white h-16 px-10 text-lg font-medium shadow-[0_20px_60px_-12px_rgba(109,94,247,0.6)] hover:-translate-y-0.5 transition-all">
                {CTA}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand to-[#8B5CF6] grid place-items-center">
              <Sparkles className="w-3 h-3 text-white" />
            </span>
            <span className="font-outfit font-semibold text-ink">RizzLab</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-ink">Privacy</a>
            <a href="#" className="hover:text-ink">Terms</a>
            <a href="#" className="hover:text-ink">Contact</a>
          </div>
        </div>
      </footer>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-4 inset-x-4 z-40">
        <Button data-testid="mobile-sticky-cta" onClick={goPay}
          className="w-full rounded-full h-14 bg-gradient-to-r from-brand to-[#8B5CF6] hover:opacity-95 text-white text-base font-medium shadow-[0_16px_50px_-12px_rgba(109,94,247,0.7)]">
          {CTA} <ArrowRight className="ml-1 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
