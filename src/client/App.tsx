import React, { useState } from "react";
import { Header } from "./components/Header";
import { PipelineStepper } from "./components/PipelineStepper";
import { InputStage } from "./components/InputStage";
import { FaceStage } from "./components/FaceStage";
import { SearchStage } from "./components/SearchStage";
import { EvidenceStage } from "./components/EvidenceStage";
import { HashStage } from "./components/HashStage";
import { ChainStage } from "./components/ChainStage";
import { VerifyStage } from "./components/VerifyStage";
import { TamperConsole } from "./components/TamperConsole";
import { JudgePanel } from "./components/JudgePanel";
import { usePipeline } from "./hooks/usePipeline";
import { Shield, Sparkles } from "lucide-react";

export function App() {
  const [isJudgeMode, setIsJudgeMode] = useState(false);
  const [isTamperOpen, setIsTamperOpen] = useState(false);

  const {
    currentStage,
    setCurrentStage,
    stages,
    isRunning,
    activeFile,
    previewUrl,
    demoSampleId,
    health,
    demoSamples,
    faceResult,
    selectedFaceIndex,
    setSelectedFaceIndex,
    searchResult,
    selectedCandidate,
    setSelectedCandidate,
    handleAddCustomCandidate,
    canonicalEvidence,
    canonicalJson,
    fingerprint,
    blockchainRecord,
    verificationResult,
    auditTrail,
    handleSelectFile,
    handleSelectDemoSample,
    runCompletePipeline,
    resetPipeline,
  } = usePipeline();

  const handleStartDemoPreset = () => {
    if (demoSamples.length > 0) {
      handleSelectDemoSample(demoSamples[0]);
    }
  };

  return (
    <div className="min-h-screen bg-goa-green flex flex-col font-sans text-goa-cream">
      {/* Header */}
      <Header
        health={health}
        onOpenTamper={() => setIsTamperOpen(true)}
        onToggleJudge={() => setIsJudgeMode(!isJudgeMode)}
        isJudgeMode={isJudgeMode}
        onReset={resetPipeline}
        isRunning={isRunning}
      />

      {/* Stepper Navigation */}
      <PipelineStepper
        stages={stages}
        currentStage={currentStage}
        onSelectStage={setCurrentStage}
      />

      {/* Judge & Architecture Drawer */}
      <JudgePanel
        auditTrail={auditTrail}
        isOpen={isJudgeMode}
        onClose={() => setIsJudgeMode(false)}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Editorial Hero Banner */}
        <section className="border-b-2 border-goa-cream/20 pb-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-goa-cream text-goa-black text-[11px] font-mono font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider mb-3 shadow-brutal-sm">
              <span>🌴</span> HACKER HOUSE GOA 2026 // SHORTLISTING TASK 3
            </div>
            
            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-goa-cream leading-none">
              Find public visual evidence. <br />
              <span className="italic font-normal text-goa-yellow">Fingerprint it.</span> <br />
              Prove it was not altered.
            </h1>

            <p className="font-sans text-sm sm:text-base text-goa-cream/80 mt-4 max-w-xl">
              A local-first, zero-paid-API pipeline connecting JavaScript computer vision, Playwright reverse search, deterministic SHA-256 fingerprinting, and local Hardhat EVM verification.
            </p>

            <p className="text-[11px] font-mono text-goa-cream/60 mt-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              For consented / owned images and public evidence. No private biometric data on-chain.
            </p>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={handleStartDemoPreset}
              className="px-5 py-3 bg-goa-yellow text-goa-black font-mono text-xs font-bold uppercase rounded-sm border-2 border-goa-black shadow-brutal hover:bg-goa-yellow-light transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              [ TRY DEMO ]
            </button>

            <button
              onClick={runCompletePipeline}
              disabled={isRunning || (!previewUrl && !activeFile && !demoSampleId)}
              className="px-6 py-3 bg-goa-pink text-white font-mono text-xs font-extrabold uppercase rounded-sm border-2 border-goa-black shadow-brutal hover:bg-goa-pink-light transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {isRunning ? "Running Pipeline..." : "[ START VERIFICATION ]"}
            </button>
          </div>
        </section>

        {/* 7-Stage Continuous Interactive Workspace */}
        <section className="space-y-8">
          {/* Stage 01: Input */}
          <InputStage
            onSelectFile={handleSelectFile}
            onSelectDemoSample={handleSelectDemoSample}
            demoSamples={demoSamples}
            previewUrl={previewUrl}
            activeFile={activeFile}
            demoSampleId={demoSampleId}
            onRunPipeline={runCompletePipeline}
            isRunning={isRunning}
          />

          {/* Stage 02: Face Detection */}
          {faceResult && (
            <FaceStage
              faceResult={faceResult}
              previewUrl={previewUrl}
              selectedFaceIndex={selectedFaceIndex}
              onSelectFace={setSelectedFaceIndex}
            />
          )}

          {/* Stage 03: Reverse Search */}
          {searchResult && (
            <SearchStage
              searchResult={searchResult}
              selectedCandidate={selectedCandidate}
              onSelectCandidate={(cand) => {
                setSelectedCandidate(cand);
              }}
              onAddCustomCandidate={handleAddCustomCandidate}
              faceResult={faceResult}
              selectedFaceIndex={selectedFaceIndex}
              onSelectFace={setSelectedFaceIndex}
            />
          )}

          {/* Stage 04: Evidence Card */}
          {canonicalEvidence && (
            <EvidenceStage
              canonicalEvidence={canonicalEvidence}
              selectedCandidate={selectedCandidate}
            />
          )}

          {/* Stage 05: Cryptographic Hash */}
          {fingerprint && (
            <HashStage
              fingerprint={fingerprint}
              canonicalJson={canonicalJson}
            />
          )}

          {/* Stage 06: Blockchain Record */}
          {blockchainRecord && (
            <ChainStage blockchainRecord={blockchainRecord} />
          )}

          {/* Stage 07: Re-Verification */}
          {verificationResult && (
            <VerifyStage
              verificationResult={verificationResult}
              fingerprint={fingerprint}
              blockchainRecord={blockchainRecord}
              onOpenTamper={() => setIsTamperOpen(true)}
            />
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-goa-cream/20 bg-goa-green-dark py-6 text-center text-xs font-mono text-goa-cream/60">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            TRACE // GOA — Built for the HH Goa 2026 Shortlisting Challenge
          </p>
          <p className="text-[11px] text-goa-cream/40">
            Node.js • Hardhat EVM • Playwright • face-api.js • SHA-256
          </p>
        </div>
      </footer>

      {/* Tamper Simulation Modal */}
      <TamperConsole
        isOpen={isTamperOpen}
        onClose={() => setIsTamperOpen(false)}
        originalEvidence={canonicalEvidence}
      />
    </div>
  );
}
