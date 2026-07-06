import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight, Sparkles, Camera, PenLine, MessageSquare, Shirt,
  Shield, Zap, Target, TrendingUp, Star, CheckCircle2,
  MapPin, Users, LineChart, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { LANDING } from "@/constants/testIds";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] } }),
};

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const start = () => (user ? navigate("/onboarding") : navigate("/login"));

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-brand/10 blur-3xl" />
          <div className="absolute top-40 -left-40 w-[400px] h-[400px] rounded-full bg-brand/5 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-zinc-200 text-xs text-ink-muted mb-6">
              <Sparkles className="w-3.5 h-3.5 text-brand" /> AI Dating Coach · Not a dating app
            </motion.div>
            <motion.h1 custom={1} initial="hidden" animate="visible" variants={fadeUp}
              className="font-outfit text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-ink text-balance leading-[1.05]">
              Become Date Ready.<br />
              <span className="text-brand">Get Better Matches.</span>
            </motion.h1>
            <motion.p custom={2} initial="hidden" animate="visible" variants={fadeUp}
              className="mt-6 text-lg text-ink-muted max-w-xl leading-relaxed">
              AI reviews your dating profile, photos, style, communication, and confidence — so you make a better first impression on Bumble, Hinge, Tinder & Aisle.
            </motion.p>
            <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
              <Button data-testid={LANDING.ctaPrimary} onClick={start}
                className="rounded-full bg-brand hover:bg-brand-hover text-white h-12 px-7 text-base shadow-brand hover:-translate-y-0.5 transition-transform">
                Start AI Review <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Link to="/sample-report">
                <Button data-testid={LANDING.ctaSample} variant="outline"
                  className="rounded-full h-12 px-7 text-base border-zinc-300 text-ink hover:bg-white">
                  View Sample Report
                </Button>
              </Link>
            </motion.div>
            <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}
              className="mt-10 flex items-center gap-6 text-sm text-ink-muted">
              <div className="flex -space-x-2">
                {["from-orange-300 to-pink-300", "from-blue-300 to-indigo-400", "from-emerald-300 to-teal-300", "from-purple-300 to-rose-300"].map((g, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br ${g} border-2 border-white`} />
                ))}
              </div>
              <div>
                <div className="text-ink font-medium">10,000+ men leveled up</div>
                <div className="flex items-center gap-1">{[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}<span className="ml-1">4.9 · 1,200 reviews</span></div>
              </div>
            </motion.div>
          </div>

          {/* Hero Right — Bento with photo + floating cards */}
          <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp} className="lg:col-span-6 relative">
            <div className="relative aspect-[4/5] max-w-md ml-auto">
              <div className="absolute inset-0 rounded-[28px] overflow-hidden shadow-card border border-zinc-200">
                <img
                  src="https://images.unsplash.com/photo-1616434116710-c45ce99c1a77?crop=entropy&cs=srgb&fm=jpg&w=800&q=80"
                  alt="Confident man"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              {/* Score badge */}
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                className="absolute -top-4 -left-4 bg-white rounded-2xl px-5 py-3.5 shadow-card border border-zinc-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand grid place-items-center font-semibold font-outfit">82</div>
                <div>
                  <div className="text-xs text-ink-muted">Date Readiness</div>
                  <div className="text-sm font-medium text-ink">Score</div>
                </div>
              </motion.div>
              {/* Photo Quality */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 }}
                className="absolute top-16 -right-6 bg-white rounded-2xl px-4 py-3 shadow-card border border-zinc-200 flex items-center gap-2.5">
                <Camera className="w-4 h-4 text-brand" />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-ink-muted">Photo Quality</div>
                  <div className="text-sm font-medium text-ink">78/100 <span className="text-emerald-500 text-xs">+6</span></div>
                </div>
              </motion.div>
              {/* Bio */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }}
                className="absolute bottom-24 -left-6 bg-white rounded-2xl px-4 py-3 shadow-card border border-zinc-200 flex items-center gap-2.5">
                <PenLine className="w-4 h-4 text-brand" />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-ink-muted">Bio Score</div>
                  <div className="text-sm font-medium text-ink">71 → 89</div>
                </div>
              </motion.div>
              {/* Communication */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }}
                className="absolute -bottom-4 right-8 bg-white rounded-2xl px-4 py-3 shadow-card border border-zinc-200 flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-brand" />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-ink-muted">Communication</div>
                  <div className="text-sm font-medium text-ink">Confident</div>
                </div>
              </motion.div>
              {/* Fashion tag */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
                className="absolute top-1/2 -right-4 bg-brand text-white rounded-full px-4 py-1.5 text-xs font-medium shadow-brand">
                Fashion · Neutrals
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="max-w-7xl mx-auto px-6 py-14 border-t border-zinc-200">
        <div className="text-center text-xs uppercase tracking-[0.25em] text-ink-muted mb-8">Trusted by 10,000+ men across India</div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center opacity-70">
          {["Bumble Users", "Hinge Users", "Tinder Users", "Aisle Users", "IIT Alumni", "Startup Founders"].map((n) => (
            <div key={n} className="text-center font-outfit text-sm text-ink-muted tracking-tight">{n}</div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="max-w-7xl mx-auto px-6 py-24">
        <div className="max-w-2xl mb-14">
          <div className="text-xs uppercase tracking-[0.25em] text-brand font-semibold mb-3">How it works</div>
          <h2 className="font-outfit text-3xl lg:text-5xl font-semibold tracking-tight text-ink">Four steps. About 45 seconds of your time.</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { n: "01", t: "Upload your profile", d: "Photos, bio, prompts, and current dating apps.", i: Camera },
            { n: "02", t: "AI analyzes everything", d: "Photos, style, communication, and first-impression signals.", i: Zap },
            { n: "03", t: "Get personalized fixes", d: "Not generic tips — a plan built around your actual profile.", i: Target },
            { n: "04", t: "Improve, match, date", d: "Follow the 4-week roadmap. Track your score climb.", i: TrendingUp },
          ].map((s, idx) => {
            const Icon = s.i;
            return (
              <motion.div key={s.n} whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }} viewport={{ once: true }}
                className="bg-white rounded-[20px] border border-zinc-200 p-7 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-11 h-11 rounded-xl bg-brand-soft text-brand grid place-items-center"><Icon className="w-5 h-5" /></div>
                  <div className="font-mono text-xs text-ink-muted">{s.n}</div>
                </div>
                <div className="font-outfit font-medium text-lg text-ink mb-2">{s.t}</div>
                <div className="text-sm text-ink-muted leading-relaxed">{s.d}</div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-16">
        <div className="max-w-2xl mb-14">
          <div className="text-xs uppercase tracking-[0.25em] text-brand font-semibold mb-3">Features</div>
          <h2 className="font-outfit text-3xl lg:text-5xl font-semibold tracking-tight text-ink">Everything you need — before the first swipe.</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { i: Camera, t: "Photo Analysis", d: "Score each photo. Keep, replace, reorder." },
            { i: PenLine, t: "Bio Rewrite", d: "AI rewrites your bio in your voice — with specifics that get replies." },
            { i: MessageSquare, t: "Conversation Coach", d: "Openers, follow-ups, and the mistakes killing your reply rate." },
            { i: Shirt, t: "Fashion Advice", d: "A capsule wardrobe under ₹8,000 — colors that match your skin tone." },
            { i: Shield, t: "Confidence Coaching", d: "Posture, eye contact, and how to actually be interesting." },
            { i: MapPin, t: "First Date Planner", d: "Where to go, what to wear, how to end the date." },
            { i: LineChart, t: "Weekly Improvement Plan", d: "A 4-week roadmap. Track your score climb week over week." },
            { i: Users, t: "Expert Coaching (Premium)", d: "1-on-1 with a real dating coach for deep, personal work." },
          ].map((f, i) => {
            const Icon = f.i;
            return (
              <motion.div key={f.t} whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.4, delay: i * 0.04 }} viewport={{ once: true }}
                className="bg-white rounded-[20px] border border-zinc-200 p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 text-ink grid place-items-center mb-4 group-hover:bg-brand-soft group-hover:text-brand transition-colors"><Icon className="w-5 h-5" /></div>
                <div className="font-outfit font-medium text-ink mb-1.5">{f.t}</div>
                <div className="text-sm text-ink-muted leading-relaxed">{f.d}</div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="max-w-2xl mb-12">
          <div className="text-xs uppercase tracking-[0.25em] text-brand font-semibold mb-3">Before & After</div>
          <h2 className="font-outfit text-3xl lg:text-5xl font-semibold tracking-tight text-ink">Real profiles. Real reply rates.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: "Karan, 28 · Bangalore", b: "Reply rate went from 4% to 27% in 3 weeks. The photo order alone changed everything.", s: 82 },
            { n: "Aditya, 31 · Mumbai", b: "I had all the wrong photos as my first pic. AI called it out in 30 seconds.", s: 88 },
            { n: "Rohit, 26 · Delhi", b: "The bio rewrite is uncanny. Sounds like me, but the me people actually want to meet.", s: 79 },
          ].map((t) => (
            <div key={t.n} className="bg-white rounded-[20px] border border-zinc-200 p-7 shadow-card">
              <div className="flex items-center gap-1 mb-4">{[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}</div>
              <p className="text-ink leading-relaxed mb-5">“{t.b}”</p>
              <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
                <div className="text-sm text-ink-muted">{t.n}</div>
                <div className="text-xs font-mono text-brand">Score {t.s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <div className="text-xs uppercase tracking-[0.25em] text-brand font-semibold mb-3">Pricing</div>
          <h2 className="font-outfit text-3xl lg:text-5xl font-semibold tracking-tight text-ink">Simple. Honest. One-time.</h2>
          <p className="mt-4 text-ink-muted">No subscriptions. No hidden fees.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-[24px] border border-zinc-200 p-8 shadow-card">
            <div className="text-xs uppercase tracking-widest text-ink-muted font-semibold mb-4">AI Review</div>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="font-outfit text-5xl font-semibold text-ink">₹299</span>
              <span className="text-ink-muted text-sm">one-time</span>
            </div>
            <ul className="space-y-3 mb-8 text-sm text-ink">
              {["Photo Review with per-photo scores", "Bio Rewrite in your voice", "Style Suggestions & capsule wardrobe", "Conversation Coaching (openers + follow-ups)", "First Date Preparation", "Overall AI Score", "4-Week Improvement Roadmap"].map(x => (
                <li key={x} className="flex items-start gap-2.5"><Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />{x}</li>
              ))}
            </ul>
            <Button data-testid={LANDING.pricingReview} onClick={() => navigate("/payment?plan=ai_review")}
              className="w-full rounded-full h-12 bg-ink hover:bg-zinc-800 text-white">Start Review</Button>
          </div>

          <div className="relative bg-ink text-white rounded-[24px] p-8 shadow-brand overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-brand/40 blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs uppercase tracking-widest text-white/60 font-semibold">Premium Coaching</div>
                <div className="text-[10px] uppercase tracking-widest bg-brand text-white px-2 py-1 rounded-full font-semibold">Most impact</div>
              </div>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="font-outfit text-5xl font-semibold">₹4,999</span>
                <span className="text-white/60 text-sm">one-time</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm">
                {["Everything in AI Review", "Live 1-on-1 Expert Session (60 min)", "Wardrobe Review over video", "Mock Date (real scenario roleplay)", "WhatsApp Support for 30 days", "Manual Profile Optimization by expert"].map(x => (
                  <li key={x} className="flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-brand shrink-0 mt-0.5" />{x}</li>
                ))}
              </ul>
              <Button data-testid={LANDING.pricingPremium} onClick={() => navigate("/premium")}
                className="w-full rounded-full h-12 bg-brand hover:bg-brand-hover text-white">Upgrade to Premium</Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-24">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-[0.25em] text-brand font-semibold mb-3">FAQ</div>
          <h2 className="font-outfit text-3xl lg:text-5xl font-semibold tracking-tight text-ink">Questions men actually ask.</h2>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {[
            { q: "Is this a dating app?", a: "No. DateCoach doesn't help you find matches. It helps you become someone worth swiping right on — so any dating app works better." },
            { q: "How long does the AI review take?", a: "About 30–45 seconds after you finish onboarding. You'll see a live analysis screen while our models look at your photos, bio, and answers." },
            { q: "Is my data private?", a: "Your photos and profile data are used only for your analysis. We don't sell data, ever." },
            { q: "Do I need to buy Premium?", a: "Most men see a 3–5x reply rate improvement from the ₹299 AI Review alone. Premium is for men who want live coaching." },
            { q: "Does this work for arranged/matrimonial profiles too?", a: "Yes — the same feedback loop applies to Aisle, Jeevansathi, and similar. Style, photo, and first impression fundamentals don't change." },
          ].map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="bg-white rounded-2xl border border-zinc-200 px-5">
              <AccordionTrigger className="text-left text-ink hover:no-underline">{item.q}</AccordionTrigger>
              <AccordionContent className="text-ink-muted leading-relaxed">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <Footer />
    </div>
  );
}
