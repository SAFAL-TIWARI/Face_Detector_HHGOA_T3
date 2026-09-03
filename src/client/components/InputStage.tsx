import React, { useRef, useState } from "react";
import { Upload, Camera, Image as ImageIcon, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

interface InputStageProps {
  onSelectFile: (file: File) => void;
  onSelectDemoSample: (sample: any) => void;
  demoSamples: any[];
  previewUrl: string | null;
  activeFile: File | null;
  demoSampleId: string | null;
  onRunPipeline: () => void;
  isRunning: boolean;
}

export const InputStage: React.FC<InputStageProps> = ({
  onSelectFile,
  onSelectDemoSample,
  demoSamples,
  previewUrl,
  activeFile,
  demoSampleId,
  onRunPipeline,
  isRunning,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleStartWebcam = async () => {
    try {
      setIsWebcamActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Unable to access camera. Please upload an image or use a demo preset.");
      setIsWebcamActive(false);
    }
  };

  const handleCaptureWebcam = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          onSelectFile(file);
        }
      }, "image/jpeg");
    }
    // Stop tracks
    const stream = videoRef.current.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsWebcamActive(false);
  };

  return (
    <div className="bg-goa-cream text-goa-black p-6 rounded-sm border-2 border-goa-black shadow-brutal">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-goa-black pb-4 mb-6">
        <div>
          <span className="editorial-tag text-goa-pink border-goa-pink bg-goa-pink/10 font-bold">
            STAGE 01 // INPUT
          </span>
          <h2 className="font-editorial text-2xl font-extrabold mt-1 text-goa-black">
            Visual Evidence Ingestion
          </h2>
          <p className="text-xs font-sans text-goa-black/70">
            Drop a photo and let's trace the evidence. For consented / owned images only.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (demoSamples.length > 0) {
                onSelectDemoSample(demoSamples[0]);
              }
            }}
            className="px-3 py-1.5 bg-goa-yellow text-goa-black border border-goa-black font-mono text-xs font-bold uppercase rounded-sm shadow-brutal-sm hover:bg-goa-yellow-light transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Try Demo
          </button>

          <button
            onClick={onRunPipeline}
            disabled={isRunning || (!previewUrl && !activeFile && !demoSampleId)}
            className="px-4 py-2 bg-goa-green text-goa-cream border-2 border-goa-black font-mono text-xs font-extrabold uppercase rounded-sm shadow-brutal hover:bg-goa-green-dark transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
          >
            {isRunning ? (
              <>Tracing Pipeline...</>
            ) : (
              <>Start Verification →</>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dropzone & Upload Methods */}
        <div className="lg:col-span-7 space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && onSelectFile(e.target.files[0])}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />

          {isWebcamActive ? (
            <div className="border-2 border-dashed border-goa-black p-4 rounded-sm bg-goa-cream-light text-center space-y-3">
              <video ref={videoRef} autoPlay playsInline className="w-full max-h-64 object-cover rounded-sm border border-goa-black" />
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleCaptureWebcam}
                  className="px-4 py-1.5 bg-goa-pink text-white font-mono text-xs font-bold uppercase rounded-sm border border-goa-black shadow-brutal-sm"
                >
                  Capture Photo
                </button>
                <button
                  onClick={() => setIsWebcamActive(false)}
                  className="px-4 py-1.5 bg-goa-cream text-goa-black font-mono text-xs font-bold uppercase rounded-sm border border-goa-black"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-goa-pink bg-goa-pink/10 scale-[0.99]"
                  : "border-goa-black/40 hover:border-goa-black bg-goa-cream-light/70 hover:bg-goa-cream-light"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-goa-green/10 text-goa-green flex items-center justify-center mx-auto mb-3 border border-goa-green/30">
                <Upload className="w-6 h-6" />
              </div>
              <p className="font-mono text-sm font-bold uppercase tracking-wider text-goa-black">
                Drag & Drop or Click to Select Image
              </p>
              <p className="text-xs text-goa-black/60 mt-1">
                Supports JPG, PNG, WEBP (Max 15MB)
              </p>
            </div>
          )}

          {/* Quick Actions & Camera button */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              onClick={handleStartWebcam}
              className="px-3 py-1.5 bg-goa-cream-light border border-goa-black font-mono text-xs font-semibold rounded-sm hover:bg-white transition-all flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              Use Webcam
            </button>

            {/* Presets List */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase text-goa-black/60">Presets:</span>
              {demoSamples.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => onSelectDemoSample(sample)}
                  className={`px-2 py-1 text-xs font-mono font-medium rounded-sm border transition-all ${
                    demoSampleId === sample.id
                      ? "bg-goa-green text-goa-cream border-goa-black shadow-brutal-sm"
                      : "bg-goa-cream-light text-goa-black border-goa-black/30 hover:border-goa-black"
                  }`}
                >
                  {sample.type === "single" ? "Single Face" : "Multi-Face"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Preview & Metadata Card */}
        <div className="lg:col-span-5 bg-goa-cream-light border-2 border-goa-black p-4 rounded-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-goa-black/20 pb-2 mb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-goa-black/70">
                Live Preview
              </span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Validated
              </span>
            </div>

            {previewUrl ? (
              <div className="relative rounded-sm overflow-hidden border border-goa-black bg-goa-black/5 aspect-square max-h-56 mx-auto flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Visual Evidence Input"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="rounded-sm border border-dashed border-goa-black/30 aspect-square max-h-56 mx-auto flex flex-col items-center justify-center text-goa-black/40">
                <ImageIcon className="w-10 h-10 mb-2 stroke-1" />
                <span className="font-mono text-xs">No image loaded</span>
              </div>
            )}
          </div>

          {/* Technical Metadata Matrix */}
          <div className="mt-4 pt-3 border-t border-goa-black/20 grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-white/60 p-1.5 rounded-sm border border-goa-black/10">
              <span className="text-[10px] text-goa-black/50 uppercase block">FILE</span>
              <span className="font-bold truncate block">
                {activeFile?.name || (demoSampleId ? `${demoSampleId}.jpg` : "consented-photo.jpg")}
              </span>
            </div>
            <div className="bg-white/60 p-1.5 rounded-sm border border-goa-black/10">
              <span className="text-[10px] text-goa-black/50 uppercase block">SIZE</span>
              <span className="font-bold">
                {activeFile ? `${(activeFile.size / 1024).toFixed(1)} KB` : "655.6 KB"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
