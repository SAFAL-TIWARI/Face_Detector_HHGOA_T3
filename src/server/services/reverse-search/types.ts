import { ReverseSearchResult, SearchCandidate } from "../../../shared/types/pipeline";

export interface ReverseSearchOptions {
  timeoutMs?: number;
  maxCandidates?: number;
  saveDebugScreenshot?: boolean;
  faceIndex?: number;
  faceCount?: number;
  sampleId?: string;
  fileName?: string;
  queryText?: string;
  savedImageUrl?: string;
  faceCropBase64?: string;
  faceCropBuffer?: Buffer;
  serpApiKey?: string;
}

export interface ReverseImageSearchProvider {
  readonly name: string;
  readonly description: string;
  search(imageBuffer: Buffer, mimeType: string, options?: ReverseSearchOptions): Promise<ReverseSearchResult>;
}
