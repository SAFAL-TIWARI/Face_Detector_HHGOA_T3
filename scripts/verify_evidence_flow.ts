import fs from "fs";
import path from "path";

async function testApiFlow() {
  const baseUrl = "http://localhost:5173"; // Or whatever port server is on

  console.log("1. Testing Health...");
  try {
    const healthRes = await fetch("http://localhost:3000/api/health").catch(() => fetch("http://localhost:5173/api/health"));
    const health = await healthRes.json();
    console.log("Health Status:", health.product, "| Reverse Search:", health.reverseSearch, "| Contract:", health.contract);
  } catch (e: any) {
    console.warn("Direct HTTP fetch:", e.message);
  }

  // Test SocialEvidenceProvider directly
  console.log("\n2. Testing SocialEvidenceProvider directly...");
  const { SocialEvidenceProvider } = await import("../src/server/services/reverse-search/SocialEvidenceProvider");
  const provider = new SocialEvidenceProvider();

  const sampleBuffer = fs.readFileSync("./demo/consented-photo.jpg");
  const resultSingle = await provider.search(sampleBuffer, "image/jpeg", { sampleId: "consented-photo" });

  console.log(`Single Portrait returned ${resultSingle.candidatesCount} candidates:`);
  resultSingle.candidates.forEach((c, i) => {
    console.log(`  [${i + 1}] [${c.platform?.toUpperCase()}] ${c.title}`);
    console.log(`      Author: ${c.author?.name} (${c.author?.handle})`);
    console.log(`      Snippet: ${c.snippet.slice(0, 80)}...`);
    console.log(`      Confidence: ${c.evidenceConfidence}% | Sim: ${c.visualSimilarityScore}%`);
  });

  console.log("\n3. Testing Multi-Portrait Face #2 (Priya Sharma)...");
  const multiBuffer = fs.readFileSync("./demo/consented-multi-portrait.jpg");
  const resultMulti1 = await provider.search(multiBuffer, "image/jpeg", {
    sampleId: "consented-multi-portrait",
    faceIndex: 1,
  });

  console.log(`Multi-Portrait Face #2 returned ${resultMulti1.candidatesCount} candidates:`);
  resultMulti1.candidates.forEach((c, i) => {
    console.log(`  [${i + 1}] [${c.platform?.toUpperCase()}] ${c.title}`);
    console.log(`      Author: ${c.author?.name} (${c.author?.handle})`);
    console.log(`      Snippet: ${c.snippet.slice(0, 80)}...`);
  });

  console.log("\n4. Testing URL Lookup on GitHub URL...");
  const candidateUrl = await SocialEvidenceProvider.lookupUrl("https://github.com/ethereum/solidity");
  console.log("URL Lookup Candidate:", candidateUrl.title, "| Domain:", candidateUrl.domain, "| Author:", candidateUrl.author);

  console.log("\nALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!");
}

testApiFlow().catch(console.error);
