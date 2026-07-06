import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 mt-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-lg bg-brand text-white grid place-items-center">
              <Heart className="w-3.5 h-3.5" fill="white" strokeWidth={0} />
            </span>
            <span className="font-outfit font-semibold text-ink">RizzLab</span>
          </div>
          <p className="text-sm text-ink-muted leading-relaxed">Not a dating app. A coach that helps you become worth swiping right on.</p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-ink-muted font-semibold mb-3">Product</div>
          <ul className="space-y-2 text-sm text-ink-muted">
            <li><a href="#features" className="hover:text-ink">Features</a></li>
            <li><a href="#pricing" className="hover:text-ink">Pricing</a></li>
            <li><a href="/sample-report" className="hover:text-ink">Sample Report</a></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-ink-muted font-semibold mb-3">Company</div>
          <ul className="space-y-2 text-sm text-ink-muted">
            <li><a href="#faq" className="hover:text-ink">FAQ</a></li>
            <li><a href="#" className="hover:text-ink">Contact</a></li>
            <li><a href="#" className="hover:text-ink">Careers</a></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-ink-muted font-semibold mb-3">Legal</div>
          <ul className="space-y-2 text-sm text-ink-muted">
            <li><a href="#" className="hover:text-ink">Privacy</a></li>
            <li><a href="#" className="hover:text-ink">Terms</a></li>
            <li><a href="#" className="hover:text-ink">Instagram</a></li>
            <li><a href="#" className="hover:text-ink">LinkedIn</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-zinc-200 py-6 text-center text-xs text-ink-muted">
        © {new Date().getFullYear()} RizzLab. Built for men who want to level up.
      </div>
    </footer>
  );
}
