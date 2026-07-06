import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Dashboard from "@/pages/Dashboard";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function SampleReport() {
  const [report, setReport] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/sample-report");
      setReport(data.report);
    })();
  }, []);

  if (!report) {
    return (
      <div className="min-h-screen grid place-items-center bg-surface">
        <div className="flex items-center gap-3 text-ink-muted"><Loader2 className="w-5 h-5 animate-spin text-brand" /> Loading sample report…</div>
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-brand text-white px-6 py-3 flex items-center justify-center gap-4 text-sm">
        <Sparkles className="w-4 h-4" />
        <span>This is a sample report — generated from a real DateCoach analysis.</span>
        <Button onClick={() => navigate("/onboarding")} className="rounded-full bg-white text-brand hover:bg-white/90 h-8 px-4 text-xs">Start Yours →</Button>
      </motion.div>
      <Dashboard demoData={report} />
    </div>
  );
}
