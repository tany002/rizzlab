import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash || "";
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const sessionId = params.get("session_id");
    if (!sessionId) {
      navigate("/login");
      return;
    }

    (async () => {
      try {
        const { data } = await api.post("/auth/session", { session_id: sessionId });
        if (data?.user) setUser(data.user);
        // clear hash and go to dashboard
        window.history.replaceState({}, "", window.location.pathname);
        navigate("/dashboard", { state: { user: data?.user } });
      } catch (e) {
        console.error("Auth exchange failed", e);
        navigate("/login");
      }
    })();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen grid place-items-center bg-surface">
      <div className="flex items-center gap-3 text-ink-muted">
        <Loader2 className="w-5 h-5 animate-spin text-brand" /> Signing you in…
      </div>
    </div>
  );
}
