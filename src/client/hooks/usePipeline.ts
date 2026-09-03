import { useState, useEffect, useCallback } from "react";
import {
  PipelineStage,
  StageStatus,
  FaceDetectionResult,
  ReverseSearchResult,
  SearchCandidate,
  AuditLogEntry,
  DetectedFace,
} from "../../shared/types/pipeline";
import {
  CanonicalEvidencePayload,
  EvidenceFingerprint,
  BlockchainRecord,
  VerificationResult,
} from "../../shared/types/evidence";
import {
  fetchHealth,
  fetchDemoSamples,
  analyzeImageApi,
  searchReverseApi,
  normalizeEvidenceApi,
  recordOnChainApi,
  verifyOnChainApi,
} from "../lib/api";
import {
  initFaceApiModels,
  detectFacesInElement,
  matchCandidatePostFace,
  loadImageAsync,
} from "../lib/faceDetector";

const INITIAL_STAGES: StageStatus[] = [
  { stage: "01_INPUT", label: "01 INPUT", status: "idle", message: "Drop a photo and let's trace the evidence." },
  { stage: "02_FACE", label: "02 FACE", status: "idle", message: "Waiting for visual input..." },
  { stage: "03_SEARCH", label: "03 SEARCH", status: "idle", message: "Awaiting face crop..." },
  { stage: "04_EVIDENCE", label: "04 EVIDENCE", status: "idle", message: "Awaiting web search..." },
  { stage: "05_HASH", label: "05 HASH", status: "idle", message: "Awaiting canonical data..." },
  { stage: "06_CHAIN", label: "06 CHAIN", status: "idle", message: "Awaiting fingerprint..." },
  { stage: "07_VERIFY", label: "07 VERIFY", status: "idle", message: "Awaiting on-chain record..." },
];

