import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { NAV } from "@/constants/testIds";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(false);
  };

  const startFlow = () => {
    if (user) navigate("/onboarding");
    else navigate("/login");
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 z-50 transition-all ${scrolled ? "bg-white/80 backdrop-blur-xl border-b border-zinc-200/60 shadow-sm" : "bg-transparent"}`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" data-testid={NAV.logo} className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-brand text-white grid place-items-center shadow-brand">
            <Heart className="w-4 h-4" fill="white" strokeWidth={0} />
          </span>
          <span className="font-outfit font-semibold text-lg tracking-tight text-ink">RizzLab</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-sm text-ink-muted">
          <button data-testid={NAV.howItWorks} onClick={() => scrollTo("how")} className="hover:text-ink transition-colors">How it Works</button>
          <button data-testid={NAV.features} onClick={() => scrollTo("features")} className="hover:text-ink transition-colors">Features</button>
          <button data-testid={NAV.pricing} onClick={() => scrollTo("pricing")} className="hover:text-ink transition-colors">Pricing</button>
          <Link data-testid={NAV.sample} to="/sample-report" className="hover:text-ink transition-colors">Sample Report</Link>
          <button data-testid={NAV.faq} onClick={() => scrollTo("faq")} className="hover:text-ink transition-colors">FAQ</button>
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <Link data-testid={NAV.dashboardLink} to="/dashboard" className="text-sm text-ink-muted hover:text-ink">Dashboard</Link>
              <Button data-testid={NAV.logout} onClick={logout} variant="ghost" className="text-ink-muted">Logout</Button>
            </>
          ) : (
            <Link data-testid={NAV.login} to="/login" className="text-sm text-ink-muted hover:text-ink">Login</Link>
          )}
          <Button data-testid={NAV.cta} onClick={startFlow}
            className="rounded-full bg-brand hover:bg-brand-hover text-white px-6 h-11 shadow-brand hover:-translate-y-0.5 transition-transform">
            Start AI Review
          </Button>
        </div>

        <button className="lg:hidden text-ink" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-white border-t border-zinc-200 px-6 py-4 space-y-3">
          <button onClick={() => scrollTo("how")} className="block w-full text-left text-ink-muted">How it Works</button>
          <button onClick={() => scrollTo("features")} className="block w-full text-left text-ink-muted">Features</button>
          <button onClick={() => scrollTo("pricing")} className="block w-full text-left text-ink-muted">Pricing</button>
          <Link to="/sample-report" className="block text-ink-muted">Sample Report</Link>
          <button onClick={() => scrollTo("faq")} className="block w-full text-left text-ink-muted">FAQ</button>
          <Button onClick={startFlow} className="w-full rounded-full bg-brand hover:bg-brand-hover text-white">Start AI Review</Button>
        </div>
      )}
    </motion.header>
  );
}
