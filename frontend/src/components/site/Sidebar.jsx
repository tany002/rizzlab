import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Camera, PenLine, Shirt, MessageSquare, MapPin, ListChecks, Sparkles, LogOut, Heart } from "lucide-react";
import { useAuth } from "@/lib/auth";

const NAV = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "photos", label: "Photos", icon: Camera },
  { id: "bio", label: "Bio", icon: PenLine },
  { id: "style", label: "Style", icon: Shirt },
  { id: "communication", label: "Communication", icon: MessageSquare },
  { id: "date-plan", label: "Date Plan", icon: MapPin },
  { id: "roadmap", label: "Roadmap", icon: ListChecks },
];

export default function Sidebar({ active, onSelect }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="hidden lg:flex w-64 shrink-0 border-r border-zinc-200 bg-white/60 backdrop-blur-xl h-screen sticky top-0 flex-col">
      <div className="px-6 py-6 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-brand text-white grid place-items-center shadow-brand">
            <Heart className="w-4 h-4" fill="white" strokeWidth={0} />
          </span>
          <span className="font-outfit font-semibold text-lg text-ink">RizzLab</span>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              data-testid={`sidebar-${item.id}`}
              onClick={() => onSelect(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive ? "bg-brand-soft text-brand font-medium" : "text-ink-muted hover:bg-zinc-100 hover:text-ink"}`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
              {isActive && <motion.span layoutId="dot" className="ml-auto w-1.5 h-1.5 rounded-full bg-brand" />}
            </button>
          );
        })}
        <button
          onClick={() => navigate("/premium")}
          data-testid="sidebar-upgrade"
          className="mt-4 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm bg-gradient-to-br from-brand to-brand-hover text-white hover:opacity-95 transition-opacity"
        >
          <Sparkles className="w-4 h-4" /> Upgrade to Premium
        </button>
      </nav>
      <div className="border-t border-zinc-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-zinc-200 grid place-items-center text-sm font-medium text-ink">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-ink truncate">{user?.name || "Guest"}</div>
            <div className="text-xs text-ink-muted truncate">{user?.email || ""}</div>
          </div>
          <button onClick={logout} data-testid="sidebar-logout" className="text-ink-muted hover:text-ink"><LogOut className="w-4 h-4" /></button>
        </div>
      </div>
    </aside>
  );
}
