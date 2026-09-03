import React, { useState, useEffect } from "react";
import { X, AlertTriangle, ShieldAlert, CheckCircle, RefreshCw, Sparkles } from "lucide-react";
import { CanonicalEvidencePayload, TamperTestResult } from "../../shared/types/evidence";
import { testTamperApi } from "../lib/api";

interface TamperConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  originalEvidence: CanonicalEvidencePayload | null;
}

const DEFAULT_SAMPLE_EVIDENCE: CanonicalEvidencePayload = {
  canonicalUrl: "https://x.com/hackerhousegoa/status/1765000000000000000",
  domain: "x.com",
  searchProvider: "Google Lens",
  searchedAt: new Date().toISOString(),
  snippet: "Public visual record from Hacker House builder showcase archive and ecosystem repository.",
  title: "Public Builder & Event Visual Evidence",
  url: "https://x.com/hackerhousegoa/status/1765000000000000000",
};

export const TamperConsole: React.FC<TamperConsoleProps> = ({
  isOpen,
  onClose,
  originalEvidence,
}) => {
  const activeOriginal = originalEvidence || DEFAULT_SAMPLE_EVIDENCE;
  const [tamperedTitle, setTamperedTitle] = useState("");
  const [tamperedSnippet, setTamperedSnippet] = useState("");
  const [tamperedUrl, setTamperedUrl] = useState("");
  const [result, setResult] = useState<TamperTestResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const evaluateTamper = async (title: string, snippet: string, url: string) => {
    setIsEvaluating(true);
    try {
      const tamperedObj: CanonicalEvidencePayload = {
        ...activeOriginal,
        title,
        snippet,
        url,
      };
      const res = await testTamperApi(activeOriginal, tamperedObj);
      if (res.success) {
        setResult(res.result);
      }
    } catch (err) {
      console.error("Tamper evaluation failed:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  useEffect(() => {
    if (activeOriginal && isOpen) {
      setTamperedTitle(activeOriginal.title);
      setTamperedSnippet(activeOriginal.snippet);
      setTamperedUrl(activeOriginal.url);
      evaluateTamper(activeOriginal.title, activeOriginal.snippet, activeOriginal.url);
    }
  }, [originalEvidence, isOpen]);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setTamperedTitle(val);
    evaluateTamper(val, tamperedSnippet, tamperedUrl);
  };

  const handleSnippetChange = (val: string) => {
    setTamperedSnippet(val);
    evaluateTamper(tamperedTitle, val, tamperedUrl);
  };

  const handleInjectFakeNews = () => {
    const fakeTitle = "DISPUTED: UNVERIFIED THIRD-PARTY IMPERSONATION";
    const fakeSnippet = "This visual snippet was modified to claim unconsented identity attribution.";
    setTamperedTitle(fakeTitle);
    setTamperedSnippet(fakeSnippet);
    evaluateTamper(fakeTitle, fakeSnippet, tamperedUrl);
  };

  const handleResetToOriginal = () => {
    setTamperedTitle(activeOriginal.title);
    setTamperedSnippet(activeOriginal.snippet);
    setTamperedUrl(activeOriginal.url);
    evaluateTamper(activeOriginal.title, activeOriginal.snippet, activeOriginal.url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-goa-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-goa-cream text-goa-black w-full max-w-3xl rounded-sm border-4 border-goa-black shadow-brutal-lg max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="bg-goa-pink text-white p-4 flex items-center justify-between border-b-2 border-goa-black">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-display font-bold text-lg uppercase tracking-wider">
              Judge Tamper Proofing Simulator
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/20 rounded-sm transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions banner */}
          <div className="bg-goa-cream-light border-2 border-goa-black p-3.5 rounded-sm text-xs font-sans">
            <p className="font-bold text-goa-black">
              Demonstration: Why Cryptographic Hashing on Blockchain Matters
            </p>
            <p className="text-goa-black/70 mt-0.5">
              Edit any field below to simulate tampering with the captured web evidence. Watch the SHA-256 fingerprint change immediately while the immutable blockchain ledger remains unaltered.
            </p>
          </div>

          {/* Preset buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleInjectFakeNews}
              className="px-3 py-1.5 bg-goa-pink text-white font-mono text-xs font-bold uppercase rounded-sm border border-goa-black shadow-brutal-sm hover:bg-goa-pink-light transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Inject Fake Headline
            </button>
            <button
              onClick={handleResetToOriginal}
              className="px-3 py-1.5 bg-goa-cream-light text-goa-black font-mono text-xs font-bold uppercase rounded-sm border border-goa-black hover:bg-white transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset to Original
            </button>
          </div>

          {/* Editable Fields Form */}
          <div className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase text-goa-black/70 mb-1">
                Evidence Title (Simulate Edit):
              </label>
              <input
                type="text"
                value={tamperedTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full p-2.5 bg-white border-2 border-goa-black rounded-sm font-sans text-sm focus:outline-none focus:border-goa-pink shadow-inner"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-goa-black/70 mb-1">
                Evidence Snippet (Simulate Edit):
              </label>
              <textarea
                rows={2}
                value={tamperedSnippet}
                onChange={(e) => handleSnippetChange(e.target.value)}
                className="w-full p-2.5 bg-white border-2 border-goa-black rounded-sm font-sans text-sm focus:outline-none focus:border-goa-pink shadow-inner"
              />
            </div>
          </div>

          {/* Real-time Hash Comparison & Result */}
          {result && (
            <div className="space-y-3 pt-2 border-t-2 border-goa-black font-mono text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-sm border-2 border-goa-black">
                  <span className="text-[10px] text-goa-black/50 uppercase block font-bold">
                    ORIGINAL CANONICAL FINGERPRINT
                  </span>
                  <span className="font-bold text-goa-black break-all">
                    {result.originalHash}
                  </span>
                </div>

                <div className={`p-3 rounded-sm border-2 ${
                  result.isTampered ? "bg-red-50 border-goa-pink" : "bg-emerald-50 border-emerald-500"
                }`}>
                  <span className="text-[10px] text-goa-black/50 uppercase block font-bold">
                    CURRENT (TAMPERED) FINGERPRINT
                  </span>
                  <span className={`font-bold break-all ${
                    result.isTampered ? "text-goa-pink" : "text-emerald-800"
                  }`}>
                    {result.tamperedHash}
                  </span>
                </div>
              </div>

              {/* Status Outcome Banner */}
              {result.isTampered ? (
                <div className="bg-goa-pink text-white p-4 rounded-sm border-2 border-goa-black shadow-brutal flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-display font-extrabold text-base uppercase">
                      ✕ TAMPER DETECTED — VERIFICATION FAILED
                    </h4>
                    <p className="text-xs text-white/90 mt-1 font-sans">
                      The modified evidence produces a different SHA-256 hash ({result.tamperedHash.slice(0, 10)}...). Because the on-chain smart contract holds the original immutable hash, the blockchain mathematically proves the evidence was modified.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-600 text-white p-4 rounded-sm border-2 border-goa-black shadow-brutal flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-display font-extrabold text-base uppercase">
                      ✓ UNTAMPERED — BLOCKCHAIN MATCHES
                    </h4>
                    <p className="text-xs text-white/90 mt-1 font-sans">
                      Current evidence payload matches the original SHA-256 fingerprint registered on the Hardhat smart contract.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-goa-cream-light p-4 border-t-2 border-goa-black flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-goa-black text-goa-cream font-mono text-xs font-bold uppercase rounded-sm hover:bg-goa-green transition-all"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
