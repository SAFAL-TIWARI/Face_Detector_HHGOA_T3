import React from "react";
import { Check, Loader2, AlertTriangle, Circle } from "lucide-react";
import { PipelineStage, StageStatus } from "../../shared/types/pipeline";

interface PipelineStepperProps {
  stages: StageStatus[];
  currentStage: PipelineStage;
  onSelectStage?: (stage: PipelineStage) => void;
}

export const PipelineStepper: React.FC<PipelineStepperProps> = ({
  stages,
  currentStage,
  onSelectStage,
}) => {
  return (
    <div className="bg-goa-green-dark border-y border-goa-cream/20 py-3 px-4 overflow-x-auto shadow-inner">
      <div className="max-w-7xl mx-auto flex items-center justify-between min-w-[760px] gap-2">
        {stages.map((st, idx) => {
          const isCurrent = currentStage === st.stage;
          const isSuccess = st.status === "success";
          const isRunning = st.status === "running";
          const isError = st.status === "error";

          return (
            <React.Fragment key={st.stage}>
              {idx > 0 && (
                <div
                  className={`h-[2px] flex-1 min-w-[16px] transition-colors ${
                    isSuccess ? "bg-goa-yellow" : "bg-goa-cream/15"
                  }`}
                />
              )}

              <button
                onClick={() => onSelectStage && onSelectStage(st.stage)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-sm transition-all text-left group ${
                  isCurrent
                    ? "bg-goa-cream text-goa-black shadow-brutal-sm scale-105"
                    : isSuccess
                    ? "bg-goa-green text-goa-cream hover:bg-goa-green-light/40"
                    : isRunning
                    ? "bg-goa-yellow/20 text-goa-yellow border border-goa-yellow/50"
                    : "text-goa-cream/60 hover:text-goa-cream hover:bg-goa-cream/5"
                }`}
              >
                {/* Status Indicator Icon */}
                <span className="flex items-center justify-center">
                  {isRunning ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-goa-yellow" />
                  ) : isSuccess ? (
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                  ) : isError ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-goa-pink" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-current opacity-40 inline-block" />
                  )}
                </span>

                {/* Stage Label */}
                <div>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider block">
                    {st.label}
                  </span>
                  {st.durationMs !== undefined && (
                    <span className="text-[9px] font-mono opacity-70 block -mt-0.5">
                      {st.durationMs}ms
                    </span>
                  )}
                </div>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
