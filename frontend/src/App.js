import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import AuthCallback from "@/pages/AuthCallback";
import Onboarding from "@/pages/Onboarding";
import Payment from "@/pages/Payment";
import Analyzing from "@/pages/Analyzing";
import Dashboard from "@/pages/Dashboard";
import SampleReport from "@/pages/SampleReport";
import Premium from "@/pages/Premium";

function AppRouter() {
  const location = useLocation();
  // CRITICAL: sync check for OAuth session_id before ProtectedRoute runs
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/analyzing" element={<Analyzing />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/sample-report" element={<SampleReport />} />
      <Route path="/premium" element={<Premium />} />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
          <Toaster position="top-center" richColors />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
