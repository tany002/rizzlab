import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Camera, PenLine, MessageSquare, Shirt, Target, Check } from "lucide-react";

const STAGES = [
  { icon: Camera, label: "Analyzing 6 photos for composition, lighting, expression" },
  { icon: PenLine, label: "Reading your bio & rewriting in your voice" },
  { icon: MessageSquare, label: "Studying communication style and inferred confidence signal" },
  { icon: Shirt, label: "Evaluating current style + generating capsule wardrobe" },
  { icon: Target, label: "Creating personalized 4-week recommendations" },
];

export default function Analyzing() {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    console.info("[loading] Loading page mounted; preparing redirect to report");
    const total = 5500; // ~5.5s demo
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(100, (elapsed / total) * 100);
      setProgress(p);
      setStage(Math.min(STAGES.length - 1, Math.floor((p / 100) * STAGES.length)));
      if (p >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          console.info("[loading] Redirecting to /dashboard");
          navigate("/dashboard");
        }, 400);
      }
    }, 60);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white relative overflow-hidden grain-bg">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-brand/20 blur-[120px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 pt-24 pb-16">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-brand" /> RizzLab AI · Live analysis
          </div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="font-outfit text-4xl lg:text-5xl font-semibold tracking-tight">
            Building your report.
          </motion.div>
          <p className="text-white/60 mt-4 max-w-lg mx-auto">Estimated time: 30-45 seconds. Do not close this tab.</p>
        </div>

        {/* Pulse loader */}
        <div className="grid place-items-center mb-14">
          <div className="relative w-40 h-40 grid place-items-center">
            <div className="absolute inset-0 rounded-full border border-white/10" />
            <div className="absolute inset-0 rounded-full border border-brand/40 animate-pulse-ring" />
            <div className="absolute inset-4 rounded-full border border-brand/30 animate-pulse-ring [animation-delay:400ms]" />
            <div className="w-24 h-24 rounded-full bg-brand/20 backdrop-blur-xl grid place-items-center border border-brand/40">
              <div className="font-outfit text-3xl font-semibold text-white">{Math.floor(progress)}%</div>
            </div>
          </div>
        </div>

        {/* Terminal-style log */}
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 font-mono text-sm space-y-2.5">
          {STAGES.map((s, i) => {
            const Icon = s.icon;
            const active = i === stage;
            const done = i < stage || progress >= 100;
            return (
              <motion.div key={i} className="flex items-center gap-3"
                animate={{ opacity: done || active ? 1 : 0.35 }}>
                {done ? (
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 grid place-items-center"><Check className="w-3 h-3" /></span>
                ) : (
                  <span className={`w-5 h-5 rounded-full grid place-items-center ${active ? "bg-brand/30 text-brand" : "bg-white/5 text-white/50"}`}>
                    <Icon className="w-3 h-3" />
                  </span>
                )}
                <span className={done || active ? "text-white" : "text-white/50"}>{s.label}</span>
                {active && <span className="text-brand animate-pulse">▊</span>}
              </motion.div>
            );
          })}
        </div>

        {/* progress bar */}
        <div className="mt-8 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div className="h-full bg-brand" style={{ width: `${progress}%` }} transition={{ ease: "linear" }} />
        </div>
      </div>
    </div>
  );
}
