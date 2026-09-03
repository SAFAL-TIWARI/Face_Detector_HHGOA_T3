import { CanonicalEvidencePayload, EvidenceRecord } from "../../../shared/types/evidence";

/**
 * Normalizes a URL by removing tracking query parameters, standardizing protocol/casing,
 * and stripping unnecessary trailing slashes.
 */
export function normalizeUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl.trim());
    parsed.protocol = parsed.protocol.toLowerCase();
    parsed.hostname = parsed.hostname.toLowerCase();

    // Strip common tracking and session parameters
    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "fbclid",
      "gclid",
      "ref",
      "source",
      "trk",
      "igshid",
      "msclkid",
    ];

    for (const param of trackingParams) {
      parsed.searchParams.delete(param);
    }

    let normalized = parsed.toString();
    // Strip trailing slash if not the root path
    if (normalized.endsWith("/") && parsed.pathname !== "/") {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    return rawUrl.trim().toLowerCase();
  }
}

/**
 * Cleans and normalizes text string (collapses multiple whitespace, trims, standardizes quotes)
 */
export function normalizeText(text?: string): string {
  if (!text) return "";
  return text
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .trim();
}

/**
 * Extracts a clean domain hostname from a URL
 */
export function extractDomain(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    return parsed.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

/**
 * Creates a deterministic canonical representation of the evidence record.
 * All keys are strictly normalized and ordered alphabetically for deterministic hashing.
 */
export function createCanonicalEvidence(evidence: Partial<EvidenceRecord>): CanonicalEvidencePayload {
  const url = evidence.url ? normalizeUrl(evidence.url) : "";
  const canonicalUrl = evidence.canonicalUrl ? normalizeUrl(evidence.canonicalUrl) : url;
  const domain = evidence.domain ? normalizeText(evidence.domain).toLowerCase() : extractDomain(url);
  const title = normalizeText(evidence.title || "");
  const snippet = normalizeText(evidence.snippet || "");
  const searchProvider = normalizeText(evidence.searchProvider || "Google Lens");
  
  // Format searchedAt into canonical ISO 8601 UTC string
  let searchedAt: string;
  try {
    searchedAt = evidence.searchedAt ? new Date(evidence.searchedAt).toISOString() : new Date().toISOString();
  } catch {
    searchedAt = new Date().toISOString();
  }

  const imageUrl = evidence.imageUrl ? normalizeUrl(evidence.imageUrl) : undefined;
  const author = evidence.author ? normalizeText(evidence.author) : undefined;
  const platform = evidence.platform ? normalizeText(evidence.platform).toLowerCase() : undefined;

  const faceVerified = typeof evidence.faceVerified === "boolean" ? evidence.faceVerified : undefined;
  const faceMatchScore = typeof evidence.faceMatchScore === "number" ? Math.round(evidence.faceMatchScore * 10) / 10 : undefined;
  const faceDistance = typeof evidence.faceDistance === "number" ? Math.round(evidence.faceDistance * 1000) / 1000 : undefined;

  return {
    author,
    canonicalUrl,
    domain,
    faceDistance,
    faceMatchScore,
    faceVerified,
    imageUrl,
    platform,
    searchProvider,
    searchedAt,
    snippet,
    title,
    url,
  };
}

/**
 * Serializes a canonical evidence payload into a deterministic JSON string.
 * Keys are strictly ordered alphabetically.
 */
export function serializeCanonicalJson(payload: CanonicalEvidencePayload): string {
  const sortedObject: Record<string, any> = {};
  const keys = (Object.keys(payload) as (keyof CanonicalEvidencePayload)[]).sort();

  for (const key of keys) {
    const val = payload[key];
    if (val !== undefined) {
      sortedObject[key as string] = val;
    }
  }

  return JSON.stringify(sortedObject);
}
