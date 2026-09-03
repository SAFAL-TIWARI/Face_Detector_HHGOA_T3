import React, { useState } from "react";
import {
  ExternalLink,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Search,
  Plus,
  Heart,
  Repeat,
  Star,
  ShieldCheck,
  UserCheck,
  Layers,
} from "lucide-react";
import { ReverseSearchResult, SearchCandidate, SocialPlatform } from "../../shared/types/pipeline";
import { lookupUrlApi } from "../lib/api";

interface SearchStageProps {
  searchResult: ReverseSearchResult | null;
  selectedCandidate: SearchCandidate | null;
  onSelectCandidate: (candidate: SearchCandidate) => void;
  onAddCustomCandidate?: (candidate: SearchCandidate) => void;
  faceResult?: any;
  selectedFaceIndex?: number;
  onSelectFace?: (index: number) => void;
}

export const SearchStage: React.FC<SearchStageProps> = ({
  searchResult,
  selectedCandidate,
  onSelectCandidate,
  onAddCustomCandidate,
  faceResult,
  selectedFaceIndex = 0,
  onSelectFace,
}) => {
  const [customUrl, setCustomUrl] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const activeFace = faceResult?.faces?.[selectedFaceIndex] || faceResult?.primaryFace;

  if (!searchResult) {
    return (
      <div className="bg-goa-green-dark border-2 border-goa-cream/20 p-6 rounded-sm text-center">
        <span className="editorial-tag text-goa-cream/60 border-goa-cream/30">
          STAGE 03 // REVERSE SEARCH & SOCIAL MATCHING
        </span>
        <p className="text-sm font-mono text-goa-cream/60 mt-3">
          Awaiting face embedding for reverse image search...
        </p>
      </div>
    );
  }

  const handleLookupCustomUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    setIsLookingUp(true);
    setLookupError(null);

    try {
      const res = await lookupUrlApi(customUrl.trim());
      if (res.success && res.candidate) {
        if (onAddCustomCandidate) {
          onAddCustomCandidate(res.candidate);
        }
        onSelectCandidate(res.candidate);
        setCustomUrl("");
      } else {
        setLookupError(res.error || "Could not extract metadata from this URL.");
      }
    } catch (err: any) {
      setLookupError(err.message || "Failed to lookup URL.");
    } finally {
      setIsLookingUp(false);
    }
  };

  const getPlatformBadge = (platform?: SocialPlatform, domain?: string) => {
    switch (platform) {
      case "x":
      case "twitter":
        return {
          label: "𝕏 Post",
          bg: "bg-black text-white border-black",
          text: "text-white",
          tag: "X (Twitter)",
        };
      case "github":
        return {
          label: "GitHub Repo",
          bg: "bg-slate-900 text-purple-300 border-purple-500/40",
          text: "text-purple-300",
          tag: "GitHub",
        };
      case "linkedin":
        return {
          label: "LinkedIn Post",
          bg: "bg-sky-950 text-sky-300 border-sky-500/40",
          text: "text-sky-300",
          tag: "LinkedIn",
        };
      case "devpost":
        return {
          label: "Devpost Entry",
          bg: "bg-teal-950 text-teal-300 border-teal-500/40",
          text: "text-teal-300",
          tag: "Devpost",
        };
      case "instagram":
        return {
          label: "Instagram",
          bg: "bg-pink-950 text-pink-300 border-pink-500/40",
          text: "text-pink-300",
          tag: "Instagram",
        };
      default:
        return {
          label: "Public Web",
          bg: "bg-goa-green-dark text-goa-yellow border-goa-yellow/30",
          text: "text-goa-yellow",
          tag: domain || "Web",
        };
    }
  };

  return (
    <div className="bg-goa-cream text-goa-black p-6 rounded-sm border-2 border-goa-black shadow-brutal">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-goa-black pb-4 mb-6">
        <div>
          <span className="editorial-tag text-goa-yellow border-goa-yellow bg-goa-yellow/20 font-bold">
            STAGE 03 // FACE-TARGETED EVIDENCE & SOCIAL MATCHES
          </span>
          <h2 className="font-editorial text-2xl font-extrabold mt-1 text-goa-black">
            Social Posts & Pictures Matching Face #{selectedFaceIndex + 1}
          </h2>
          <p className="text-xs font-sans text-goa-black/70">
            Real public social posts, developer profiles, and visual records discovered on the web matching the targeted face.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {activeFace && (
            <div className="flex items-center gap-2 bg-goa-cream-light border border-goa-black/30 px-2.5 py-1 rounded-sm shadow-xs">
              {(activeFace.thumbnailUrl || activeFace.croppedImageBase64) && (
                <img
                  src={activeFace.thumbnailUrl || activeFace.croppedImageBase64}
                  alt={`Face #${selectedFaceIndex + 1}`}
                  className="w-6 h-6 rounded-xs object-cover border border-goa-black/40"
                />
              )}
              <span className="font-bold text-[11px] text-goa-black">
                Target: Face #{selectedFaceIndex + 1}
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                {Math.round((activeFace.confidence || 0.95) * 100)}%
              </span>
            </div>
          )}

          <a
            href="https://www.google.com/?olud=&atvm=2"
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1 bg-white text-goa-black border border-goa-black/30 hover:border-goa-black hover:bg-goa-cream-light rounded-sm flex items-center gap-1.5 shadow-xs font-bold text-[11px] transition-all"
            title="Open Google Lens web search interface"
          >
            <Globe className="w-3 h-3 text-sky-600" />
            Google Lens ↗
          </a>
          <span className="bg-goa-black text-goa-cream px-2.5 py-1 rounded-sm">
            {searchResult.candidatesCount} Matches • {searchResult.durationMs}ms
          </span>
        </div>
      </div>

      {/* Multi-Face Quick Switcher Strip if multiple faces are detected */}
      {faceResult && faceResult.facesCount > 1 && onSelectFace && (
        <div className="mb-5 bg-amber-50/80 border border-amber-300 p-3 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-amber-950 font-mono text-xs font-bold">
            <UserCheck className="w-4 h-4 text-amber-700" />
            <span>Multiple faces detected in image. Select face to search posts for:</span>
          </div>
          <div className="flex items-center gap-2">
            {faceResult.faces.map((f: any, idx: number) => {
              const isSelected = selectedFaceIndex === idx;
              return (
                <button
                  key={f.id || idx}
                  onClick={() => onSelectFace(idx)}
                  className={`px-3 py-1.5 font-mono text-xs rounded-sm border flex items-center gap-2 transition-all ${
                    isSelected
                      ? "bg-goa-green text-goa-cream border-goa-black shadow-brutal-sm font-bold"
                      : "bg-white text-goa-black border-goa-black/30 hover:border-goa-black hover:bg-goa-cream-light"
                  }`}
                >
                  {(f.thumbnailUrl || f.croppedImageBase64) && (
                    <img
                      src={f.thumbnailUrl || f.croppedImageBase64}
                      alt={`Face #${idx + 1}`}
                      className="w-5 h-5 rounded-xs object-cover border border-goa-black/30"
                    />
                  )}
                  <span>Face #{idx + 1}</span>
                  {isSelected && <span className="text-[10px] text-goa-yellow">✓ Active</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Fallback Notice if Automated Extraction Encountered Captcha / Variations */}
      {searchResult.fallbackRequired && (
        <div className="mb-4 bg-amber-50 border-2 border-amber-400 p-3.5 rounded-sm flex items-start gap-3 text-xs font-mono text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">
              Reverse search executed with public community evidence fallback.
            </p>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Select any matching social post or repository below to anchor and verify on-chain.
            </p>
            {searchResult.searchUrl && (
              <a
                href={searchResult.searchUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-amber-600 text-white font-bold rounded-sm hover:bg-amber-700 transition-all text-[11px]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                [ Open Public Search URL ]
              </a>
            )}
          </div>
        </div>
      )}

      {/* Candidate Results Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-goa-black/70 px-1">
          <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-goa-pink" />
            Discovered Social Posts & Web Sources ({searchResult.candidatesCount})
          </span>
          <span className="text-[11px] text-goa-black/50">Click to select primary evidence for EVM anchoring</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {searchResult.candidates.map((cand, idx) => {
            const isSelected = selectedCandidate?.id === cand.id || (!selectedCandidate && idx === 0);
            const badge = getPlatformBadge(cand.platform, cand.domain);

            return (
              <div
                key={cand.id}
                onClick={() => onSelectCandidate(cand)}
                className={`p-5 rounded-sm border-2 transition-all cursor-pointer flex flex-col justify-between relative group ${
                  isSelected
                    ? "bg-white border-goa-pink shadow-brutal-pink ring-2 ring-goa-pink/20"
                    : "bg-white/80 border-goa-black/25 hover:border-goa-black hover:bg-white hover:shadow-brutal-sm"
                }`}
              >
                <div>
                  {/* Top Bar: Platform Badge & Confidence */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`font-mono text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-sm border flex items-center gap-1.5 shadow-xs ${badge.bg}`}
                    >
                      {badge.label}
                    </span>

                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="text-goa-black/40 text-[10px] uppercase font-bold">MATCH:</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {cand.evidenceConfidence}%
                      </span>
                    </div>
                  </div>

                  {/* Author Header if present */}
                  {cand.author && (
                    <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-goa-black/10">
                      <div className="w-6 h-6 rounded-full bg-goa-green-dark text-goa-yellow flex items-center justify-center font-bold text-xs shrink-0">
                        {cand.author.name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-goa-black truncate">
                            {cand.author.name}
                          </span>
                          {cand.author.verified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          )}
                        </div>
                        {cand.author.handle && (
                          <span className="text-[11px] font-mono text-goa-black/50 block truncate">
                            {cand.author.handle} {cand.author.role ? `• ${cand.author.role}` : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Candidate Media Thumbnail (Google Lens Visual Search Match) */}
                  {cand.imageUrl && (
                    <div className="relative mb-3 rounded-sm overflow-hidden border border-goa-black/20 bg-goa-black/5 aspect-video flex items-center justify-center group-hover:border-goa-black transition-all">
                      <img
                        src={cand.imageUrl}
                        alt={cand.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                      <div className="absolute top-1.5 right-1.5 bg-goa-black/80 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-xs backdrop-blur-xs flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-2.5 h-2.5 text-goa-yellow" />
                        Visual Match
                      </div>
                    </div>
                  )}

                  {/* Post Title & Formatted Snippet */}
                  <h3 className="font-editorial text-sm font-bold text-goa-black mb-1.5 leading-snug line-clamp-2">
                    {cand.title}
                  </h3>

                  <p className="text-xs font-sans text-goa-black/80 bg-goa-cream-light/60 p-2.5 rounded-sm border border-goa-black/10 italic leading-relaxed mb-3 line-clamp-3">
                    "{cand.snippet}"
                  </p>

                  {/* Biometric Neural Face Verification Breakdown */}
                  {cand.faceMatch && (
                    <div className="mb-3 bg-goa-cream-light border border-goa-black/15 p-2.5 rounded-sm">
                      <div className="flex items-center justify-between gap-1.5 mb-2">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-goa-black/70 flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-goa-green" />
                          Neural Face Match
                        </span>
                        <span
                          className={`font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-xs border ${
                            cand.faceMatch.isMatch
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : cand.faceMatch.matchStatus === "NO_FACE_IN_MEDIA"
                              ? "bg-zinc-100 text-zinc-700 border-zinc-300"
                              : "bg-rose-100 text-rose-800 border-rose-300"
                          }`}
                        >
                          {cand.faceMatch.isMatch
                            ? `✓ VERIFIED MATCH (${cand.faceMatch.similarityScore}%)`
                            : cand.faceMatch.matchStatus === "NO_FACE_IN_MEDIA"
                            ? "NO FACE IN MEDIA"
                            : `✗ MISMATCH (${cand.faceMatch.similarityScore}%)`}
                        </span>
                      </div>

                      {/* Side-by-side Face Crop Inspection if faces are available */}
                      {(cand.faceMatch.candidateFaceCrop || cand.faceMatch.queryFaceCrop) && (
                        <div className="flex items-center justify-center gap-4 py-2 bg-white/80 rounded-xs border border-goa-black/10 mb-2 shadow-inner">
                          {cand.faceMatch.queryFaceCrop && (
                            <div className="flex flex-col items-center">
                              <img
                                src={cand.faceMatch.queryFaceCrop}
                                alt="Query Face"
                                className="w-11 h-11 object-cover rounded-xs border-2 border-goa-black/20"
                              />
                              <span className="text-[9px] font-mono font-bold text-goa-black/60 mt-0.5">Query Face</span>
                            </div>
                          )}

                          <div className="flex flex-col items-center px-1">
                            <span className={`font-mono text-xs font-bold ${cand.faceMatch.isMatch ? "text-emerald-700" : "text-rose-600"}`}>
                              {cand.faceMatch.isMatch ? "⟷ MATCH" : "≠ DIFF"}
                            </span>
                            <span className="text-[9px] font-mono text-goa-black/60">
                              d={cand.faceMatch.euclideanDistance}
                            </span>
                          </div>

                          {cand.faceMatch.candidateFaceCrop ? (
                            <div className="flex flex-col items-center">
                              <img
                                src={cand.faceMatch.candidateFaceCrop}
                                alt="Post Face"
                                className="w-11 h-11 object-cover rounded-xs border-2 border-goa-black/20"
                              />
                              <span className="text-[9px] font-mono font-bold text-goa-black/60 mt-0.5">Post Face</span>
                            </div>
                          ) : (
                            <div className="w-11 h-11 flex items-center justify-center bg-goa-black/5 rounded-xs border border-dashed border-goa-black/20 text-[9px] font-mono text-goa-black/40">
                              No Face
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] font-mono text-goa-black/70">
                        <span>
                          Dist: <strong className="text-goa-black">{cand.faceMatch.euclideanDistance}</strong> (Threshold: &lt; {cand.faceMatch.threshold})
                        </span>
                        <span className="truncate max-w-[170px] text-right text-goa-black/60 italic">
                          {cand.faceMatch.isMatch ? "Euclidean match agreed" : "Different identity"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Social Engagement Stats / Tags */}
                  {(cand.engagement || (cand.tags && cand.tags.length > 0)) && (
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-goa-black/60 mb-3">
                      {cand.engagement?.reposts !== undefined && (
                        <span className="flex items-center gap-1">
                          <Repeat className="w-3 h-3 text-goa-green" />
                          {cand.engagement.reposts} Reposts
                        </span>
                      )}
                      {cand.engagement?.likes !== undefined && (
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-rose-500" />
                          {cand.engagement.likes} Likes
                        </span>
                      )}
                      {cand.engagement?.stars !== undefined && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500" />
                          {cand.engagement.stars} Stars
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Metrics & Selection Status */}
                <div className="pt-2.5 border-t border-goa-black/10 flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-2 text-goa-black/60">
                    <span>Sim: <strong className="text-goa-black">{cand.visualSimilarityScore}%</strong></span>
                    <span>•</span>
                    <a
                      href={cand.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="hover:text-goa-pink flex items-center gap-1 underline underline-offset-2"
                    >
                      <span>{cand.domain}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <span
                    className={`font-bold px-2 py-0.5 rounded-sm transition-all ${
                      isSelected
                        ? "bg-goa-pink text-white shadow-xs"
                        : "text-goa-black/60 group-hover:text-goa-black"
                    }`}
                  >
                    {isSelected ? "✓ Primary Evidence" : "Select Evidence"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live URL & Real Social Post Lookup Bar */}
        <div className="pt-2">
          <form
            onSubmit={handleLookupCustomUrl}
            className="bg-goa-cream-light border-2 border-goa-black/30 p-3 rounded-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
          >
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-goa-black/50 shrink-0" />
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Or paste any live public URL / X Post / GitHub repo to test..."
                className="w-full bg-white border border-goa-black/20 px-3 py-1.5 text-xs font-mono text-goa-black rounded-sm focus:outline-none focus:border-goa-pink"
              />
            </div>

            <button
              type="submit"
              disabled={isLookingUp || !customUrl.trim()}
              className="px-4 py-1.5 bg-goa-black text-goa-cream font-mono text-xs font-bold uppercase rounded-sm hover:bg-goa-pink transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 shadow-brutal-sm"
            >
              {isLookingUp ? (
                <span>Fetching Metadata...</span>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>[ Add Live URL ]</span>
                </>
              )}
            </button>
          </form>

          {lookupError && (
            <p className="text-xs font-mono text-rose-700 mt-1.5 px-1">
              ⚠ {lookupError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
