import { Router, Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { FaceService } from "../services/face/faceService";
import { SocialEvidenceProvider } from "../services/reverse-search/SocialEvidenceProvider";
import { createCanonicalEvidence, serializeCanonicalJson } from "../services/evidence/normalizer";
import { generateEvidenceFingerprint } from "../services/hashing/hashService";
import { BlockchainService } from "../services/blockchain/blockchainService";
import { VerificationPipeline } from "../services/pipeline/pipelineOrchestrator";
import { CanonicalEvidencePayload, TamperTestResult } from "../../shared/types/evidence";

const upload = multer({
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  storage: multer.memoryStorage(),
});

export const apiRouter = Router();

const faceService = new FaceService();
const reverseSearchProvider = new SocialEvidenceProvider();
const blockchainService = new BlockchainService();
const pipeline = new VerificationPipeline(reverseSearchProvider, blockchainService);

/**
 * GET /api/health
 * System health and component status check
 */
apiRouter.get("/health", async (req: Request, res: Response) => {
  const chainHealth = await blockchainService.getHealth();
  const modelsExist = fs.existsSync("./public/models/face-api") || fs.existsSync("./models/face-api");

  res.json({
    app: "ok",
    product: "TRACE // GOA",
    version: "1.0.0",
    faceModels: modelsExist ? "ready" : "pending",
    reverseSearch: "available (Multi-Source Social & Visual Matcher)",
    blockchain: chainHealth.connected ? "connected" : "disconnected",
    blockchainMode: chainHealth.mode,
    contract: chainHealth.contractDeployed ? "deployed" : "pending",
    contractAddress: chainHealth.contractAddress,
    network: chainHealth.network,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/demo/samples
 * Returns list of consented demo portraits with documentation metadata
 */
apiRouter.get("/demo/samples", (req: Request, res: Response) => {
  res.json({
    samples: [
      {
        id: "consented-photo",
        name: "Consented Tech Builder (Single Portrait)",
        fileName: "consented-photo.jpg",
        url: "/demo/consented-photo.jpg",
        description: "Frontal portrait of builder participant with direct camera focus.",
        type: "single",
        consent: "Verified / Permitted test fixture for demo",
      },
      {
        id: "consented-multi-portrait",
        name: "Hackathon Pair (Multi-Face Portrait)",
        fileName: "consented-multi-portrait.jpg",
        url: "/demo/consented-multi-portrait.jpg",
        description: "Collaborative scene with 2 detected faces for multi-face selector demo.",
        type: "multi",
        consent: "Verified / Permitted test fixture for demo",
      },
    ],
  });
});

/**
 * POST /api/analyze
 * Step 01 & 02: Image validation, Face detection, bounding box, quality heuristics, 128D descriptor
 */
apiRouter.post("/analyze", upload.single("image"), async (req: Request, res: Response, next) => {
  try {
    let buffer: Buffer;
    let fileName = "input-image.jpg";
    let mimeType = "image/jpeg";

    if (req.file) {
      buffer = req.file.buffer;
      fileName = req.file.originalname;
      mimeType = req.file.mimetype;
    } else if (req.body.demoSampleId) {
      // Load sample image from disk
      const sampleFile = req.body.demoSampleId === "consented-multi-portrait" 
        ? "consented-multi-portrait.jpg" 
        : "consented-photo.jpg";
      const samplePath = path.resolve("./demo", sampleFile);
      if (!fs.existsSync(samplePath)) {
        return res.status(404).json({ success: false, error: "Demo sample file not found." });
      }
      buffer = fs.readFileSync(samplePath);
      fileName = sampleFile;
      mimeType = "image/jpeg";
    } else if (req.body.imageBase64) {
      const base64Data = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, "");
      buffer = Buffer.from(base64Data, "base64");
      fileName = "webcam-capture.jpg";
      mimeType = "image/jpeg";
    } else {
      return res.status(400).json({ success: false, error: "No image file, base64 payload, or demoSampleId provided." });
    }

    const faceResult = await faceService.analyzeImage({ buffer, fileName, mimeType });
    res.json({ success: true, stage: "face", result: faceResult });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/search
 * Step 03: Multi-platform public social media & visual evidence search
 */
apiRouter.post("/search", upload.single("image"), async (req: Request, res: Response, next) => {
  try {
    let buffer: Buffer;
    let mimeType = "image/jpeg";
    let fileName = req.file?.originalname || "input-image.jpg";
    const sampleId = req.body.demoSampleId;
    const faceIndex = req.body.faceIndex !== undefined ? Number(req.body.faceIndex) : 0;
    const faceCount = req.body.faceCount !== undefined ? Number(req.body.faceCount) : 1;

    let faceCropBuffer: Buffer | undefined = undefined;
    const faceCropBase64 = req.body.faceCropBase64;
    if (faceCropBase64 && typeof faceCropBase64 === "string" && faceCropBase64.includes("base64,")) {
      const cleanB64 = faceCropBase64.replace(/^data:image\/\w+;base64,/, "");
      faceCropBuffer = Buffer.from(cleanB64, "base64");
    }

    if (req.file) {
      buffer = req.file.buffer;
      mimeType = req.file.mimetype;
    } else if (req.body.demoSampleId) {
      const sampleFile = req.body.demoSampleId === "consented-multi-portrait" 
        ? "consented-multi-portrait.jpg" 
        : "consented-photo.jpg";
      const samplePath = path.resolve("./demo", sampleFile);
      buffer = fs.readFileSync(samplePath);
      fileName = sampleFile;
    } else if (req.body.imageBase64) {
      const base64Data = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, "");
      buffer = Buffer.from(base64Data, "base64");
      fileName = "webcam-capture.jpg";
    } else {
      return res.status(400).json({ success: false, error: "No image provided for reverse search." });
    }

    // Persist uploaded image for visual search matching & display
    let savedImageUrl = "/demo/consented-photo.jpg";
    if (sampleId === "consented-multi-portrait") {
      savedImageUrl = "/demo/consented-multi-portrait.jpg";
    } else if (sampleId === "consented-photo") {
      savedImageUrl = "/demo/consented-photo.jpg";
    } else if (buffer) {
      try {
        const uploadDir = path.resolve("./public/demo");
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        fs.writeFileSync(path.join(uploadDir, "active-upload.jpg"), buffer);
        savedImageUrl = "/demo/active-upload.jpg";
      } catch {}
    }

    // If face crop buffer is provided, persist it for targeted visual evidence reference
    if (faceCropBuffer) {
      try {
        const uploadDir = path.resolve("./public/demo");
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        const cropFile = `active-face-crop-${faceIndex}.jpg`;
        fs.writeFileSync(path.join(uploadDir, cropFile), faceCropBuffer);
        savedImageUrl = `/demo/${cropFile}`;
      } catch {}
    }

    import("dotenv").then(d => d.config({ override: true }));
    const serpApiKey = req.body.serpApiKey || (req.headers["x-serpapi-key"] as string) || process.env.SERPAPI_KEY;

    const searchResult = await reverseSearchProvider.search(buffer, mimeType, {
      faceIndex,
      faceCount,
      sampleId,
      fileName,
      savedImageUrl,
      serpApiKey,
      faceCropBase64,
      faceCropBuffer,
    } as any);
    res.json({ success: true, stage: "search", result: searchResult, savedImageUrl });
  } catch (err: any) {
    console.error("[apiRouter /api/search error]:", err);
    res.status(500).json({ success: false, error: { message: err.message || "Search failed" } });
  }
});

/**
 * POST /api/evidence/lookup-url
 * Live OpenGraph metadata lookup for any user-provided social post or web URL
 */
apiRouter.post("/evidence/lookup-url", async (req: Request, res: Response, next) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: "URL is required for lookup." });
    }

    const candidate = await SocialEvidenceProvider.lookupUrl(url);
    res.json({ success: true, candidate });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/evidence
 * Step 04 & 05: Normalization and SHA-256 fingerprint generation
 */
apiRouter.post("/evidence", (req: Request, res: Response, next) => {
  try {
    const rawEvidence = req.body.evidence;
    if (!rawEvidence) {
      return res.status(400).json({ success: false, error: "No evidence payload provided." });
    }

    const canonicalEvidence = createCanonicalEvidence(rawEvidence);
    const canonicalJson = serializeCanonicalJson(canonicalEvidence);
    const fingerprint = generateEvidenceFingerprint(canonicalEvidence);

    res.json({
      success: true,
      stage: "hash",
      canonicalEvidence,
      canonicalJson,
      fingerprint,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/record
 * Step 06: Anchor evidence fingerprint on Hardhat EVM
 */
apiRouter.post("/record", async (req: Request, res: Response, next) => {
  try {
    const { evidenceHash, sourceDomain } = req.body;
    if (!evidenceHash) {
      return res.status(400).json({ success: false, error: "evidenceHash is required." });
    }

    const domain = sourceDomain || "public-web";
    const blockchainRecord = await blockchainService.recordEvidence(evidenceHash, domain);

    res.json({
      success: true,
      stage: "chain",
      result: blockchainRecord,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/verify
 * Step 07: Cryptographic re-verification against on-chain record
 */
apiRouter.post("/verify", async (req: Request, res: Response, next) => {
  try {
    const { evidenceHash } = req.body;
    if (!evidenceHash) {
      return res.status(400).json({ success: false, error: "evidenceHash is required." });
    }

    const verificationResult = await blockchainService.verifyEvidence(evidenceHash);

    res.json({
      success: true,
      stage: "verify",
      result: verificationResult,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/tamper/test
 * Interactive judge tamper testing endpoint
 */
apiRouter.post("/tamper/test", async (req: Request, res: Response, next) => {
  try {
    const { originalEvidence, tamperedEvidence } = req.body;
    if (!originalEvidence || !tamperedEvidence) {
      return res.status(400).json({ success: false, error: "originalEvidence and tamperedEvidence are required." });
    }

    const canonicalOriginal = createCanonicalEvidence(originalEvidence);
    const canonicalTampered = createCanonicalEvidence(tamperedEvidence);

    const originalFingerprint = generateEvidenceFingerprint(canonicalOriginal);
    const tamperedFingerprint = generateEvidenceFingerprint(canonicalTampered);

    // Query on-chain status of both
    const onChainCheckOriginal = await blockchainService.verifyEvidence(originalFingerprint.bytes32Hex);
    const onChainCheckTampered = await blockchainService.verifyEvidence(tamperedFingerprint.bytes32Hex);

    const result: TamperTestResult = {
      isTampered: originalFingerprint.bytes32Hex !== tamperedFingerprint.bytes32Hex,
      originalPayload: canonicalOriginal,
      tamperedPayload: canonicalTampered,
      originalHash: originalFingerprint.bytes32Hex,
      tamperedHash: tamperedFingerprint.bytes32Hex,
      onChainHash: onChainCheckOriginal.onChainHash,
      blockchainMatchedOriginal: onChainCheckOriginal.isMatch,
      blockchainMatchedTampered: onChainCheckTampered.isMatch,
      explanation:
        "The cryptographic fingerprint was altered because the evidence payload content changed. The immutable blockchain record only matches the original canonical fingerprint, mathematically proving unauthorized tampering.",
    };

    res.json({
      success: true,
      result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/pipeline/run
 * Unified orchestrator executing all 7 stages in one unified request
 */
apiRouter.post("/pipeline/run", upload.single("image"), async (req: Request, res: Response, next) => {
  try {
    let buffer: Buffer;
    let fileName = "consented-photo.jpg";
    let mimeType = "image/jpeg";

    if (req.file) {
      buffer = req.file.buffer;
      fileName = req.file.originalname;
      mimeType = req.file.mimetype;
    } else if (req.body.demoSampleId) {
      const sampleFile = req.body.demoSampleId === "consented-multi-portrait" 
        ? "consented-multi-portrait.jpg" 
        : "consented-photo.jpg";
      const samplePath = path.resolve("./demo", sampleFile);
      buffer = fs.readFileSync(samplePath);
      fileName = sampleFile;
    } else if (req.body.imageBase64) {
      const base64Data = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, "");
      buffer = Buffer.from(base64Data, "base64");
      fileName = "webcam-capture.jpg";
    } else {
      // Default to consented demo photo
      const samplePath = path.resolve("./demo/consented-photo.jpg");
      buffer = fs.readFileSync(samplePath);
      fileName = "consented-photo.jpg";
    }

    const pipelineResult = await pipeline.run(buffer, fileName, mimeType, {
      candidateIndex: req.body.candidateIndex ? Number(req.body.candidateIndex) : 0,
      faceIndex: req.body.faceIndex !== undefined ? Number(req.body.faceIndex) : 0,
      sampleId: req.body.demoSampleId,
    });

    res.json(pipelineResult);
  } catch (err) {
    next(err);
  }
});
