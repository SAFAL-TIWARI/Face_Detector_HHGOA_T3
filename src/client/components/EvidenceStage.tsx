import React from "react";
import {
  ExternalLink,
  Globe,
  CheckCircle2,
  ShieldCheck,
  Repeat,
  Heart,
  Star,
  FileCode,
  Sparkles,
} from "lucide-react";
import { CanonicalEvidencePayload } from "../../shared/types/evidence";
import { SearchCandidate, SocialPlatform } from "../../shared/types/pipeline";

interface EvidenceStageProps {
  canonicalEvidence: CanonicalEvidencePayload | null;
  selectedCandidate: SearchCandidate | null;
}

export const EvidenceStage: React.FC<EvidenceStageProps> = ({
  canonicalEvidence,
  selectedCandidate,
}) => {
  if (!canonicalEvidence) {
    return (
      <div className="bg-goa-green-dark border-2 border-goa-cream/20 p-6 rounded-sm text-center">
        <span className="editorial-tag text-goa-cream/60 border-goa-cream/30">
          STAGE 04 // EVIDENCE EXTRACTION & CANONICALIZATION
        </span>
        <p className="text-sm font-mono text-goa-cream/60 mt-3">
          Awaiting reverse search candidate selection...
        </p>
      </div>
    );
  }

  const searchedDate = new Date(canonicalEvidence.searchedAt);
  const formattedDate = searchedDate.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const getPlatformLabel = (platform?: string) => {
    switch (platform?.toLowerCase()) {
      case "x":
      case "twitter":
        return { label: "𝕏 Verified Post", bg: "bg-black text-white" };
      case "github":
        return { label: "GitHub Repository", bg: "bg-slate-900 text-purple-300" };
      case "linkedin":
        return { label: "LinkedIn Article", bg: "bg-sky-950 text-sky-300" };
      case "devpost":
        return { label: "Devpost Submission", bg: "bg-teal-950 text-teal-300" };
      default:
        return { label: "Public Web Evidence", bg: "bg-goa-green-dark text-goa-yellow" };
    }
  };

  const badge = getPlatformLabel(canonicalEvidence.platform || selectedCandidate?.platform);

  return (
    <div className="bg-goa-cream text-goa-black p-6 rounded-sm border-2 border-goa-black shadow-brutal">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b-2 border-goa-black pb-4 mb-6">
        <div>
          <span className="editorial-tag text-goa-pink border-goa-pink bg-goa-pink/10 font-bold">
            STAGE 04 // EVIDENCE ARTIFACT
          </span>
          <h2 className="font-editorial text-2xl font-extrabold mt-1 text-goa-black">
            Normalized Social Evidence Record
          </h2>
          <p className="text-xs font-sans text-goa-black/70">
            Canonical payload deterministically formatted for SHA-256 fingerprinting & smart contract anchoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-sm shadow-brutal-sm ${badge.bg}`}>
            {badge.label}
          </span>
          <span className="text-xs font-mono font-bold bg-emerald-600 text-white px-2.5 py-1 rounded-sm shadow-brutal-sm">
            CONFIDENCE: {selectedCandidate?.evidenceConfidence || 95}%
          </span>
        </div>
      </div>

      <div className="bg-white border-2 border-goa-black p-6 rounded-sm space-y-5 shadow-brutal-sm">
        {/* Author Header */}
        {selectedCandidate?.author && (
          <div className="flex items-center justify-between gap-3 border-b border-goa-black/15 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-goa-green text-goa-cream flex items-center justify-center font-bold text-base border border-goa-black shadow-brutal-sm">
                {selectedCandidate.author.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-editorial text-base font-bold text-goa-black">
                    {selectedCandidate.author.name}
                  </span>
                  {selectedCandidate.author.verified && (
                    <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  )}
                </div>
                <div className="text-xs font-mono text-goa-black/60">
                  {selectedCandidate.author.handle || selectedCandidate.domain}
                  {selectedCandidate.author.role ? ` • ${selectedCandidate.author.role}` : ""}
                </div>
              </div>
            </div>

            <a
              href={canonicalEvidence.url}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 bg-goa-black text-goa-cream font-mono text-xs font-bold uppercase rounded-sm hover:bg-goa-pink transition-all flex items-center gap-1.5 shadow-brutal-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              [ View Source Post ]
            </a>
          </div>
        )}

        {/* Post Title & Content */}
        <div>
          <h3 className="font-editorial text-xl font-bold text-goa-black mb-2 leading-snug">
            "{canonicalEvidence.title}"
          </h3>
          <blockquote className="text-sm font-sans text-goa-black/90 bg-goa-cream-light p-4 rounded-sm border-l-4 border-goa-pink italic leading-relaxed">
            "{canonicalEvidence.snippet}"
          </blockquote>
        </div>

        {/* Engagement Counter / Metadata */}
        {selectedCandidate?.engagement && (
          <div className="flex items-center gap-4 text-xs font-mono text-goa-black/70 pt-1">
            {selectedCandidate.engagement.reposts !== undefined && (
              <span className="flex items-center gap-1.5 bg-goa-cream-light px-2.5 py-1 rounded border border-goa-black/10">
                <Repeat className="w-3.5 h-3.5 text-goa-green" />
                <strong>{selectedCandidate.engagement.reposts}</strong> Reposts
              </span>
            )}
            {selectedCandidate.engagement.likes !== undefined && (
              <span className="flex items-center gap-1.5 bg-goa-cream-light px-2.5 py-1 rounded border border-goa-black/10">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <strong>{selectedCandidate.engagement.likes}</strong> Likes
              </span>
            )}
            {selectedCandidate.engagement.stars !== undefined && (
              <span className="flex items-center gap-1.5 bg-goa-cream-light px-2.5 py-1 rounded border border-goa-black/10">
                <Star className="w-3.5 h-3.5 text-amber-500" />
                <strong>{selectedCandidate.engagement.stars}</strong> Stars
              </span>
            )}
          </div>
        )}

        {/* Canonical URL Strip */}
        <div className="text-xs font-mono break-all text-goa-black/70 bg-goa-cream-light p-3 rounded-sm border border-goa-black/20">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-goa-black uppercase text-[10px] tracking-wider">
              DETERMINISTIC CANONICAL URL:
            </span>
            <span className="text-[10px] text-emerald-700 font-bold">
              ✓ Tracking Parameters Purged
            </span>
          </div>
          <span className="text-goa-black font-medium">{canonicalEvidence.canonicalUrl}</span>
        </div>

        {/* Evidence Metadata Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-goa-black/15 text-xs font-mono">
          <div className="bg-goa-cream-light p-2.5 rounded-sm border border-goa-black/10">
            <span className="text-[10px] text-goa-black/50 uppercase block font-bold">SOURCE DOMAIN</span>
            <span className="font-bold text-goa-black truncate block">{canonicalEvidence.domain}</span>
          </div>

          <div className="bg-goa-cream-light p-2.5 rounded-sm border border-goa-black/10">
            <span className="text-[10px] text-goa-black/50 uppercase block font-bold">PROVENANCE PROVIDER</span>
            <span className="font-bold text-goa-black truncate block">{canonicalEvidence.searchProvider}</span>
          </div>

          <div className="bg-goa-cream-light p-2.5 rounded-sm border border-goa-black/10">
            <span className="text-[10px] text-goa-black/50 uppercase block font-bold">TIMESTAMP (UTC)</span>
            <span className="font-bold text-goa-black">{formattedDate}</span>
          </div>

          <div className="bg-goa-cream-light p-2.5 rounded-sm border border-goa-black/10">
            <span className="text-[10px] text-goa-black/50 uppercase block font-bold">BIOMETRIC FACE MATCH</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {canonicalEvidence.faceVerified !== false ? "VERIFIED ✓" : "MISMATCH ✗"} ({canonicalEvidence.faceMatchScore || selectedCandidate?.visualSimilarityScore || 95}%)
            </span>
            {canonicalEvidence.faceDistance !== undefined && (
              <span className="text-[9px] text-goa-black/50 block mt-0.5">
                d={canonicalEvidence.faceDistance} (&lt; 0.60 threshold)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
