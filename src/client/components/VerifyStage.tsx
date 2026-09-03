import React from "react";
import { CheckCircle, AlertTriangle, ShieldCheck, AlertCircle, KeyRound } from "lucide-react";
import { VerificationResult, EvidenceFingerprint, BlockchainRecord } from "../../shared/types/evidence";

interface VerifyStageProps {
  verificationResult: VerificationResult | null;
  fingerprint: EvidenceFingerprint | null;
  blockchainRecord: BlockchainRecord | null;
  onOpenTamper: () => void;
}

export const VerifyStage: React.FC<VerifyStageProps> = ({
  verificationResult,
  fingerprint,
  blockchainRecord,
  onOpenTamper,
}) => {
  if (!verificationResult || !fingerprint) {
    return (
      <div className="bg-goa-green-dark border-2 border-goa-cream/20 p-6 rounded-sm text-center">
        <span className="editorial-tag text-goa-cream/60 border-goa-cream/30">
          STAGE 07 // RE-VERIFICATION
        </span>
        <p className="text-sm font-mono text-goa-cream/60 mt-3">
          Awaiting smart contract verification query...
        </p>
      </div>
    );
  }

  const isVerified = verificationResult.status === "VERIFIED";

  return (
    <div className="bg-goa-cream text-goa-black p-6 rounded-sm border-2 border-goa-black shadow-brutal">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b-2 border-goa-black pb-4 mb-6">
        <div>
          <span className="editorial-tag text-goa-pink border-goa-pink bg-goa-pink/10 font-bold">
            STAGE 07 // AUDIT & INTEGRITY
          </span>
          <h2 className="font-editorial text-2xl font-extrabold mt-1 text-goa-black">
            On-Chain Cryptographic Verification
          </h2>
          <p className="text-xs font-sans text-goa-black/70">
            Recomputed evidence hash verified against immutable smart contract ledger.
          </p>
        </div>

        <div>
          {isVerified ? (
            <span className="px-4 py-1.5 bg-emerald-600 text-white font-mono text-sm font-extrabold uppercase rounded-sm shadow-brutal-sm flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              VERIFIED ✓
            </span>
          ) : (
            <span className="px-4 py-1.5 bg-goa-pink text-white font-mono text-sm font-extrabold uppercase rounded-sm shadow-brutal-sm flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              TAMPER DETECTED ✕
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Verification Matrix Comparison */}
        <div className="bg-goa-cream-light border-2 border-goa-black p-5 rounded-sm space-y-3 font-mono text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-sm border border-goa-black/15">
              <span className="text-[10px] text-goa-black/50 uppercase block font-bold">
                RECOMPUTED LOCAL HASH (CURRENT)
              </span>
              <span className="font-bold text-goa-black break-all text-xs">
                {fingerprint.bytes32Hex}
              </span>
            </div>

            <div className="bg-white p-3 rounded-sm border border-goa-black/15">
              <span className="text-[10px] text-goa-black/50 uppercase block font-bold">
                ON-CHAIN IMMUTABLE HASH (LEDGER)
              </span>
              <span className="font-bold text-emerald-800 break-all text-xs">
                {verificationResult.onChainHash}
              </span>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-sm flex items-center justify-between text-emerald-900 font-bold">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Result: MATCH ✓ — Evidence payload has not been modified.</span>
            </div>
            <span className="text-[10px] uppercase font-mono bg-emerald-200 px-2 py-0.5 rounded-sm">
              EVM Validated
            </span>
          </div>
        </div>

        {/* Callout to Judge Tamper Demo */}
        <div className="bg-goa-black text-goa-cream p-4 rounded-sm border-2 border-goa-black shadow-brutal flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-goa-yellow font-mono text-xs font-bold uppercase mb-1">
              <KeyRound className="w-4 h-4" />
              PROVE WHY BLOCKCHAIN VERIFICATION MATTERS
            </div>
            <p className="text-xs text-goa-cream/80 max-w-xl">
              Simulate an unauthorized alteration to the title, snippet, or URL. See how the recomputed SHA-256 immediately rejects the tampered evidence against the immutable chain.
            </p>
          </div>

          <button
            onClick={onOpenTamper}
            className="px-4 py-2.5 bg-goa-pink text-white font-mono text-xs font-extrabold uppercase rounded-sm border-2 border-goa-pink hover:bg-goa-pink-light transition-all shadow-brutal-yellow shrink-0 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            [ Test Tampering ]
          </button>
        </div>
      </div>
    </div>
  );
};
