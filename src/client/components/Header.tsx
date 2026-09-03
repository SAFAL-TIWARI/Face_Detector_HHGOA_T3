import React from "react";
import { Shield, Cpu, Activity, Database, AlertCircle, RefreshCw, Layers } from "lucide-react";

interface HeaderProps {
  health: any;
  onOpenTamper: () => void;
  onToggleJudge: () => void;
  isJudgeMode: boolean;
  onReset: () => void;
  isRunning: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  onOpenTamper,
  onToggleJudge,
  isJudgeMode,
  onReset,
  isRunning,
}) => {
  return (
    <header className="border-b border-goa-cream/20 bg-goa-green-dark/60 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Left: Brand Identity */}
        <div>
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-extrabold text-2xl tracking-tight text-goa-cream">
                  TRACE <span className="text-goa-pink">//</span> GOA
                </h1>
                
              </div>
              <p className="text-[11px] font-mono text-goa-cream/70 tracking-widest uppercase">
                FACE → EVIDENCE → CHAIN
              </p>
            </div>
          </div>
         
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleJudge}
            className={`px-3 py-1.5 text-xs font-mono font-semibold uppercase tracking-wider rounded-sm border transition-all flex items-center gap-1.5 ${
              isJudgeMode
                ? "bg-goa-yellow text-goa-black border-goa-yellow shadow-brutal-sm"
                : "bg-goa-black/40 text-goa-cream border-goa-cream/30 hover:bg-goa-black/70"
            }`}
            title="Toggle Architecture Console & Audit Trail"
          >
            <Layers className="w-3.5 h-3.5" />
            Judge Console
          </button>

          <button
            onClick={onOpenTamper}
            className="px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-sm bg-goa-pink text-white border border-goa-pink shadow-brutal-sm hover:bg-goa-pink-light transition-all flex items-center gap-1.5"
            title="Interactive Blockchain Tamper Proofing Simulator"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Test Tamper
          </button>

          <button
            onClick={onReset}
            disabled={isRunning}
            className="p-1.5 rounded-sm bg-goa-black/40 border border-goa-cream/30 text-goa-cream/80 hover:text-white hover:bg-goa-black/70 transition-all disabled:opacity-50"
            title="Reset Workspace"
          >
            <RefreshCw className={`w-4 h-4 ${isRunning ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
