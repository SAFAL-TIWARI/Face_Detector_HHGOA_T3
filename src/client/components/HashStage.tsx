import React, { useState } from "react";
import { Copy, Check, Code } from "lucide-react";
import { EvidenceFingerprint } from "../../shared/types/evidence";

interface HashStageProps {
  fingerprint: EvidenceFingerprint | null;
  canonicalJson: string;
}

export const HashStage: React.FC<HashStageProps> = ({
  fingerprint,
  canonicalJson,
}) => {
  const [copied, setCopied] = useState(false);
  const [showJson, setShowJson] = useState(false);

  if (!fingerprint) {
    return (
      <div className="bg-goa-green-dark border-2 border-goa-cream/20 p-6 rounded-sm text-center">
        <span className="editorial-tag text-goa-cream/60 border-goa-cream/30">
          STAGE 05 // CRYPTOGRAPHIC HASHING
        </span>
        <p className="text-sm font-mono text-goa-cream/60 mt-3">
          Awaiting canonical evidence payload serialization...
        </p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(fingerprint.bytes32Hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-goa-cream text-goa-black p-6 rounded-sm border-2 border-goa-black shadow-brutal">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b-2 border-goa-black pb-4 mb-6">
        <div>
          <span className="editorial-tag text-goa-green border-goa-green bg-goa-green/10 font-bold">
            STAGE 05 // CRYPTOGRAPHY
          </span>
          <h2 className="font-editorial text-2xl font-extrabold mt-1 text-goa-black">
            Deterministic SHA-256 Fingerprint
          </h2>
          <p className="text-xs font-sans text-goa-black/70">
            This fingerprint uniquely represents the canonical evidence payload used for on-chain verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-goa-yellow text-goa-black px-2 py-1 rounded-sm border border-goa-black">
            ALGORITHM: SHA-256
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Fingerprint Card */}
        <div className="bg-goa-black text-goa-cream p-4 rounded-sm border-2 border-goa-black shadow-brutal flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 font-mono flex-1 overflow-hidden">
            <span className="text-[10px] text-goa-yellow uppercase tracking-widest block">
              EVIDENCE FINGERPRINT (BYTES32)
            </span>
            <div className="text-xs sm:text-sm font-bold text-goa-cream break-all font-mono">
              {fingerprint.bytes32Hex}
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="px-3 py-2 bg-goa-yellow text-goa-black font-mono text-xs font-bold uppercase rounded-sm border border-goa-yellow hover:bg-goa-yellow-light transition-all flex items-center gap-1.5 shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-800" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Hash
              </>
            )}
          </button>
        </div>

        {/* Deterministic Payload Accordion */}
        <div className="border border-goa-black/30 rounded-sm bg-goa-cream-light overflow-hidden">
          <button
            onClick={() => setShowJson(!showJson)}
            className="w-full px-4 py-2.5 bg-goa-cream-light hover:bg-white text-left font-mono text-xs font-bold uppercase flex items-center justify-between transition-all"
          >
            <span className="flex items-center gap-2">
              <Code className="w-3.5 h-3.5 text-goa-pink" />
              View Canonical JSON Payload ({canonicalJson.length} bytes)
            </span>
            <span>{showJson ? "Hide ↑" : "Inspect ↓"}</span>
          </button>

          {showJson && (
            <div className="p-3 bg-goa-black text-emerald-400 font-mono text-xs border-t border-goa-black/30 overflow-x-auto">
              <pre>{JSON.stringify(JSON.parse(canonicalJson), null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
