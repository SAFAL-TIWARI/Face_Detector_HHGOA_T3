import {
  FaceDetectionResult,
  ReverseSearchResult,
} from "../../shared/types/pipeline";
import {
  CanonicalEvidencePayload,
  EvidenceFingerprint,
  BlockchainRecord,
  VerificationResult,
  TamperTestResult,
} from "../../shared/types/evidence";

const API_BASE = "/api";

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchDemoSamples() {
  const res = await fetch(`${API_BASE}/demo/samples`);
  return res.json();
}

export async function analyzeImageApi(
  formData: FormData
): Promise<{ success: boolean; stage: string; result: FaceDetectionResult }> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function searchReverseApi(
  formData: FormData
): Promise<{ success: boolean; stage: string; result: ReverseSearchResult }> {
  const res = await fetch(`${API_BASE}/search`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function normalizeEvidenceApi(evidence: any): Promise<{
  success: boolean;
  canonicalEvidence: CanonicalEvidencePayload;
  canonicalJson: string;
  fingerprint: EvidenceFingerprint;
}> {
  const res = await fetch(`${API_BASE}/evidence`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ evidence }),
  });
  return res.json();
}

export async function recordOnChainApi(
  evidenceHash: string,
  sourceDomain: string
): Promise<{ success: boolean; stage: string; result: BlockchainRecord }> {
  const res = await fetch(`${API_BASE}/record`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ evidenceHash, sourceDomain }),
  });
  return res.json();
}

export async function verifyOnChainApi(
  evidenceHash: string
): Promise<{ success: boolean; stage: string; result: VerificationResult }> {
  const res = await fetch(`${API_BASE}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ evidenceHash }),
  });
  return res.json();
}

export async function runFullPipelineApi(
  formData: FormData
): Promise<any> {
  const res = await fetch(`${API_BASE}/pipeline/run`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function lookupUrlApi(url: string): Promise<{
  success: boolean;
  candidate?: any;
  error?: string;
}> {
  const res = await fetch(`${API_BASE}/evidence/lookup-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  return res.json();
}

export async function testTamperApi(
  originalEvidence: any,
  tamperedEvidence: any
): Promise<{ success: boolean; result: TamperTestResult }> {
  const res = await fetch(`${API_BASE}/tamper/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ originalEvidence, tamperedEvidence }),
  });
  return res.json();
}
