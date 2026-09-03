export type PipelineStage =
  | "01_INPUT"
  | "02_FACE"
  | "03_SEARCH"
  | "04_EVIDENCE"
  | "05_HASH"
  | "06_CHAIN"
  | "07_VERIFY";

export interface StageStatus {
  stage: PipelineStage;
  label: string;
  status: "idle" | "running" | "success" | "warning" | "error";
  durationMs?: number;
  message?: string;
  timestamp?: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FaceQuality {
  score: number; // 0 - 100
  isAcceptable: boolean;
  minDimension: number;
  confidence: number;
  blurScore?: number;
  brightnessScore?: number;
  aspectRatio: number;
  feedback: string;
}

export interface DetectedFace {
  id: string;
  index: number;
  boundingBox: BoundingBox;
  confidence: number;
  descriptorLength: number; // 128
  descriptorSummary: string; // e.g. "128D Vector (Normalized L2)"
  descriptor?: number[]; // Real 128D Float32 vector values
  landmarksCount?: number;
  croppedImageBase64?: string;
  thumbnailUrl?: string;
  quality: FaceQuality;
}

export interface FaceDetectionResult {
  facesCount: number;
  faces: DetectedFace[];
  selectedFaceIndex: number;
  primaryFace?: DetectedFace;
  imageMetadata: {
    fileName: string;
    fileSizeBytes: number;
    fileSizeFormatted: string;
    mimeType: string;
    dimensions: {
      width: number;
      height: number;
    };
  };
  processingDurationMs: number;
}

export type SocialPlatform =
  | "x"
  | "twitter"
  | "github"
  | "linkedin"
  | "instagram"
  | "reddit"
  | "youtube"
  | "devpost"
  | "web"
  | "news";

export interface SearchCandidateAuthor {
  name: string;
  handle?: string;
  avatarUrl?: string;
  verified?: boolean;
  role?: string;
}

export interface SearchCandidateEngagement {
  likes?: number;
  reposts?: number;
  stars?: number;
  replies?: number;
  shares?: number;
}

export interface CandidateFaceMatch {
  hasFace: boolean;
  matchStatus: "VERIFIED_MATCH" | "MISMATCH" | "NO_FACE_IN_MEDIA";
  euclideanDistance: number; // e.g. 0.34
  similarityScore: number;   // 0 - 100%
  threshold: number;         // 0.60
  isMatch: boolean;          // true if euclideanDistance < threshold
  candidateFaceCrop?: string; // thumbnail data URL of the face found in the candidate image
  candidateDescriptor?: number[];
  queryFaceCrop?: string;
  explanation: string;
}

export interface SearchCandidate {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  imageUrl?: string;
  platform?: SocialPlatform;
  author?: SearchCandidateAuthor;
  postDate?: string;
  mediaType?: "post" | "profile" | "repository" | "article" | "showcase";
  engagement?: SearchCandidateEngagement;
  tags?: string[];
  visualSimilarityScore: number; // 0 - 100%
  pageRelevanceScore: number;    // 0 - 100%
  evidenceConfidence: number;    // 0 - 100%
  isSelected?: boolean;
  faceMatch?: CandidateFaceMatch;
}

export interface ReverseSearchResult {
  provider: string; // e.g. "Google Lens", "Synthetic Provider"
  searchedAt: string; // ISO 8601 UTC
  queryImageHash: string;
  isAutomatedExtraction: boolean;
  candidatesCount: number;
  candidates: SearchCandidate[];
  selectedEvidence?: SearchCandidate;
  searchUrl?: string; // Direct search URL for fallback
  fallbackRequired?: boolean;
  durationMs: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  stage: PipelineStage;
  action: string;
  details?: Record<string, any>;
  status: "info" | "success" | "warning" | "error";
}
