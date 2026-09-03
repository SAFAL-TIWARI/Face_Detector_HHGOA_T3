export interface CanonicalEvidencePayload {
  author?: string;
  canonicalUrl: string;
  domain: string;
  faceDistance?: number;
  faceMatchScore?: number;
  faceVerified?: boolean;
  imageUrl?: string;
  platform?: string;
  searchProvider: string;
  searchedAt: string; // Canonical ISO 8601 string
  snippet: string;
  title: string;
  url: string;
}

export interface EvidenceRecord {
  url: string;
  canonicalUrl: string;
  title: string;
  domain: string;
  imageUrl?: string;
  platform?: string;
  author?: string;
  snippet: string;
  searchProvider: string;
  searchedAt: string;
  visualSimilarityScore: number;
  evidenceConfidence: number;
  faceVerified?: boolean;
  faceMatchScore?: number;
  faceDistance?: number;
}

export interface EvidenceFingerprint {
  canonicalJson: string;
  sha256Hex: string; // 64 hex chars
  bytes32Hex: string; // 0x prefixed 64 hex chars
  algorithm: "SHA-256";
  generatedAt: string;
}

export interface BlockchainRecord {
  contractAddress: string;
  network: string;
  chainId: number;
  transactionHash: string;
  blockNumber: number;
  blockTimestamp: number;
  blockTimestampFormatted: string;
  gasUsed: string;
  sourceDomain: string;
  evidenceHash: string;
  recorderAddress: string;
  status: "confirmed" | "pending" | "failed";
}

export type VerificationState =
  | "VERIFIED"
  | "TAMPER_DETECTED"
  | "NOT_RECORDED"
  | "SEARCH_ERROR"
  | "CHAIN_ERROR"
  | "IDLE";

export interface VerificationResult {
  status: VerificationState;
  isMatch: boolean;
  isTampered: boolean;
  onChainHash: string;
  computedHash: string;
  recordedAtTimestamp?: number;
  recordedAtFormatted?: string;
  sourceDomain: string;
  recorderAddress: string;
  contractAddress: string;
  transactionHash?: string;
  blockNumber?: number;
  message: string;
  verifiedAt: string;
}

export interface TamperTestResult {
  isTampered: boolean;
  originalPayload: CanonicalEvidencePayload;
  tamperedPayload: CanonicalEvidencePayload;
  originalHash: string;
  tamperedHash: string;
  onChainHash: string;
  blockchainMatchedOriginal: boolean;
  blockchainMatchedTampered: boolean;
  explanation: string;
}
