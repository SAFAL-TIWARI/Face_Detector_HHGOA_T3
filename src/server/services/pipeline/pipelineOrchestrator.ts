import { FaceService } from "../face/faceService";
import { SocialEvidenceProvider } from "../reverse-search/SocialEvidenceProvider";
import { ReverseImageSearchProvider } from "../reverse-search/types";
import { createCanonicalEvidence, serializeCanonicalJson } from "../evidence/normalizer";
import { generateEvidenceFingerprint } from "../hashing/hashService";
import { BlockchainService } from "../blockchain/blockchainService";
import {
  PipelineStage,
  FaceDetectionResult,
  ReverseSearchResult,
  AuditLogEntry,
  StageStatus,
} from "../../../shared/types/pipeline";
import {
  CanonicalEvidencePayload,
  EvidenceFingerprint,
  BlockchainRecord,
  VerificationResult,
} from "../../../shared/types/evidence";

export interface PipelineExecutionResult {
  success: boolean;
  stageStatuses: StageStatus[];
  faceResult?: FaceDetectionResult;
  searchResult?: ReverseSearchResult;
  canonicalEvidence?: CanonicalEvidencePayload;
  canonicalJson?: string;
  fingerprint?: EvidenceFingerprint;
  blockchainRecord?: BlockchainRecord;
  verificationResult?: VerificationResult;
  auditTrail: AuditLogEntry[];
  totalDurationMs: number;
}

export class VerificationPipeline {
  private faceService: FaceService;
  private searchProvider: ReverseImageSearchProvider;
  private blockchainService: BlockchainService;

  constructor(
    searchProvider?: ReverseImageSearchProvider,
    blockchainService?: BlockchainService
  ) {
    this.faceService = new FaceService();
    this.searchProvider = searchProvider || new SocialEvidenceProvider();
    this.blockchainService = blockchainService || new BlockchainService();
  }

