import { motion } from "framer-motion";
import { Heart, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { AUTH } from "@/constants/testIds";
import { useAuth, DEFAULT_POST_LOGIN_REDIRECT } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";

const GIS_SCRIPT = "https://accounts.google.com/gsi/client";

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existing = document.querySelector(`script[src="${GIS_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Identity Services")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = GIS_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [gisReady, setGisReady] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  useEffect(() => {
    if (user) {
      const postLoginRedirect = sessionStorage.getItem("postLoginRedirect") || DEFAULT_POST_LOGIN_REDIRECT;
      sessionStorage.removeItem("postLoginRedirect");
      console.info("[auth] User already signed in; redirecting", { postLoginRedirect, userId: user.user_id });
      navigate(postLoginRedirect);
    }
  }, [user, navigate]);

  const handleGoogleCredential = useCallback(async (response) => {
    if (!response?.credential) {
      toast.error("Google sign-in did not return a credential.");
      return;
    }
    setSigningIn(true);
    try {
      const { data } = await api.post("/auth/google", { credential: response.credential });
      if (data?.user) setUser(data.user);
      const postLoginRedirect = sessionStorage.getItem("postLoginRedirect") || DEFAULT_POST_LOGIN_REDIRECT;
      sessionStorage.removeItem("postLoginRedirect");
      console.info("[auth] Google sign-in succeeded; redirecting", { postLoginRedirect, userId: data?.user?.user_id });
      navigate(postLoginRedirect);
    } catch (err) {
      console.error("[auth] Google sign-in failed", err);
      toast.error(err?.response?.data?.detail || "Google sign-in failed. Please try again.");
    } finally {
      setSigningIn(false);
    }
  }, [navigate, setUser]);

  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID?.trim();
    if (!clientId) {
      console.error("[auth] REACT_APP_GOOGLE_CLIENT_ID is not set");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        await loadGoogleScript();
        if (cancelled || !googleBtnRef.current) return;

        // GIS owns this node's children; clear before (re)render to avoid DOM fights with React.
        googleBtnRef.current.replaceChildren();

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredential,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        const width = googleBtnRef.current.offsetWidth || 400;
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          width,
          text: "continue_with",
        });

        if (!cancelled) setGisReady(true);
      } catch (err) {
        console.error("[auth] Failed to initialize Google sign-in", err);
      }
    })();

    return () => {
      cancelled = true;
      // Drop GIS-injected nodes so React unmount does not call removeChild on alien DOM.
      googleBtnRef.current?.replaceChildren();
    };
  }, [handleGoogleCredential]);

  const handleEmail = (e) => {
    e.preventDefault();
    toast.info("Email login is coming soon. Please continue with Google for now.");
  };

  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID?.trim();

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
            <span className="font-outfit font-semibold text-lg text-ink">RizzLab</span>
          </div>
          <h1 className="font-outfit text-3xl font-semibold tracking-tight text-ink mb-2">Welcome back.</h1>
          <p className="text-ink-muted mb-8">Log in to continue your coaching.</p>

          <div className="w-full min-h-[48px] flex flex-col items-center justify-center gap-2">
            {!googleClientId && (
              <p className="text-sm text-red-600 text-center">Google sign-in is not configured.</p>
            )}
            {googleClientId && !gisReady && !signingIn && (
              <p className="text-sm text-ink-muted">Loading Google sign-in…</p>
            )}
            {signingIn && (
              <div className="flex items-center gap-2 text-sm text-ink-muted">
                <Loader2 className="w-4 h-4 animate-spin" /> Signing you in…
              </div>
            )}
            {/* GIS mount point must stay empty — renderButton() owns this DOM, not React. */}
            <div
              ref={googleBtnRef}
              data-testid={AUTH.googleBtn}
              className={`w-full flex items-center justify-center ${!googleClientId || !gisReady || signingIn ? "hidden" : ""}`}
            />
          </div>

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
