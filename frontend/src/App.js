import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "@/lib/auth";
import MetaPixelTracker from "@/components/analytics/MetaPixelTracker";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Onboarding from "@/pages/Onboarding";
import Payment from "@/pages/Payment";
import Analyzing from "@/pages/Analyzing";
import Dashboard from "@/pages/Dashboard";
import SampleReport from "@/pages/SampleReport";
import Premium from "@/pages/Premium";
import ThankYou from "@/pages/ThankYou";
import CompleteDetails from "@/pages/CompleteDetails";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/thank-you" element={<ThankYou />} />
      <Route path="/complete-details" element={<CompleteDetails />} />
      <Route path="/analyzing" element={<Analyzing />} />
      <Route path="/loading" element={<Analyzing />} />
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
          <MetaPixelTracker />
          <AppRouter />
          <Toaster position="top-center" richColors />
          <Analytics />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
