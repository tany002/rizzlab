import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Copy, Check, TrendingUp, Camera, PenLine, Shirt, MessageSquare, MapPin, ListChecks, Sparkles, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/site/Sidebar";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { DASH } from "@/constants/testIds";
import { toast } from "sonner";

const scoreColor = (n) => n >= 80 ? "text-emerald-600" : n >= 65 ? "text-brand" : "text-amber-600";
const scoreBg = (n) => n >= 80 ? "bg-emerald-50" : n >= 65 ? "bg-brand-soft" : "bg-amber-50";

export default function Dashboard({ demoData }) {
  const [tab, setTab] = useState("overview");
  const [report, setReport] = useState(null);
  const [unlocked, setUnlocked] = useState(true);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (demoData) {
      setReport(demoData);
      setUnlocked(true);
      setLoading(false);
      return;
    }
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }
    (async () => {
      try {
        const { data } = await api.get("/report");
        setReport(data.report);
        setUnlocked(data.unlocked);
      } catch (err) {
        console.warn("[dashboard] /report unavailable, falling back to sample", err?.response?.status);
        try {
          const { data } = await api.get("/sample-report");
          setReport(data.report);
          setUnlocked(false);
        } catch (err2) {
          console.error("[dashboard] sample-report failed", err2);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [demoData, user, authLoading, navigate]);

  if (loading || !report) {
    return (
      <div className="min-h-screen grid place-items-center bg-surface">
        <div className="flex items-center gap-3 text-ink-muted"><Loader2 className="w-5 h-5 animate-spin text-brand" /> Loading your report…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-surface" data-testid={DASH.root}>
      <Sidebar active={tab} onSelect={setTab} />
      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="text-xs uppercase tracking-widest text-ink-muted font-semibold mb-2">Your Report</div>
              <h1 className="font-outfit text-3xl lg:text-4xl font-semibold text-ink">Hey {report.greeting}. Here's where you stand.</h1>
              <p className="text-ink-muted mt-1">Personalized recommendations based on your profile. Updated {new Date(report.generated_at).toLocaleDateString()}.</p>
            </div>
            {!unlocked && (
              <Button onClick={() => navigate("/payment?plan=ai_review")} className="rounded-full bg-brand hover:bg-brand-hover text-white">Unlock Full Report</Button>
            )}
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="bg-white border border-zinc-200 rounded-full p-1 mb-6 overflow-x-auto max-w-full">
              <TabsTrigger value="overview" className="rounded-full">Overview</TabsTrigger>
              <TabsTrigger value="photos" data-testid={DASH.tabPhotos} className="rounded-full">Photos</TabsTrigger>
              <TabsTrigger value="bio" data-testid={DASH.tabBio} className="rounded-full">Bio</TabsTrigger>
              <TabsTrigger value="style" data-testid={DASH.tabStyle} className="rounded-full">Style</TabsTrigger>
              <TabsTrigger value="communication" data-testid={DASH.tabComm} className="rounded-full">Communication</TabsTrigger>
              <TabsTrigger value="date-plan" data-testid={DASH.tabDate} className="rounded-full">Date Plan</TabsTrigger>
              <TabsTrigger value="roadmap" data-testid={DASH.tabRoadmap} className="rounded-full">Roadmap</TabsTrigger>
            </TabsList>

            {/* OVERVIEW */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  data-testid={DASH.scoreCard}
                  className="lg:col-span-2 bg-ink text-white rounded-[24px] p-8 relative overflow-hidden">
                  <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-brand/40 blur-3xl" />
                  <div className="relative">
                    <div className="text-xs uppercase tracking-widest text-white/60 font-semibold">Date Readiness Score</div>
                    <div className="flex items-baseline gap-3 mt-4">
                      <div className="font-outfit text-7xl font-semibold">{report.score}</div>
                      <div className="text-white/60 text-2xl">/ 100</div>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-white/70">
                      <TrendingUp className="w-4 h-4 text-brand" /> Potential: <span className="text-white">{report.potential}/100</span> — follow the roadmap
                    </div>
                    <div className="mt-6 h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-brand" initial={{ width: 0 }} animate={{ width: `${report.score}%` }} transition={{ duration: 1 }} />
                    </div>
                  </div>
                </motion.div>
                <div className="bg-white rounded-[24px] border border-zinc-200 shadow-card p-6">
                  <div className="text-xs uppercase tracking-widest text-ink-muted font-semibold mb-3">Sub-scores</div>
                  <div className="space-y-3">
                    {report.sub_scores.map((s) => (
                      <div key={s.label}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className="text-ink">{s.label}</span>
                          <span className="font-mono text-ink-muted">{s.value} <span className="text-emerald-600">{s.trend}</span></span>
                        </div>
                        <Progress value={s.value} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-[20px] border border-zinc-200 p-6 shadow-card">
                  <div className="flex items-center gap-2 mb-3"><Camera className="w-4 h-4 text-brand" /><span className="font-outfit font-medium">Best First Photo</span></div>
                  {(() => {
                    const p = report.photos.find(x => x.id === report.best_first_photo_id) || report.photos[0];
                    return (
                      <div className="flex gap-4">
                        <img src={p.url} alt="best" className="w-28 h-28 rounded-xl object-cover" />
                        <div>
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 mb-2">Score {p.score}</Badge>
                          <p className="text-sm text-ink-muted leading-relaxed">{p.note}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <div className="bg-white rounded-[20px] border border-zinc-200 p-6 shadow-card">
                  <div className="flex items-center gap-2 mb-3"><Sparkles className="w-4 h-4 text-brand" /><span className="font-outfit font-medium">Top 3 Fixes This Week</span></div>
                  <ol className="space-y-2.5 text-sm text-ink">
                    <li className="flex gap-3"><span className="font-mono text-ink-muted">01</span>Reorder photos — move your headshot to slot 1</li>
                    <li className="flex gap-3"><span className="font-mono text-ink-muted">02</span>Deploy the rewritten bio (see Bio tab)</li>
                    <li className="flex gap-3"><span className="font-mono text-ink-muted">03</span>Replace 2 lowest-scoring photos</li>
                  </ol>
                </div>
              </div>
            </TabsContent>

            {/* PHOTOS */}
            <TabsContent value="photos" className="space-y-5">
              <SectionHead icon={Camera} title="Photo Analysis" sub="Each photo scored on composition, expression, and trust signal." />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {report.photos.map((p) => (
                  <motion.div key={p.id} whileHover={{ y: -3 }} className="bg-white rounded-[20px] border border-zinc-200 shadow-card overflow-hidden">
                    <div className="relative aspect-[4/5]">
                      <img src={p.url} alt="photo" className="w-full h-full object-cover" />
                      <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${scoreBg(p.score)} ${scoreColor(p.score)}`}>{p.score}/100</div>
                      {p.id === report.best_first_photo_id && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-medium bg-ink text-white">Best 1st</div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {p.verdict === "keep" ? (
                          <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">Keep</Badge>
                        ) : (
                          <Badge className="bg-red-50 text-red-700 hover:bg-red-50">Replace</Badge>
                        )}
                      </div>
                      <p className="text-sm text-ink-muted leading-relaxed">{p.note}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* BIO */}
            <TabsContent value="bio" className="space-y-5">
              <SectionHead icon={PenLine} title="Bio Review" sub="Your rewritten bio, in your voice — with the specifics that get replies." />
              <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-white rounded-[20px] border border-zinc-200 p-6 shadow-card">
                  <div className="text-xs uppercase tracking-widest text-ink-muted font-semibold mb-3">Original</div>
                  <p className="text-ink-muted leading-relaxed">{report.bio.original}</p>
                </div>
                <div className="bg-white rounded-[20px] border border-brand/30 p-6 shadow-card relative">
                  <div className="absolute top-4 right-4">
                    <CopyButton text={report.bio.improved} />
                  </div>
                  <div className="text-xs uppercase tracking-widest text-brand font-semibold mb-3">Improved</div>
                  <p className="text-ink leading-relaxed">{report.bio.improved}</p>
                </div>
              </div>
              <div className="bg-brand-soft rounded-[20px] p-6 border border-brand/20">
                <div className="text-xs uppercase tracking-widest text-brand font-semibold mb-2">Why this works</div>
                <p className="text-ink leading-relaxed text-sm">{report.bio.explanation}</p>
              </div>
            </TabsContent>

            {/* STYLE */}
            <TabsContent value="style" className="space-y-5">
              <SectionHead icon={Shirt} title="Style Analysis" sub="Current impression, capsule wardrobe, and grooming plan." />
              <div className="bg-white rounded-[20px] border border-zinc-200 p-6 shadow-card">
                <div className="text-xs uppercase tracking-widest text-ink-muted font-semibold mb-2">Current Impression</div>
                <p className="text-ink leading-relaxed">{report.style.current_impression}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <ListCard title="Suggested Clothing" items={report.style.clothing} />
                <ListCard title="Suggested Colors" items={report.style.colors} pills />
                <ListCard title="Accessories" items={report.style.accessories} />
                <ListCard title="Shoes" items={report.style.shoes} />
              </div>
              <div className="grid md:grid-cols-3 gap-5">
                <InfoCard label="Hair" value={report.style.hair} />
                <InfoCard label="Beard" value={report.style.beard} />
                <InfoCard label="Budget Plan" value={report.style.budget_plan} />
              </div>
            </TabsContent>

            {/* COMMUNICATION */}
            <TabsContent value="communication" className="space-y-5">
              <SectionHead icon={MessageSquare} title="Communication Coaching" sub="Openers, questions, safe topics, and mistakes to avoid." />
              <div className="grid md:grid-cols-2 gap-5">
                <ListCard title="Openers (fill in the blanks)" items={report.communication.openers} />
                <ListCard title="Great Follow-up Questions" items={report.communication.questions} />
                <ListCard title="Topics That Work" items={report.communication.topics} pills />
                <div className="bg-white rounded-[20px] border border-red-200 p-6 shadow-card">
                  <div className="text-xs uppercase tracking-widest text-red-600 font-semibold mb-3">Mistakes to Avoid</div>
                  <ul className="space-y-2 text-sm text-ink">
                    {report.communication.mistakes_to_avoid.map((m, i) => (
                      <li key={i} className="flex gap-2.5"><span className="text-red-500 shrink-0">✕</span>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* DATE PLAN */}
            <TabsContent value="date-plan" className="space-y-5">
              <SectionHead icon={MapPin} title="First Date Planner" sub="A full playbook for your next date." />
              <div className="grid md:grid-cols-2 gap-5">
                <InfoCard label="What to Wear" value={report.date_plan.what_to_wear} />
                <ListCard title="Where to Go" items={report.date_plan.where_to_go} />
                <ListCard title="Conversation Flow" items={report.date_plan.conversation_flow} />
                <InfoCard label="How to End" value={report.date_plan.how_to_end} />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-white rounded-[20px] border border-emerald-200 p-6 shadow-card">
                  <div className="text-xs uppercase tracking-widest text-emerald-700 font-semibold mb-3">Green Flags</div>
                  <ul className="space-y-2 text-sm text-ink">
                    {report.date_plan.green_flags.map((m, i) => <li key={i} className="flex gap-2.5"><span className="text-emerald-500">✓</span>{m}</li>)}
                  </ul>
                </div>
                <div className="bg-white rounded-[20px] border border-red-200 p-6 shadow-card">
                  <div className="text-xs uppercase tracking-widest text-red-600 font-semibold mb-3">Red Flags</div>
                  <ul className="space-y-2 text-sm text-ink">
                    {report.date_plan.red_flags.map((m, i) => <li key={i} className="flex gap-2.5"><span className="text-red-500">✕</span>{m}</li>)}
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* ROADMAP */}
            <TabsContent value="roadmap" className="space-y-5">
              <SectionHead icon={ListChecks} title="Your 4-Week Roadmap" sub="One focus per week. Stay honest with yourself." />
              <div className="grid md:grid-cols-2 gap-5">
                {report.roadmap.map((w, i) => (
                  <motion.div key={w.week} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-[20px] border border-zinc-200 p-6 shadow-card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand text-white grid place-items-center font-outfit font-semibold">{w.week}</div>
                        <div>
                          <div className="text-xs uppercase tracking-widest text-ink-muted font-semibold">Week {w.week}</div>
                          <div className="font-outfit font-medium text-ink">{w.title}</div>
                        </div>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm text-ink">
                      {w.tasks.map((t, ti) => (
                        <li key={ti} className="flex gap-2.5"><span className="w-4 h-4 rounded border border-zinc-300 shrink-0 mt-0.5" />{t}</li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function SectionHead({ icon: Icon, title, sub }) {
  return (
    <div className="flex items-start gap-3 mb-2">
      <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand grid place-items-center"><Icon className="w-5 h-5" /></div>
      <div>
        <div className="font-outfit text-xl font-medium text-ink">{title}</div>
        <div className="text-sm text-ink-muted">{sub}</div>
      </div>
    </div>
  );
}

function ListCard({ title, items, pills = false }) {
  return (
    <div className="bg-white rounded-[20px] border border-zinc-200 p-6 shadow-card">
      <div className="text-xs uppercase tracking-widest text-ink-muted font-semibold mb-3">{title}</div>
      {pills ? (
        <div className="flex flex-wrap gap-2">
          {items.map((i, idx) => <span key={idx} className="px-3 py-1.5 rounded-full bg-zinc-100 text-sm text-ink">{i}</span>)}
        </div>
      ) : (
        <ul className="space-y-2 text-sm text-ink">
          {items.map((i, idx) => <li key={idx} className="flex gap-2.5"><span className="text-brand shrink-0">→</span>{i}</li>)}
        </ul>
      )}
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="bg-white rounded-[20px] border border-zinc-200 p-6 shadow-card">
      <div className="text-xs uppercase tracking-widest text-ink-muted font-semibold mb-2">{label}</div>
      <p className="text-sm text-ink leading-relaxed">{value}</p>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button data-testid={DASH.copyBio} onClick={copy} className="p-2 rounded-lg hover:bg-zinc-100 text-ink-muted hover:text-ink">
      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}
