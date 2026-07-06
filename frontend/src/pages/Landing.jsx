import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform, animate } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, ArrowRight, ShieldCheck, Zap, Check, Lock, Camera, PenLine,
  MessageSquare, Shirt, ListChecks, TrendingUp, ChevronRight, Star, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LANDING } from "@/constants/testIds";

// ------------- Utilities -------------
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

// ------------- Landing -------------
export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 15 });
  const smy = useSpring(my, { stiffness: 60, damping: 15 });
  const tx = useTransform(smx, (v) => v * 10);
  const ty = useTransform(smy, (v) => v * 10);
  const tx2 = useTransform(smx, (v) => v * -14);
  const ty2 = useTransform(smy, (v) => v * -14);

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

  return (
    <div className="min-h-screen bg-white text-ink overflow-x-hidden">
      {/* ============ NAVBAR ============ */}
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
            <span className="hidden sm:inline">Get My Rizz Score — ₹299</span>
            <span className="sm:hidden">Get Score — ₹299</span>
            <ArrowRight className="ml-2 w-3.5 h-3.5" />
          </Button>
        </div>
      </motion.header>

      {/* ============ HERO ============ */}
      <section ref={heroRef} onMouseMove={handleMouse} className="relative">
        {/* soft gradient blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-brand/30 via-fuchsia-400/20 to-transparent blur-3xl" />
          <div className="absolute top-64 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-300/20 to-transparent blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-16 sm:pb-24 grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left */}
          <div className="lg:col-span-6">
            <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-zinc-200 text-xs text-ink-muted shadow-sm mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> AI Rizz Score™ · Now live
            </motion.div>

            <motion.h1 initial="hidden" animate="visible" custom={1} variants={fadeUp}
              className="font-outfit text-[40px] leading-[1.02] sm:text-6xl lg:text-[76px] font-semibold tracking-[-0.03em] text-ink text-balance">
              Why Aren't You<br />
              Getting <span className="bg-gradient-to-r from-brand via-[#8B5CF6] to-fuchsia-500 bg-clip-text text-transparent">Matches?</span>
            </motion.h1>

            <motion.p initial="hidden" animate="visible" custom={2} variants={fadeUp}
              className="mt-6 text-lg sm:text-xl text-ink-muted max-w-xl leading-relaxed">
              Your dating profile makes a first impression in seconds. Our AI analyzes your profile and shows exactly what's stopping you from getting better matches.
            </motion.p>

            <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp} className="mt-8">
              <div className="relative inline-block">
                <span className="absolute inset-0 rounded-full bg-brand/40 blur-xl animate-pulse" />
                <Button data-testid={LANDING.ctaPrimary} onClick={goPay}
                  className="relative rounded-full bg-gradient-to-r from-brand to-[#8B5CF6] hover:opacity-95 text-white h-14 px-8 text-base font-medium shadow-[0_16px_50px_-12px_rgba(109,94,247,0.6)] hover:-translate-y-0.5 transition-all">
                  Get My Rizz Score — ₹299
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </motion.div>

            <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}
              className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-muted">
              <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> Personalized AI Report</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure Upload</span>
              <span className="inline-flex items-center gap-1.5"><Zap className="w-4 h-4 text-emerald-500" /> Under 5 Minutes</span>
            </motion.div>

            <motion.div initial="hidden" animate="visible" custom={5} variants={fadeUp}
              className="mt-8 flex items-center gap-3 text-sm text-ink-muted">
              <div className="flex -space-x-2">
                {["from-orange-300 to-pink-300", "from-blue-300 to-indigo-400", "from-emerald-300 to-teal-300", "from-purple-300 to-rose-300"].map((g, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full bg-gradient-to-br ${g} border-2 border-white`} />
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                <span className="ml-1 text-ink font-medium">4.9</span>
                <span className="ml-1">· 8,400+ reports generated</span>
              </div>
            </motion.div>
          </div>

          {/* Right — Floating Dashboard */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 relative">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ x: tx, y: ty }}
              className="relative mx-auto max-w-lg"
            >
              <div className="relative rounded-[28px] bg-white border border-zinc-200 shadow-[0_30px_80px_-20px_rgba(15,15,20,0.25)] overflow-hidden">
                {/* window bar */}
                <div className="flex items-center gap-1.5 px-5 py-3.5 border-b border-zinc-100">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-auto text-[10px] uppercase tracking-widest text-ink-muted font-medium">rizzlab · report</span>
                </div>
                <div className="p-6 sm:p-7">
                  {/* score */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-brand to-[#8B5CF6] p-5 text-white shadow-brand">
                      <div className="text-[10px] uppercase tracking-widest text-white/70 font-semibold">Rizz Score</div>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="font-outfit text-5xl font-semibold leading-none"><AnimatedNumber to={41} /></span>
                        <span className="text-white/70 text-lg">/100</span>
                      </div>
                      <div className="mt-3 h-1.5 rounded-full bg-white/20 overflow-hidden">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: "41%" }} viewport={{ once: true }} transition={{ duration: 1.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }} className="h-full bg-white" />
                      </div>
                    </div>
                    <div className="rounded-2xl bg-zinc-50 border border-zinc-100 p-5">
                      <div className="text-[10px] uppercase tracking-widest text-ink-muted font-semibold">Potential</div>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="font-outfit text-5xl font-semibold text-ink leading-none"><AnimatedNumber to={89} /></span>
                        <span className="text-ink-muted text-lg">/100</span>
                      </div>
                      <div className="mt-3 inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                        <TrendingUp className="w-3 h-3" /> +48 pts possible
                      </div>
                    </div>
                  </div>

                  {/* problems */}
                  <div className="mt-5">
                    <div className="text-[10px] uppercase tracking-widest text-ink-muted font-semibold mb-3">Problems Found</div>
                    <div className="space-y-2">
                      {[
                        { t: "Weak First Photo", d: "Blurry, low lighting" },
                        { t: "Generic Bio", d: "Reads like every other profile" },
                        { t: "Low Confidence Signals", d: "Body language issues in 3 photos" },
                      ].map((p, i) => (
                        <motion.div key={p.t} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.5 + i * 0.12 }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-red-50/60 border border-red-100">
                          <span className="w-8 h-8 rounded-lg bg-red-100 text-red-600 grid place-items-center shrink-0">
                            <AlertCircle className="w-4 h-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm text-ink font-medium truncate">{p.t}</div>
                            <div className="text-xs text-ink-muted truncate">{p.d}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* blurred remaining */}
                    <div className="mt-3 relative">
                      <div className="space-y-2 filter blur-[6px] select-none pointer-events-none">
                        {["Photo order suboptimal", "Bio missing hook", "Conversation openers weak", "Style mismatch"].map((t) => (
                          <div key={t} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                            <span className="w-8 h-8 rounded-lg bg-zinc-200" />
                            <div className="text-sm text-ink font-medium">{t}</div>
                          </div>
                        ))}
                      </div>
                      <div className="absolute inset-0 grid place-items-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ink text-white text-xs font-medium shadow-lg">
                          <Lock className="w-3.5 h-3.5" /> 6 more insights locked
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* floating chips (parallax) */}
              <motion.div style={{ x: tx2, y: ty2 }}
                className="hidden sm:flex absolute -left-8 top-24 bg-white rounded-2xl border border-zinc-200 shadow-lg px-4 py-3 items-center gap-2.5">
                <Camera className="w-4 h-4 text-brand" />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-ink-muted">Photo 1</div>
                  <div className="text-sm font-medium text-ink">Score 38</div>
                </div>
              </motion.div>
              <motion.div style={{ x: tx2, y: ty2 }}
                className="hidden sm:flex absolute -right-6 bottom-24 bg-white rounded-2xl border border-zinc-200 shadow-lg px-4 py-3 items-center gap-2.5">
                <PenLine className="w-4 h-4 text-brand" />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-ink-muted">Bio Rewrite</div>
                  <div className="text-sm font-medium text-ink">Ready →</div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============ EMOTIONAL SECTION ============ */}
      <section className="relative py-24 sm:py-36">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 text-center">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-outfit text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.03em] text-ink text-balance leading-[1.03]">
            You don't need better luck.<br />
            <span className="text-ink-muted">You need better first impressions.</span>
          </motion.h2>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-14 relative max-w-3xl mx-auto">
            <div className="aspect-[16/7] rounded-[28px] bg-gradient-to-br from-brand/15 via-fuchsia-100 to-indigo-100 border border-zinc-200 relative overflow-hidden shadow-[0_30px_80px_-30px_rgba(109,94,247,0.4)]">
              <div className="absolute inset-0 grain-bg opacity-30" />
              <div className="absolute inset-0 grid place-items-center">
                <div className="flex items-center gap-2 sm:gap-4">
                  {["from-red-400 to-orange-400", "from-amber-400 to-yellow-400", "from-emerald-400 to-teal-400", "from-brand to-fuchsia-500"].map((g, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.4 + i * 0.15 }}
                      className={`w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ${g} shadow-lg`}
                    />
                  ))}
                </div>
              </div>
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-ink-muted font-semibold">first · impression · matters</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ WHAT YOU'LL DISCOVER ============ */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="max-w-2xl mb-12">
          <div className="text-xs uppercase tracking-[0.25em] text-brand font-semibold mb-3">What you'll discover</div>
          <h3 className="font-outfit text-3xl sm:text-5xl font-semibold tracking-tight text-ink">Answers, not opinions.</h3>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {[
            { i: Camera, t: "Which photos are hurting your profile", d: "Every photo scored on composition, lighting, expression, and trust signal." },
            { i: PenLine, t: "Whether your bio sounds boring", d: "AI reads your bio the way she does — and tells you where you lost her." },
            { i: TrendingUp, t: "Your hidden confidence signals", d: "Micro-signals in your photos that pull attraction up or down." },
            { i: Sparkles, t: "How attractive your first impression is", d: "Objective first-impression score — no sugarcoating." },
            { i: ListChecks, t: "Exactly what to improve", d: "Ordered list — what to fix first, second, third." },
            { i: MessageSquare, t: "Conversation mistakes", d: "The messages killing your reply rate before you even meet." },
          ].map((f, i) => {
            const Icon = f.i;
            return (
              <motion.div key={f.t}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                className="group bg-white rounded-[24px] border border-zinc-200 p-6 sm:p-7 shadow-card hover:shadow-card-hover transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-soft text-brand grid place-items-center mb-5 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-outfit font-medium text-lg text-ink mb-2">{f.t}</div>
                <div className="text-sm text-ink-muted leading-relaxed">{f.d}</div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ============ AI REPORT PREVIEW ============ */}
      <section className="relative py-20 sm:py-28 bg-gradient-to-b from-zinc-50 to-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-xs uppercase tracking-[0.25em] text-brand font-semibold mb-3">Premium AI Report</div>
            <h3 className="font-outfit text-3xl sm:text-5xl font-semibold tracking-tight text-ink">A preview of what's inside.</h3>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-[28px] bg-white border border-zinc-200 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.15)] overflow-hidden">
            {/* fade overlay for CTA */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-white z-10 pointer-events-none" />

            <div className="p-6 sm:p-10 filter blur-[3px] select-none">
              <div className="grid lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 bg-ink text-white rounded-2xl p-6 sm:p-7 relative overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-brand/40 blur-3xl" />
                  <div className="relative">
                    <div className="text-[10px] uppercase tracking-widest text-white/60 font-semibold">Overall Score</div>
                    <div className="mt-2 font-outfit text-6xl sm:text-7xl font-semibold">78 <span className="text-white/60 text-3xl">/100</span></div>
                    <div className="mt-4 text-sm text-white/70">Potential 92 · +14 pts</div>
                  </div>
                </div>
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
              </div>

              <div className="mt-5 grid lg:grid-cols-2 gap-5">
                <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                  <div className="text-[10px] uppercase tracking-widest text-brand font-semibold mb-3">Bio Rewrite</div>
                  <p className="text-ink leading-relaxed">Engineer at a Bangalore fintech, but weekends are for road trips and hunting the city's best filter coffee. Currently losing to my sister at chess. If you have a favourite hidden bakery — I want the address.</p>
                </div>
                <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                  <div className="text-[10px] uppercase tracking-widest text-ink-muted font-semibold mb-3">Conversation Review</div>
                  <ul className="space-y-2 text-sm text-ink">
                    <li>→ Openers using specificity outperform 3x</li>
                    <li>→ Avoid interview mode in first 5 msgs</li>
                    <li>→ Match her energy — mirror length</li>
                  </ul>
                </div>
                <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                  <div className="text-[10px] uppercase tracking-widest text-ink-muted font-semibold mb-3">Style Analysis</div>
                  <div className="flex flex-wrap gap-2">
                    {["Ecru", "Charcoal", "Olive", "Navy", "Rust"].map(c => <span key={c} className="px-3 py-1 rounded-full bg-white border border-zinc-200 text-sm">{c}</span>)}
                  </div>
                </div>
                <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                  <div className="text-[10px] uppercase tracking-widest text-ink-muted font-semibold mb-3">4-Week Roadmap</div>
                  <ul className="space-y-2 text-sm text-ink">
                    <li>W1 · Photos</li><li>W2 · Bio</li><li>W3 · Style</li><li>W4 · Conversations</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA over blur */}
            <div className="absolute inset-x-0 bottom-0 z-20 p-8 sm:p-12 grid place-items-center">
              <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-zinc-200 text-xs text-ink-muted mb-4 shadow-sm">
                  <Lock className="w-3 h-3" /> Report locked — one-time ₹299
                </div>
                <div className="relative inline-block">
                  <span className="absolute inset-0 rounded-full bg-brand/40 blur-xl animate-pulse" />
                  <Button data-testid="report-unlock-cta" onClick={goPay}
                    className="relative rounded-full bg-gradient-to-r from-brand to-[#8B5CF6] hover:opacity-95 text-white h-14 px-8 text-base font-medium shadow-[0_16px_50px_-12px_rgba(109,94,247,0.6)] hover:-translate-y-0.5 transition-all">
                    Unlock My Report — ₹299
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative py-24 sm:py-40 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-brand/20 via-fuchsia-300/15 to-transparent blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="font-outfit text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.03em] text-ink text-balance leading-[1.03]">
            Find out what's holding you back.
          </motion.h2>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-10">
            <div className="relative inline-block">
              <motion.span animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-brand/50 blur-2xl" />
              <Button data-testid={LANDING.pricingReview} onClick={goPay}
                className="relative rounded-full bg-gradient-to-r from-brand to-[#8B5CF6] hover:opacity-95 text-white h-16 px-10 text-lg font-medium shadow-[0_20px_60px_-12px_rgba(109,94,247,0.6)] hover:-translate-y-0.5 transition-all">
                Get My Rizz Score — ₹299
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
            <p className="mt-5 text-sm text-ink-muted">One-time payment. No subscription.</p>
          </motion.div>
        </div>
      </section>

      {/* ============ FOOTER MINIMAL ============ */}
      <footer className="border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand to-[#8B5CF6] grid place-items-center">
              <Sparkles className="w-3 h-3 text-white" />
            </span>
            <span className="font-outfit font-semibold text-ink">RizzLab</span>
            <span>· AI Rizz Score™</span>
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
          Get My Rizz Score — ₹299 <ChevronRight className="ml-1 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
