import { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const requestId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  (req as any).requestId = requestId;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const url = req.originalUrl || req.url || req.path;
    
    // Skip noisy polling logs for static assets or health checks if successful
    if (url.startsWith("/assets/") || (url === "/api/health" && res.statusCode === 200)) {
      return;
    }

    if (res.statusCode >= 400) {
      console.warn(`[API] ✕ ${req.method} ${url} → ${res.statusCode} (${duration}ms)`);
    } else {
      console.log(`[API] ✓ ${req.method} ${url} → ${res.statusCode} (${duration}ms)`);
    }
  });

  next();
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const requestId = (req as any).requestId || "unknown";
  console.error(`[Error] Request ${requestId} failed:`, err.message);

  let humanMessage = "Something unexpected happened. Let's try that again.";

  if (err.message.includes("size")) {
    humanMessage = "The photo is too large. Keep it under 15MB for fast processing.";
  } else if (err.message.includes("face")) {
    humanMessage = "Mmm, no clear face there. Try a closer photo.";
  } else if (err.message.includes("SSRF") || err.message.includes("forbidden")) {
    humanMessage = "That source isn't accessible or is restricted.";
  }

  res.status(err.status || 500).json({
    success: false,
    error: {
      message: humanMessage,
      code: err.code || "INTERNAL_ERROR",
      requestId,
    },
  });
}
