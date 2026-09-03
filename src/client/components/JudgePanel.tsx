import React from "react";
import { AuditLogEntry } from "../../shared/types/pipeline";
import { Shield, Lock, Database, Terminal } from "lucide-react";

interface JudgePanelProps {
  auditTrail: AuditLogEntry[];
  isOpen: boolean;
  onClose: () => void;
}

export const JudgePanel: React.FC<JudgePanelProps> = ({ auditTrail, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="bg-goa-black text-goa-cream border-y-2 border-goa-yellow p-6 shadow-2xl mb-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-goa-cream/20 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-goa-yellow text-goa-black text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm uppercase">
                JUDGE & ARCHITECTURE CONSOLE
              </span>
              <span className="text-xs font-mono text-goa-cream/60">TRACE // GOA Spec</span>
            </div>
            <h3 className="font-editorial text-2xl font-bold mt-1 text-goa-cream">
              System Architecture & Verification Proofs
            </h3>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 bg-goa-cream/10 border border-goa-cream/30 text-xs font-mono rounded-sm hover:bg-goa-cream/20 text-goa-cream"
          >
            Close Panel ✕
          </button>
        </div>

        {/* Visual Pipeline Architecture Matrix */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs font-mono">
          <div className="p-3 bg-goa-green-dark border border-goa-cream/20 rounded-sm">
            <span className="text-goa-yellow font-bold block mb-1">01 INPUT</span>
            <span className="text-[11px] text-goa-cream/80">Local File / Camera Ingestion</span>
          </div>

          <div className="p-3 bg-goa-green-dark border border-goa-cream/20 rounded-sm">
            <span className="text-goa-pink font-bold block mb-1">02 FACE</span>
            <span className="text-[11px] text-goa-cream/80">128D Embedding & Quality Signal</span>
          </div>

          <div className="p-3 bg-goa-green-dark border border-goa-cream/20 rounded-sm">
            <span className="text-goa-yellow font-bold block mb-1">03 SEARCH</span>
            <span className="text-[11px] text-goa-cream/80">Playwright Google Lens Adapter</span>
          </div>

          <div className="p-3 bg-goa-green-dark border border-goa-cream/20 rounded-sm">
            <span className="text-goa-pink font-bold block mb-1">04 EVIDENCE</span>
            <span className="text-[11px] text-goa-cream/80">Canonical Web Normalization</span>
          </div>

          <div className="p-3 bg-goa-green-dark border border-goa-cream/20 rounded-sm">
            <span className="text-goa-yellow font-bold block mb-1">05 HASH</span>
            <span className="text-[11px] text-goa-cream/80">SHA-256 Fingerprint (bytes32)</span>
          </div>

          <div className="p-3 bg-goa-green-dark border border-goa-cream/20 rounded-sm">
            <span className="text-goa-pink font-bold block mb-1">06 CHAIN</span>
            <span className="text-[11px] text-goa-cream/80">Hardhat EVM Smart Contract</span>
          </div>

          <div className="p-3 bg-goa-green-dark border border-goa-cream/20 rounded-sm">
            <span className="text-emerald-400 font-bold block mb-1">07 VERIFY</span>
            <span className="text-[11px] text-goa-cream/80">Cryptographic Re-Verification</span>
          </div>
        </div>

        {/* Live Audit Trail Timeline */}
        <div className="bg-goa-green-dark/70 border border-goa-cream/20 p-4 rounded-sm">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-goa-yellow mb-3">
            <Terminal className="w-4 h-4" />
            Live Execution Audit Trail (Actual Timestamps)
          </div>

          {auditTrail.length === 0 ? (
            <p className="text-xs font-mono text-goa-cream/50 italic">
              No audit logs recorded yet. Run a verification to populate live event trace.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-xs pr-2">
              {auditTrail.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 py-1 border-b border-goa-cream/10 text-goa-cream/90"
                >
                  <span className="text-goa-yellow/80 shrink-0">{log.timestamp}</span>
                  <span className="px-1.5 py-0.2 bg-goa-black text-[10px] uppercase font-bold text-goa-cream/80 rounded-sm shrink-0">
                    {log.stage.replace("_", " ")}
                  </span>
                  <span className="flex-1 break-words">{log.action}</span>
                  <span
                    className={`text-[10px] font-bold uppercase ${
                      log.status === "success"
                        ? "text-emerald-400"
                        : log.status === "error"
                        ? "text-goa-pink"
                        : "text-goa-yellow"
                    }`}
                  >
                    [{log.status}]
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security & Zero Biometric Storage Commitments */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="bg-goa-green-dark/40 border border-goa-cream/20 p-3 rounded-sm">
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
              <Shield className="w-4 h-4" /> ZERO BIOMETRICS ON-CHAIN
            </div>
            <p className="text-[11px] text-goa-cream/70">
              Only deterministic SHA-256 hashes of public evidence payload are recorded on Ethereum. Biometric vectors are never broadcasted or stored permanently.
            </p>
          </div>

          <div className="bg-goa-green-dark/40 border border-goa-cream/20 p-3 rounded-sm">
            <div className="flex items-center gap-2 text-goa-yellow font-bold mb-1">
              <Lock className="w-4 h-4" /> SSRF SECURITY SHIELD
            </div>
            <p className="text-[11px] text-goa-cream/70">
              Server-side request filtering strictly blocks loopback, internal network blocks (10.x, 192.168.x, 172.16-31.x), and cloud metadata addresses (169.254.x).
            </p>
          </div>

          <div className="bg-goa-green-dark/40 border border-goa-cream/20 p-3 rounded-sm">
            <div className="flex items-center gap-2 text-goa-pink font-bold mb-1">
              <Database className="w-4 h-4" /> ZERO PAID API DEPENDENCIES
            </div>
            <p className="text-[11px] text-goa-cream/70">
              100% free, local-first stack running on Node.js, face-api.js, Playwright, and local Hardhat EVM without credit cards or external API keys.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
