import { motion } from "framer-motion";
import { Heart, Chrome, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AUTH } from "@/constants/testIds";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleEmail = (e) => {
    e.preventDefault();
    toast.info("Email login is coming soon. Please continue with Google for now.");
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="max-w-7xl mx-auto w-full px-6 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-ink-muted hover:text-ink text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>
      <div className="flex-1 grid place-items-center px-6 pb-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white rounded-[24px] border border-zinc-200 shadow-card p-8">
          <div className="flex items-center gap-2 mb-8">
            <span className="w-8 h-8 rounded-xl bg-brand text-white grid place-items-center shadow-brand">
              <Heart className="w-4 h-4" fill="white" strokeWidth={0} />
            </span>
            <span className="font-outfit font-semibold text-lg text-ink">DateCoach</span>
          </div>
          <h1 className="font-outfit text-3xl font-semibold tracking-tight text-ink mb-2">Welcome back.</h1>
          <p className="text-ink-muted mb-8">Log in to continue your coaching.</p>

          <Button data-testid={AUTH.googleBtn} onClick={handleGoogle}
            className="w-full h-12 rounded-full bg-white text-ink border border-zinc-300 hover:bg-zinc-50 hover:-translate-y-0.5 transition-transform gap-3">
            <Chrome className="w-4 h-4" /> Continue with Google
          </Button>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-zinc-200" />
            <span className="text-xs text-ink-muted uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-zinc-200" />
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
              <Input data-testid={AUTH.emailInput} value={email} onChange={(e) => setEmail(e.target.value)}
                type="email" placeholder="you@example.com"
                className="h-12 pl-11 rounded-xl border-zinc-300" />
            </div>
            <Button data-testid={AUTH.emailSubmit} type="submit"
              className="w-full h-12 rounded-full bg-ink hover:bg-zinc-800 text-white">Continue with Email</Button>
          </form>

          <p className="text-xs text-ink-muted text-center mt-6">By continuing you agree to our Terms and Privacy Policy.</p>
        </motion.div>
      </div>
    </div>
  );
}
