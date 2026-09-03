import React from "react";
import { Cpu, CheckCircle, AlertCircle, UserCheck, Shield } from "lucide-react";
import { FaceDetectionResult } from "../../shared/types/pipeline";

interface FaceStageProps {
  faceResult: FaceDetectionResult | null;
  previewUrl: string | null;
  selectedFaceIndex: number;
  onSelectFace: (index: number) => void;
}

export const FaceStage: React.FC<FaceStageProps> = ({
  faceResult,
  previewUrl,
  selectedFaceIndex,
  onSelectFace,
}) => {
  if (!faceResult) {
    return (
      <div className="bg-goa-green-dark border-2 border-goa-cream/20 p-6 rounded-sm text-center">
        <span className="editorial-tag text-goa-cream/60 border-goa-cream/30">
          STAGE 02 // FACE DETECTION
        </span>
        <p className="text-sm font-mono text-goa-cream/60 mt-3">
          Awaiting input image processing...
        </p>
      </div>
    );
  }

  const primaryFace = faceResult.faces[selectedFaceIndex] || faceResult.primaryFace;
  const isMultiple = faceResult.facesCount > 1;

  return (
    <div className="bg-goa-cream text-goa-black p-6 rounded-sm border-2 border-goa-black shadow-brutal">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b-2 border-goa-black pb-4 mb-6">
        <div>
          <span className="editorial-tag text-goa-green border-goa-green bg-goa-green/10 font-bold">
            STAGE 02 // COMPUTER VISION
          </span>
          <h2 className="font-editorial text-2xl font-extrabold mt-1 text-goa-black">
            Face Detection & 128D Embedding
          </h2>
          <p className="text-xs font-sans text-goa-black/70">
            Local browser & edge detection using face-api.js. Zero biometric vectors are saved on-chain.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-sm flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            {faceResult.facesCount} Face{faceResult.facesCount > 1 ? "s" : ""} Detected
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Bounding Box Overlay */}
        <div className="lg:col-span-6 bg-goa-cream-light border-2 border-goa-black p-4 rounded-sm">
          <div className="flex items-center justify-between border-b border-goa-black/20 pb-2 mb-3">
            <span className="font-mono text-xs font-bold uppercase text-goa-black/70">
              Spatial Localization & Landmarks
            </span>
            <span className="text-[10px] font-mono text-goa-black/60">
              {faceResult.imageMetadata.dimensions.width} × {faceResult.imageMetadata.dimensions.height} px
            </span>
          </div>

          <div className="relative rounded-sm overflow-hidden border border-goa-black max-h-80 mx-auto flex items-center justify-center bg-goa-black/5 p-1">
            <div className="relative inline-block max-w-full max-h-76">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Face Detection Spatial View"
                  className="max-h-76 w-auto max-w-full object-contain block mx-auto rounded-xs"
                />
              )}

              {/* Bounding Box Overlays */}
              {faceResult.faces.map((f, idx) => {
                const isSelected = idx === selectedFaceIndex;
                // Normalize bounding box to exact percentages of original image dimensions
                const top = Math.max(0, (f.boundingBox.y / faceResult.imageMetadata.dimensions.height) * 100);
                const left = Math.max(0, (f.boundingBox.x / faceResult.imageMetadata.dimensions.width) * 100);
                const width = Math.min(100 - left, (f.boundingBox.width / faceResult.imageMetadata.dimensions.width) * 100);
                const height = Math.min(100 - top, (f.boundingBox.height / faceResult.imageMetadata.dimensions.height) * 100);

                return (
                  <div
                    key={f.id}
                    style={{
                      top: `${top}%`,
                      left: `${left}%`,
                      width: `${width}%`,
                      height: `${height}%`,
                    }}
                    className={`absolute border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-goa-pink bg-goa-pink/20 shadow-brutal-pink ring-2 ring-goa-pink/40"
                        : "border-goa-yellow bg-goa-yellow/15 hover:border-goa-pink"
                    }`}
                    onClick={() => onSelectFace(idx)}
                  >
                    <span className="absolute -top-5 left-0 bg-goa-black text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-xs whitespace-nowrap shadow-xs">
                      Face #{idx + 1} ({Math.round(f.confidence * 100)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Face Quality & Feature Vector Specification */}
        <div className="lg:col-span-6 space-y-4">
          {/* Multiple Faces Warning & Selector */}
          {isMultiple && (
            <div className="bg-amber-50 border-2 border-amber-400 p-3 rounded-sm">
              <div className="flex items-center gap-2 text-amber-900 font-mono text-xs font-bold uppercase mb-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Multiple faces detected. Pick the one to trace:
              </div>
              <div className="grid grid-cols-2 gap-2">
                {faceResult.faces.map((f, idx) => (
                  <button
                    key={f.id}
                    onClick={() => onSelectFace(idx)}
                    className={`p-2 text-left text-xs font-mono rounded-sm border transition-all ${
                      selectedFaceIndex === idx
                        ? "bg-goa-green text-goa-cream border-goa-black shadow-brutal-sm font-bold"
                        : "bg-white text-goa-black border-goa-black/30 hover:border-goa-black"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Face #{idx + 1}</span>
                      <span>{Math.round(f.confidence * 100)}%</span>
                    </div>
                    <span className="text-[10px] opacity-80 block mt-1">
                      {selectedFaceIndex === idx ? "✓ Selected" : "[ Use this face ]"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quality Indicator Box */}
          <div className="bg-goa-cream-light border-2 border-goa-black p-4 rounded-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold uppercase text-goa-black/70">
                Face Signal & Quality Check
              </span>
              <span className="font-mono text-xs font-extrabold text-goa-green">
                Score: {primaryFace?.quality.score || 95}/100
              </span>
            </div>

            <p className="font-mono text-xs font-bold text-goa-black mb-3">
              "{primaryFace?.quality.feedback || "Face detected. Good signal."}"
            </p>

            <div className="w-full bg-goa-black/10 h-2 rounded-full overflow-hidden border border-goa-black/20">
              <div
                className="bg-goa-green h-full transition-all duration-500"
                style={{ width: `${primaryFace?.quality.score || 95}%` }}
              />
            </div>
          </div>

          {/* Biometric Vector Spec */}
          <div className="bg-goa-cream-light border-2 border-goa-black p-4 rounded-sm font-mono text-xs">
            <div className="flex items-center gap-2 text-goa-black font-bold uppercase mb-2 border-b border-goa-black/20 pb-2">
              <Cpu className="w-4 h-4 text-goa-pink" />
              DESCRIPTOR GENERATED
            </div>
            
            <div className="space-y-1.5 text-goa-black/80">
              <div className="flex justify-between">
                <span className="text-goa-black/50">Dimensions:</span>
                <span className="font-bold text-goa-black">128 Float32 Dimensions</span>
              </div>
              <div className="flex justify-between">
                <span className="text-goa-black/50">Landmark Points:</span>
                <span className="font-bold text-goa-black">{primaryFace?.landmarksCount || 68} Precise Facial Landmarks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-goa-black/50">Confidence:</span>
                <span className="font-bold text-goa-green">
                  {Math.round((primaryFace?.confidence || 0.96) * 100)}%
                </span>
              </div>
            </div>

            {/* Neural Vector Embedding Preview */}
            {primaryFace?.descriptor && primaryFace.descriptor.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-goa-black/20">
                <div className="flex items-center justify-between text-[10px] text-goa-black/60 mb-1">
                  <span>128D EMBEDDING VECTOR (L2 NORMALIZED)</span>
                  <span className="font-bold text-goa-pink">128 floats</span>
                </div>
                <div className="bg-goa-black text-emerald-400 p-2 rounded-xs text-[10px] font-mono break-all max-h-16 overflow-y-auto leading-relaxed border border-goa-black/40">
                  [{primaryFace.descriptor.slice(0, 16).map((v) => v.toFixed(3)).join(", ")}, ... +{primaryFace.descriptor.length - 16} dims]
                </div>
              </div>
            )}

            <div className="mt-3 pt-2 border-t border-goa-black/20 text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded-sm border border-emerald-200 flex items-start gap-1.5">
              <Shield className="w-3.5 h-3.5 mt-0.5 text-emerald-700 shrink-0" />
              <span>
                <strong>Privacy Guarantee:</strong> Raw facial embeddings are discarded after search matching and never published to the blockchain.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
