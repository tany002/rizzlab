import { Heart, ArrowLeft, Loader2 } from "lucide-react";
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
  const [signingIn, setSigningIn] = useState(false);
  const [gisReady, setGisReady] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const googleShellRef = useRef(null);
  const googleBtnRef = useRef(null);
  const credentialHandlerRef = useRef(null);
  const gisInitializedRef = useRef(false);

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
    credentialHandlerRef.current = handleGoogleCredential;
  }, [handleGoogleCredential]);

  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID?.trim();
    if (!clientId) {
      console.error("[auth] REACT_APP_GOOGLE_CLIENT_ID is not set");
      return;
    }
    if (gisInitializedRef.current) return;

    let cancelled = false;

    (async () => {
      try {
        await loadGoogleScript();
        if (cancelled || gisInitializedRef.current || !googleBtnRef.current) return;

        const mount = googleBtnRef.current;
        const width = googleShellRef.current?.offsetWidth || 400;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => credentialHandlerRef.current?.(response),
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(mount, {
          type: "standard",
          theme: "outline",
          size: "large",
          width,
          text: "continue_with",
        });

        gisInitializedRef.current = true;
        if (!cancelled) setGisReady(true);
      } catch (err) {
        console.error("[auth] Failed to initialize Google sign-in", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID?.trim();

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="max-w-7xl mx-auto w-full px-6 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-ink-muted hover:text-ink text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>
      <div className="flex-1 grid place-items-center px-6 pb-12">
        <div className="w-full max-w-md bg-white rounded-[24px] border border-zinc-200 shadow-card p-8">
          <div className="flex items-center gap-2 mb-8">
            <span className="w-8 h-8 rounded-xl bg-brand text-white grid place-items-center shadow-brand">
              <Heart className="w-4 h-4" fill="white" strokeWidth={0} />
            </span>
            <span className="font-outfit font-semibold text-lg text-ink">RizzLab</span>
          </div>
          <h1 className="font-outfit text-3xl font-semibold tracking-tight text-ink mb-2">Welcome back.</h1>
          <p className="text-ink-muted mb-8">Continue with Google to pick up where you left off.</p>

          <div ref={googleShellRef} className="relative w-full min-h-[48px]">
            {(!googleClientId || !gisReady || signingIn) && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
                {!googleClientId && (
                  <p className="text-sm text-red-600 text-center">Google sign-in is not configured.</p>
                )}
                {googleClientId && !gisReady && !signingIn && (
                  <p className="text-sm text-ink-muted text-center">Loading Google sign-in…</p>
                )}
                {signingIn && (
                  <div className="flex items-center gap-2 text-sm text-ink-muted">
                    <Loader2 className="w-4 h-4 animate-spin" /> Signing you in…
                  </div>
                )}
              </div>
            )}
            <div
              ref={googleBtnRef}
              data-testid={AUTH.googleBtn}
              className="w-full flex items-center justify-center min-h-[48px]"
            />
          </div>

          <p className="text-xs text-ink-muted text-center mt-8">By continuing you agree to our Terms and Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
}
