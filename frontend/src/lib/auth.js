import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "./api";

export const DEFAULT_POST_LOGIN_REDIRECT = "/payment?plan=ai_review";

const AuthContext = createContext({ user: null, loading: true, refresh: () => {}, logout: () => {} });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data);
      } catch (err) {
        // 401 on public pages is expected; only log unexpected errors
        if (err?.response && err.response.status !== 401) {
          console.error("[auth] /me check failed", err);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // Non-blocking: session may already be invalid on server; still clear client state
      console.warn("[auth] logout request failed (continuing local logout)", err?.response?.status || err?.message);
    }
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, loading, refresh: checkAuth, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