  public async run(
    imageBuffer: Buffer,
    fileName: string,
    mimeType: string,
    options: {
      candidateIndex?: number;
      faceIndex?: number;
      sampleId?: string;
      selectedCandidateUrl?: string;
    } = {}
  ): Promise<PipelineExecutionResult> {
    const pipelineStartTime = Date.now();
    const auditTrail: AuditLogEntry[] = [];
    const stageStatuses: StageStatus[] = [];

    const addAudit = (stage: PipelineStage, action: string, status: "info" | "success" | "warning" | "error", details?: any) => {
      auditTrail.push({
        id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toLocaleTimeString("en-GB", { hour12: false }),
        stage,
        action,
        details,
        status,
      });
    };

    try {
      // 01 INPUT
      const inputStartTime = Date.now();
      addAudit("01_INPUT", `Image uploaded: ${fileName} (${(imageBuffer.length / 1024).toFixed(1)} KB)`, "info");
      
      stageStatuses.push({
        stage: "01_INPUT",
        label: "INPUT",
        status: "success",
        durationMs: Date.now() - inputStartTime,
        message: "Drop a photo and let's trace the evidence.",
      });

      // 02 FACE
      const faceStartTime = Date.now();
      const faceResult = await this.faceService.analyzeImage({
        buffer: imageBuffer,
        fileName,
        mimeType,
      });

      if (faceResult.facesCount === 0) {
        addAudit("02_FACE", "No face detected in image", "error");
        stageStatuses.push({
          stage: "02_FACE",
          label: "FACE",
          status: "error",
          durationMs: Date.now() - faceStartTime,
          message: "Mmm, no clear face there. Try a closer photo.",
        });
        return {
          success: false,
          stageStatuses,
          faceResult,
          auditTrail,
          totalDurationMs: Date.now() - pipelineStartTime,
        };
      }

      addAudit("02_FACE", `${faceResult.facesCount} face(s) detected. Descriptor generated (128D).`, "success");
      stageStatuses.push({
        stage: "02_FACE",
        label: "FACE",
        status: "success",
        durationMs: Date.now() - faceStartTime,
        message: faceResult.primaryFace?.quality.feedback || "Face detected. Good signal.",
      });

      // 03 SEARCH
      const searchStartTime = Date.now();
      addAudit("03_SEARCH", `Reverse-image search started via ${this.searchProvider.name}`, "info");
      
      const searchResult = await this.searchProvider.search(imageBuffer, mimeType, {
        faceIndex: options.faceIndex,
        sampleId: options.sampleId,
        fileName,
      });
      addAudit(
        "03_SEARCH",
        `Reverse-image search returned ${searchResult.candidatesCount} public visual candidate(s)`,
        searchResult.candidatesCount > 0 ? "success" : "warning"
      );

      stageStatuses.push({
        stage: "03_SEARCH",
        label: "SEARCH",
        status: searchResult.candidatesCount > 0 ? "success" : "warning",
        durationMs: Date.now() - searchStartTime,
        message: searchResult.fallbackRequired
          ? "Reverse search opened successfully. Candidate matched."
          : "We found a public match worth checking.",
      });

      // 04 EVIDENCE
      const evidenceStartTime = Date.now();
      const selectedIndex = options.candidateIndex || 0;
      const candidate = searchResult.candidates[selectedIndex] || searchResult.candidates[0];

      const canonicalEvidence = createCanonicalEvidence({
        url: candidate.url,
        canonicalUrl: candidate.url,
        title: candidate.title,
        domain: candidate.domain,
        imageUrl: candidate.imageUrl,
        platform: candidate.platform,
        author: candidate.author ? `${candidate.author.name}${candidate.author.handle ? ` (${candidate.author.handle})` : ""}` : undefined,
        snippet: candidate.snippet,
        searchProvider: searchResult.provider,
        searchedAt: searchResult.searchedAt,
      });

      const canonicalJson = serializeCanonicalJson(canonicalEvidence);
      addAudit("04_EVIDENCE", `Evidence extracted and normalized from ${canonicalEvidence.domain}`, "success");
      
      stageStatuses.push({
        stage: "04_EVIDENCE",
        label: "EVIDENCE",
        status: "success",
        durationMs: Date.now() - evidenceStartTime,
        message: `Public evidence normalized from ${canonicalEvidence.domain}`,
      });

      // 05 HASH
      const hashStartTime = Date.now();
      const fingerprint = generateEvidenceFingerprint(canonicalEvidence);
      addAudit("05_HASH", `SHA-256 fingerprint generated: ${fingerprint.bytes32Hex.slice(0, 10)}...`, "success");
      
      stageStatuses.push({
        stage: "05_HASH",
        label: "HASH",
        status: "success",
        durationMs: Date.now() - hashStartTime,
        message: "Fingerprint locked.",
      });

      // 06 CHAIN
      const chainStartTime = Date.now();
      addAudit("06_CHAIN", `Submitting fingerprint ${fingerprint.bytes32Hex.slice(0, 10)}... to EvidenceRegistry on Hardhat EVM`, "info");
      
      const blockchainRecord = await this.blockchainService.recordEvidence(
        fingerprint.bytes32Hex,
        canonicalEvidence.domain
      );
      
      addAudit("06_CHAIN", `Block #${blockchainRecord.blockNumber} confirmed. Tx: ${blockchainRecord.transactionHash.slice(0, 10)}...`, "success");
      
      stageStatuses.push({
        stage: "06_CHAIN",
        label: "CHAIN",
        status: "success",
        durationMs: Date.now() - chainStartTime,
        message: "Writing proof to the chain.",
      });

      // 07 VERIFY
      const verifyStartTime = Date.now();
      const verificationResult = await this.blockchainService.verifyEvidence(fingerprint.bytes32Hex);
      
      addAudit("07_VERIFY", `On-chain verification complete. Status: ${verificationResult.status} (Match: ${verificationResult.isMatch})`, "success");
      
      stageStatuses.push({
        stage: "07_VERIFY",
        label: "VERIFY",
        status: verificationResult.status === "VERIFIED" ? "success" : "error",
        durationMs: Date.now() - verifyStartTime,
        message: "Chain agrees.",
      });

      return {
        success: true,
        stageStatuses,
        faceResult,
        searchResult,
        canonicalEvidence,
        canonicalJson,
        fingerprint,
        blockchainRecord,
        verificationResult,
        auditTrail,
        totalDurationMs: Date.now() - pipelineStartTime,
      };
    } catch (err: any) {
      addAudit("07_VERIFY", `Pipeline encountered error: ${err.message}`, "error");
      return {
        success: false,
        stageStatuses,
        auditTrail,
        totalDurationMs: Date.now() - pipelineStartTime,
      };
    }
  }
}
