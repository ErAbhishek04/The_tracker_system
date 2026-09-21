import React from "react";
import { 
  Cpu, 
  Layers, 
  FileText, 
  HelpCircle, 
  Sparkles, 
  Car, 
  Zap, 
  ShieldCheck 
} from "lucide-react";

export type ActiveTab = "app" | "simulator" | "advisor" | "github";

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  geminiConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab, geminiConnected }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-950/40">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white">
                  FleetPulse AV Engine
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  Sub-6ms XGBoost + Vector RAG
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Predictive vehicle cut-in forecasting grounded by safety manuals & LLM copilot
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              id="tab-app"
              onClick={() => onSelectTab("app")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "app"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/50 border border-emerald-500"
                  : "text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent"
              }`}
            >
              <Car className="w-4 h-4 text-emerald-300 animate-pulse" />
              <span>FleetPulse App</span>
            </button>

            <button
              id="tab-simulator"
              onClick={() => onSelectTab("simulator")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === "simulator"
                  ? "bg-slate-800 text-cyan-300 border border-cyan-800/80 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Pipeline Deep Dive</span>
            </button>

            <button
              id="tab-advisor"
              onClick={() => onSelectTab("advisor")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === "advisor"
                  ? "bg-slate-800 text-indigo-300 border border-indigo-700/60 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <span>AI Copilot Advisor</span>
            </button>

            <button
              id="tab-github"
              onClick={() => onSelectTab("github")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "github"
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-950/40"
                  : "bg-slate-900 text-cyan-400 hover:bg-slate-800 border border-cyan-800/60"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-cyan-300" />
              <span>GitHub Repo</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
