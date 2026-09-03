import crypto from "crypto";
import { CanonicalEvidencePayload, EvidenceFingerprint } from "../../../shared/types/evidence";
import { serializeCanonicalJson } from "../evidence/normalizer";

/**
 * Generates a SHA-256 cryptographic fingerprint from canonical evidence payload or raw string.
 * Output includes standard 64-char hex string and EVM-compatible '0x' prefixed bytes32 string.
 */
export function generateEvidenceFingerprint(
  payloadOrJson: CanonicalEvidencePayload | string
): EvidenceFingerprint {
  const canonicalJson =
    typeof payloadOrJson === "string"
      ? payloadOrJson
      : serializeCanonicalJson(payloadOrJson);

  const hash = crypto.createHash("sha256");
  hash.update(canonicalJson, "utf8");
  const sha256Hex = hash.digest("hex");
  const bytes32Hex = `0x${sha256Hex}`;

  return {
    canonicalJson,
    sha256Hex,
    bytes32Hex,
    algorithm: "SHA-256",
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Computes raw SHA-256 hash string for arbitrary binary or text data
 */
export function hashSha256(data: Buffer | string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Validates if a string is a valid 32-byte (64 hex character) hash
 */
export function isValidBytes32Hash(hash: string): boolean {
  const clean = hash.startsWith("0x") ? hash.slice(2) : hash;
  return /^[0-9a-fA-F]{64}$/.test(clean);
}
