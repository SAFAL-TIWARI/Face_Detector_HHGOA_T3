import { ReverseImageSearchProvider, ReverseSearchOptions } from "./types";
import { ReverseSearchResult } from "../../../shared/types/pipeline";
import { hashSha256 } from "../hashing/hashService";
import { scoreCandidateResult } from "./resultScorer";

/**
 * Controlled mock provider used exclusively for deterministic offline unit tests and CI.
 */
export class MockSearchProvider implements ReverseImageSearchProvider {
  readonly name = "Mock Provider (Test Fixture)";
  readonly description = "Offline deterministic test fixture provider";

  public async search(
    imageBuffer: Buffer,
    mimeType: string,
    options: ReverseSearchOptions = {}
  ): Promise<ReverseSearchResult> {
    const startTime = Date.now();
    const queryImageHash = hashSha256(imageBuffer);

    const candidate1 = scoreCandidateResult(
      {
        title: "Goa Builder Summit 2026 Panel Talk",
        url: "https://x.com/hackerhousegoa/status/1765012345678901234",
        domain: "x.com",
        snippet: "Live keynote and technical demonstration at Hacker House Goa 2026 builder symposium.",
        imageUrl: "https://pbs.twimg.com/media/sample_thumb.jpg",
      },
      0
    );

    const candidate2 = scoreCandidateResult(
      {
        title: "HackerHouse Goa Prototype Showcase",
        url: "https://github.com/hackerhouse-goa/trace-demo-evidence",
        domain: "github.com",
        snippet: "Open source repository containing consented demonstration photographs and verification logs.",
      },
      1
    );

    return {
      provider: this.name,
      searchedAt: new Date().toISOString(),
      queryImageHash,
      isAutomatedExtraction: true,
      candidatesCount: 2,
      candidates: [candidate1, candidate2],
      selectedEvidence: candidate1,
      durationMs: Date.now() - startTime,
    };
  }
}