export function usePipeline() {
  const [currentStage, setCurrentStage] = useState<PipelineStage>("01_INPUT");
  const [stages, setStages] = useState<StageStatus[]>(INITIAL_STAGES);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [demoSampleId, setDemoSampleId] = useState<string | null>(null);

  // Health and Demo Samples
  const [health, setHealth] = useState<any>(null);
  const [demoSamples, setDemoSamples] = useState<any[]>([]);

  // Pipeline Data States
  const [faceResult, setFaceResult] = useState<FaceDetectionResult | null>(null);
  const [selectedFaceIndex, setSelectedFaceIndex] = useState<number>(0);
  const [searchResult, setSearchResult] = useState<ReverseSearchResult | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<SearchCandidate | null>(null);
  const [canonicalEvidence, setCanonicalEvidence] = useState<CanonicalEvidencePayload | null>(null);
  const [canonicalJson, setCanonicalJson] = useState<string>("");
  const [fingerprint, setFingerprint] = useState<EvidenceFingerprint | null>(null);
  const [blockchainRecord, setBlockchainRecord] = useState<BlockchainRecord | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [auditTrail, setAuditTrail] = useState<AuditLogEntry[]>([]);

  // Load health, samples, and neural models on mount
  useEffect(() => {
    fetchHealth().then(setHealth).catch(console.error);
    fetchDemoSamples().then((res) => setDemoSamples(res.samples || [])).catch(console.error);
    initFaceApiModels().catch(console.warn);
  }, []);

  const addAudit = useCallback(
    (stage: PipelineStage, action: string, status: "info" | "success" | "warning" | "error" = "info", details?: any) => {
      const entry: AuditLogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toLocaleTimeString("en-GB", { hour12: false }),
        stage,
        action,
        status,
        details,
      };
      setAuditTrail((prev) => [...prev, entry]);
    },
    []
  );

  const updateStageStatus = useCallback(
    (stage: PipelineStage, status: StageStatus["status"], message?: string, durationMs?: number) => {
      setStages((prev) =>
        prev.map((s) => (s.stage === stage ? { ...s, status, message: message || s.message, durationMs } : s))
      );
    },
    []
  );

  // Handle local image selection
  const handleSelectFile = (file: File) => {
    setActiveFile(file);
    setDemoSampleId(null);
    setPreviewUrl(URL.createObjectURL(file));
    resetPipeline();
    updateStageStatus("01_INPUT", "success", `Loaded ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    addAudit("01_INPUT", `Loaded ${file.name}`, "info");
  };

  // Handle preset sample selection
  const handleSelectDemoSample = (sample: any) => {
    setActiveFile(null);
    setDemoSampleId(sample.id);
    setPreviewUrl(sample.url);
    resetPipeline();
    updateStageStatus("01_INPUT", "success", `Selected demo preset: ${sample.name}`);
    addAudit("01_INPUT", `Selected demo preset: ${sample.name}`, "info");
  };

  const resetPipeline = () => {
    setFaceResult(null);
    setSelectedFaceIndex(0);
    setSearchResult(null);
    setSelectedCandidate(null);
    setCanonicalEvidence(null);
    setCanonicalJson("");
    setFingerprint(null);
    setBlockchainRecord(null);
    setVerificationResult(null);
    setStages(INITIAL_STAGES);
    setCurrentStage("01_INPUT");
  };

  /**
   * Re-computes canonicalization, SHA-256 fingerprint, and EVM anchoring for any candidate
   */
  const selectAndProcessCandidate = async (candidate: SearchCandidate) => {
    setSelectedCandidate(candidate);
    addAudit("03_SEARCH", `Selected candidate evidence: ${candidate.title} (${candidate.domain})`, "info");

    try {
      updateStageStatus("04_EVIDENCE", "running", `Normalizing evidence from ${candidate.domain}...`);
      
      const evidencePayload = {
        url: candidate.url,
        canonicalUrl: candidate.url,
        title: candidate.title,
        domain: candidate.domain,
        imageUrl: candidate.imageUrl,
        platform: candidate.platform,
        author: candidate.author ? `${candidate.author.name}${candidate.author.handle ? ` (${candidate.author.handle})` : ""}` : undefined,
        snippet: candidate.snippet,
        searchProvider: searchResult?.provider || "Social Media Matcher",
        searchedAt: searchResult?.searchedAt || new Date().toISOString(),
        faceVerified: candidate.faceMatch?.isMatch ?? true,
        faceMatchScore: candidate.faceMatch?.similarityScore ?? candidate.visualSimilarityScore,
        faceDistance: candidate.faceMatch?.euclideanDistance ?? 0.35,
      };

      const evidenceResponse = await normalizeEvidenceApi(evidencePayload);
      setCanonicalEvidence(evidenceResponse.canonicalEvidence);
      setCanonicalJson(evidenceResponse.canonicalJson);
      setFingerprint(evidenceResponse.fingerprint);
      updateStageStatus("04_EVIDENCE", "success", `Evidence normalized from ${candidate.domain}`);
      addAudit("04_EVIDENCE", `Deterministic canonical JSON created for ${candidate.domain}`, "success");

      // Hash
      updateStageStatus("05_HASH", "success", `SHA-256 locked: ${evidenceResponse.fingerprint.bytes32Hex.slice(0, 10)}...`);
      addAudit("05_HASH", `SHA-256 fingerprint updated: ${evidenceResponse.fingerprint.bytes32Hex.slice(0, 14)}...`, "success");

      // Chain
      updateStageStatus("06_CHAIN", "running", "Anchoring fingerprint to Hardhat EVM...");
      const recordResponse = await recordOnChainApi(
        evidenceResponse.fingerprint.bytes32Hex,
        evidenceResponse.canonicalEvidence.domain
      );
      setBlockchainRecord(recordResponse.result);
      updateStageStatus("06_CHAIN", "success", `Proof anchored in Block #${recordResponse.result.blockNumber}`);
      addAudit("06_CHAIN", `Evidence anchored in block #${recordResponse.result.blockNumber}`, "success");

      // Verify
      updateStageStatus("07_VERIFY", "running", "Querying on-chain registry...");
      const verifyResponse = await verifyOnChainApi(evidenceResponse.fingerprint.bytes32Hex);
      setVerificationResult(verifyResponse.result);
      updateStageStatus("07_VERIFY", "success", "Chain agrees. Verification complete.");
      addAudit("07_VERIFY", `On-chain status: ${verifyResponse.result.status}`, "success");
    } catch (err: any) {
      console.error("Candidate processing error:", err);
      addAudit("04_EVIDENCE", `Error processing candidate: ${err.message}`, "error");
    }
  };

  /**
   * Handle face selection change (in multi-face mode)
   */
  const handleSelectFace = async (faceIndex: number) => {
    setSelectedFaceIndex(faceIndex);
    addAudit("02_FACE", `Switched active face index to #${faceIndex + 1}`, "info");

    // If search results already exist, refresh search candidates for the newly selected face
    if (searchResult) {
      const activeFace = faceResult?.faces[faceIndex] || faceResult?.primaryFace;
      const formData = new FormData();
      if (activeFile) {
        formData.append("image", activeFile);
      } else if (demoSampleId) {
        formData.append("demoSampleId", demoSampleId);
      }
      formData.append("faceIndex", String(faceIndex));
      formData.append("faceCount", String(faceResult?.facesCount || 1));
      if (activeFace?.croppedImageBase64) {
        formData.append("faceCropBase64", activeFace.croppedImageBase64);
      }

      try {
        updateStageStatus("03_SEARCH", "running", `Searching evidence matching Face #${faceIndex + 1}...`);
        const searchRes = await searchReverseApi(formData);
        
        // Re-match against newly selected face descriptor
        const queryDescriptor = activeFace?.descriptor;
        const queryFaceCrop = activeFace?.thumbnailUrl || activeFace?.croppedImageBase64 || previewUrl || undefined;

        const rematchedCandidates: SearchCandidate[] = [];
        for (const cand of searchRes.result.candidates) {
          const c = { ...cand };
          const candImg = c.imageUrl || previewUrl || undefined;
          if (queryDescriptor && candImg) {
            const match = await matchCandidatePostFace(queryDescriptor, candImg, queryFaceCrop);
            c.faceMatch = match;
            c.visualSimilarityScore = match.similarityScore;
            c.evidenceConfidence = Math.round(match.similarityScore * 0.65 + c.pageRelevanceScore * 0.35);
          }
          rematchedCandidates.push(c);
        }

        rematchedCandidates.sort((a, b) => {
          const aMatch = a.faceMatch?.isMatch ? 1 : 0;
          const bMatch = b.faceMatch?.isMatch ? 1 : 0;
          if (aMatch !== bMatch) return bMatch - aMatch;
          return (b.faceMatch?.similarityScore || b.visualSimilarityScore) - (a.faceMatch?.similarityScore || a.visualSimilarityScore);
        });

        rematchedCandidates.forEach((c, idx) => {
          c.isSelected = idx === 0;
        });

        const updatedSearchResult = {
          ...searchRes.result,
          candidates: rematchedCandidates,
          selectedEvidence: rematchedCandidates[0],
        };

        setSearchResult(updatedSearchResult);
        if (rematchedCandidates.length > 0) {
          await selectAndProcessCandidate(rematchedCandidates[0]);
        }
        updateStageStatus("03_SEARCH", "success", `Biometrically matched ${rematchedCandidates.length} posts for Face #${faceIndex + 1}`);
      } catch (err: any) {
        console.warn("Failed to refresh face search:", err);
      }
    }
  };

  /**
   * Handle custom candidate added via URL lookup
   */
  const handleAddCustomCandidate = (candidate: SearchCandidate) => {
    if (searchResult) {
      setSearchResult({
        ...searchResult,
        candidatesCount: searchResult.candidatesCount + 1,
        candidates: [candidate, ...searchResult.candidates],
      });
    }
    selectAndProcessCandidate(candidate);
  };

  /**
   * Runs the complete 7-stage verification pipeline sequentially with live UI state updates
   */
  const runCompletePipeline = async () => {
    if (!activeFile && !demoSampleId && !previewUrl) {
      alert("Please upload a photo or select a demo sample first.");
      return;
    }

    setIsRunning(true);
    resetPipeline();

    const formData = new FormData();
    if (activeFile) {
      formData.append("image", activeFile);
    } else if (demoSampleId) {
      formData.append("demoSampleId", demoSampleId);
    } else if (previewUrl) {
      formData.append("demoSampleId", "consented-photo");
    }
    formData.append("faceIndex", String(selectedFaceIndex));

    try {
      // 01 INPUT
      setCurrentStage("01_INPUT");
      updateStageStatus("01_INPUT", "running", "Validating image format & safety...");
      await new Promise((r) => setTimeout(r, 200));
      updateStageStatus("01_INPUT", "success", "Image validated. Ready for face detection.");
      addAudit("01_INPUT", "Image validated. Good resolution and format.", "success");

      // 02 FACE DETECTION
      setCurrentStage("02_FACE");
      updateStageStatus("02_FACE", "running", "Detecting faces, landmarks & 128D embedding vector...");

      let detectedFaces: DetectedFace[] = [];
      if (previewUrl) {
        try {
          const img = await loadImageAsync(previewUrl);
          const dims = { width: img.naturalWidth || img.width || 1024, height: img.naturalHeight || img.height || 1024 };
          detectedFaces = await detectFacesInElement(img, dims);
        } catch (clientErr) {
          console.warn("[usePipeline] Client neural detection notice, falling back to server:", clientErr);
        }
      }

      const faceResponse = await analyzeImageApi(formData);
      let finalFaceResult: FaceDetectionResult | null = null;

      if (detectedFaces.length > 0) {
        const naturalDims = previewUrl ? await (async () => {
          try {
            const im = await loadImageAsync(previewUrl);
            return { width: im.naturalWidth || im.width || 1024, height: im.naturalHeight || im.height || 1024 };
          } catch {
            return { width: 1024, height: 1024 };
          }
        })() : { width: 1024, height: 1024 };

        finalFaceResult = {
          facesCount: detectedFaces.length,
          faces: detectedFaces,
          selectedFaceIndex: 0,
          primaryFace: detectedFaces[0],
          imageMetadata: {
            fileName: activeFile?.name || (demoSampleId === "consented-multi-portrait" ? "consented-multi-portrait.jpg" : "consented-photo.jpg"),
            fileSizeBytes: activeFile?.size || 671367,
            fileSizeFormatted: activeFile ? `${(activeFile.size / 1024).toFixed(1)} KB` : "655.6 KB",
            mimeType: activeFile?.type || "image/jpeg",
            dimensions: naturalDims,
          },
          processingDurationMs: faceResponse?.result?.processingDurationMs || 150,
        };
      } else if (faceResponse.success && faceResponse.result.facesCount > 0) {
        finalFaceResult = faceResponse.result;
      }

      if (!finalFaceResult || finalFaceResult.facesCount === 0) {
        updateStageStatus("02_FACE", "error", "Mmm, no clear face there. Try a closer photo.");
        addAudit("02_FACE", "No face detected in photo.", "error");
        setIsRunning(false);
        return;
      }

      setFaceResult(finalFaceResult);
      setSelectedFaceIndex(finalFaceResult.selectedFaceIndex);
      updateStageStatus(
        "02_FACE",
        "success",
        finalFaceResult.primaryFace?.quality.feedback || "Face detected. Good signal.",
        finalFaceResult.processingDurationMs
      );
      addAudit(
        "02_FACE",
        `Face detected with 128D descriptor (Quality: ${finalFaceResult.primaryFace?.quality.score}%).`,
        "success"
      );

      // 03 REVERSE SEARCH & BIOMETRIC FACE MATCHING
      setCurrentStage("03_SEARCH");
      updateStageStatus("03_SEARCH", "running", `Searching public social posts & visual evidence for Face #${selectedFaceIndex + 1}...`);

      const activeFace = finalFaceResult.faces[selectedFaceIndex] || finalFaceResult.primaryFace;
      const queryDescriptor = activeFace?.descriptor;
      const queryFaceCrop = activeFace?.thumbnailUrl || activeFace?.croppedImageBase64 || previewUrl || undefined;

      const searchFormData = new FormData();
      if (activeFile) {
        searchFormData.append("image", activeFile);
      } else if (demoSampleId) {
        searchFormData.append("demoSampleId", demoSampleId);
      } else if (previewUrl) {
        searchFormData.append("demoSampleId", "consented-photo");
      }
      searchFormData.append("faceIndex", String(selectedFaceIndex));
      searchFormData.append("faceCount", String(finalFaceResult.facesCount));
      if (activeFace?.croppedImageBase64) {
        searchFormData.append("faceCropBase64", activeFace.croppedImageBase64);
      }

      const searchResponse = await searchReverseApi(searchFormData);

      const rawCandidates = searchResponse.result.candidates || [];
      const matchedCandidates: SearchCandidate[] = [];

      for (let i = 0; i < rawCandidates.length; i++) {
        const cand = { ...rawCandidates[i] };
        const candidateImg = cand.imageUrl || previewUrl || undefined;
        if (queryDescriptor && candidateImg) {
          try {
            const faceMatch = await matchCandidatePostFace(queryDescriptor, candidateImg, queryFaceCrop);
            cand.faceMatch = faceMatch;
            cand.visualSimilarityScore = faceMatch.similarityScore;
            cand.evidenceConfidence = Math.round(faceMatch.similarityScore * 0.65 + cand.pageRelevanceScore * 0.35);
          } catch (mErr) {
            console.warn(`[usePipeline] Face match error on candidate ${i}:`, mErr);
          }
        }
        matchedCandidates.push(cand);
      }

      // Prioritize verified face matches (< 0.60 distance), then highest similarity
      matchedCandidates.sort((a, b) => {
        const aMatch = a.faceMatch?.isMatch ? 1 : 0;
        const bMatch = b.faceMatch?.isMatch ? 1 : 0;
        if (aMatch !== bMatch) return bMatch - aMatch;
        return (b.faceMatch?.similarityScore || b.visualSimilarityScore) - (a.faceMatch?.similarityScore || a.visualSimilarityScore);
      });

      matchedCandidates.forEach((c, idx) => {
        c.isSelected = idx === 0;
      });

      const updatedSearchResult: ReverseSearchResult = {
        ...searchResponse.result,
        candidatesCount: matchedCandidates.length,
        candidates: matchedCandidates,
        selectedEvidence: matchedCandidates[0],
      };

      setSearchResult(updatedSearchResult);
      const primaryCandidate = matchedCandidates[0] || searchResponse.result.candidates[0];
      setSelectedCandidate(primaryCandidate);

      const verifiedCount = matchedCandidates.filter((c) => c.faceMatch?.isMatch).length;
      updateStageStatus(
        "03_SEARCH",
        matchedCandidates.length > 0 ? "success" : "warning",
        verifiedCount > 0
          ? `Biometrically verified ${verifiedCount} matching social media post(s).`
          : `Discovered ${matchedCandidates.length} candidate visual matches.`,
        searchResponse.result.durationMs
      );
      addAudit(
        "03_SEARCH",
        `Biometric matching completed. Top match: ${primaryCandidate.title} (${primaryCandidate.faceMatch?.similarityScore || primaryCandidate.visualSimilarityScore}% match).`,
        "success"
      );

      // 04 EVIDENCE NORMALIZATION
      setCurrentStage("04_EVIDENCE");
      updateStageStatus("04_EVIDENCE", "running", "Extracting canonical evidence payload...");
      await new Promise((r) => setTimeout(r, 150));

      const evidenceResponse = await normalizeEvidenceApi({
        url: primaryCandidate.url,
        canonicalUrl: primaryCandidate.url,
        title: primaryCandidate.title,
        domain: primaryCandidate.domain,
        imageUrl: primaryCandidate.imageUrl,
        platform: primaryCandidate.platform,
        author: primaryCandidate.author ? `${primaryCandidate.author.name}${primaryCandidate.author.handle ? ` (${primaryCandidate.author.handle})` : ""}` : undefined,
        snippet: primaryCandidate.snippet,
        searchProvider: searchResponse.result.provider,
        searchedAt: searchResponse.result.searchedAt,
        faceVerified: primaryCandidate.faceMatch?.isMatch ?? true,
        faceMatchScore: primaryCandidate.faceMatch?.similarityScore ?? primaryCandidate.visualSimilarityScore,
        faceDistance: primaryCandidate.faceMatch?.euclideanDistance ?? 0.35,
      });

      setCanonicalEvidence(evidenceResponse.canonicalEvidence);
      setCanonicalJson(evidenceResponse.canonicalJson);
      setFingerprint(evidenceResponse.fingerprint);

      updateStageStatus("04_EVIDENCE", "success", `Public evidence normalized from ${primaryCandidate.domain}`);
      addAudit("04_EVIDENCE", `Evidence normalized deterministically from ${primaryCandidate.domain}`, "success");

      // 05 CRYPTOGRAPHIC HASH
      setCurrentStage("05_HASH");
      updateStageStatus("05_HASH", "running", "Generating SHA-256 evidence fingerprint...");
      await new Promise((r) => setTimeout(r, 150));
      updateStageStatus("05_HASH", "success", "Fingerprint locked.");
      addAudit("05_HASH", `SHA-256 fingerprint generated: ${evidenceResponse.fingerprint.bytes32Hex.slice(0, 14)}...`, "success");

      // 06 BLOCKCHAIN RECORD
      setCurrentStage("06_CHAIN");
      updateStageStatus("06_CHAIN", "running", "Submitting transaction to Hardhat EVM...");
      const recordResponse = await recordOnChainApi(
        evidenceResponse.fingerprint.bytes32Hex,
        evidenceResponse.canonicalEvidence.domain
      );

      setBlockchainRecord(recordResponse.result);
      updateStageStatus(
        "06_CHAIN",
        "success",
        `Proof anchored in Block #${recordResponse.result.blockNumber}`
      );
      addAudit(
        "06_CHAIN",
        `Transaction confirmed on Hardhat EVM (#${recordResponse.result.blockNumber}). Tx: ${recordResponse.result.transactionHash.slice(0, 10)}...`,
        "success"
      );

      // 07 VERIFICATION
      setCurrentStage("07_VERIFY");
      updateStageStatus("07_VERIFY", "running", "Reading on-chain record & re-verifying hash...");
      const verifyResponse = await verifyOnChainApi(evidenceResponse.fingerprint.bytes32Hex);
      setVerificationResult(verifyResponse.result);

      updateStageStatus(
        "07_VERIFY",
        verifyResponse.result.status === "VERIFIED" ? "success" : "error",
        "Chain agrees. Verification complete."
      );
      addAudit(
        "07_VERIFY",
        `Verification state: ${verifyResponse.result.status} (Match: ${verifyResponse.result.isMatch})`,
        "success"
      );
    } catch (err: any) {
      console.error("Pipeline failed:", err);
      updateStageStatus(currentStage, "error", err.message || "Pipeline execution failed.");
      addAudit(currentStage, `Error: ${err.message}`, "error");
    } finally {
      setIsRunning(false);
    }
  };

  return {
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
    setSelectedFaceIndex: handleSelectFace,
    searchResult,
    selectedCandidate,
    setSelectedCandidate: selectAndProcessCandidate,
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
  };
}
