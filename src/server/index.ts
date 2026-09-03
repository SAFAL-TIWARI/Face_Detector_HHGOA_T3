import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { apiRouter } from "./routes/api";
import { requestLogger, errorHandler } from "./middleware/errorHandler";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Parsing Middleware
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(requestLogger);

// Static assets (models, demo images, client build)
app.use("/models", express.static(path.resolve("./public/models")));
app.use("/demo", express.static(path.resolve("./public/demo")));
app.use(express.static(path.resolve("./dist/client")));

// Mount API routes
app.use("/api", apiRouter);

// Catch-all route for SPA client
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  const indexPath = path.resolve("./dist/client/index.html");
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  
  // If dist is not built yet, redirect to Vite dev server
  res.send(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="refresh" content="0; url=http://localhost:5173" />
        <title>TRACE // GOA — Connecting to Frontend</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
            background: #046634;
            color: #F6F0DA;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
          }
          .card {
            background: rgba(0, 0, 0, 0.4);
            border: 2px solid #F6F0DA;
            box-shadow: 6px 6px 0px #F6F0DA;
            padding: 32px;
            max-width: 540px;
            width: 100%;
            text-align: center;
          }
          h1 { font-size: 24px; margin-bottom: 12px; color: #FFE566; }
          p { margin: 12px 0; font-size: 14px; line-height: 1.6; }
          .btn {
            display: inline-block;
            margin-top: 16px;
            padding: 12px 24px;
            background: #FF0077;
            color: #fff;
            text-decoration: none;
            font-weight: bold;
            font-family: monospace;
            border: 2px solid #000;
            box-shadow: 4px 4px 0px #000;
            transition: transform 0.1s ease;
          }
          .btn:hover { background: #ff3399; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🌴 TRACE // GOA</h1>
          <p>Connecting to Application UI on Vite Dev Server (<strong>http://localhost:5173</strong>)...</p>
          <p>If not automatically redirected, click below:</p>
          <a class="btn" href="http://localhost:5173">OPEN APPLICATION UI &rarr;</a>
        </div>
      </body>
    </html>
  `);
});

// Error handling boundary
app.use(errorHandler);

app.listen(PORT, () => {
  console.log("=================================================");
  console.log("🌴 TRACE // GOA — Investigation & Verification Console");
  console.log("   Face → Evidence → Chain (Hacker House Goa 2026)");
  console.log("=================================================");
  console.log(`✓ Server running at: http://localhost:${PORT}`);
  console.log(`✓ Health endpoint:  http://localhost:${PORT}/api/health`);
  console.log(`✓ Architecture:     Hardhat EVM + Playwright + face-api`);
  console.log("=================================================");
});
