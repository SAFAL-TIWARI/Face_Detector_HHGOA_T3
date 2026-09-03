import { chromium, Browser, Page } from "playwright";
import fs from "fs";
import path from "path";
import os from "os";
import { ReverseImageSearchProvider, ReverseSearchOptions } from "./types";
import { ReverseSearchResult, SearchCandidate } from "../../../shared/types/pipeline";
import { hashSha256 } from "../hashing/hashService";
import { scoreCandidateResult } from "./resultScorer";

export class GoogleLensProvider implements ReverseImageSearchProvider {
  readonly name = "Google Lens";
  readonly description = "Genuine reverse image search using Playwright browser automation";

  private browser: Browser | null = null;

  private async getBrowser(): Promise<Browser> {
    if (!this.browser || !this.browser.isConnected()) {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          "--disable-blink-features=AutomationControlled",
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
        ],
      });
    }
    return this.browser;
  }

  public async search(
    imageBuffer: Buffer,
    mimeType: string,
    options: ReverseSearchOptions = {}
  ): Promise<ReverseSearchResult> {
    const startTime = Date.now();
    const queryImageHash = hashSha256(imageBuffer);
    const timeoutMs = options.timeoutMs || 25000;
    const candidates: SearchCandidate[] = [];

    // Save temporary image file for Playwright upload
    const extension = mimeType.includes("png") ? "png" : mimeType.includes("webp") ? "webp" : "jpg";
    const tempFilePath = path.join(os.tmpdir(), `trace-goa-${Date.now()}-${queryImageHash.slice(0, 8)}.${extension}`);
    fs.writeFileSync(tempFilePath, imageBuffer);

    let browser: Browser | null = null;
    let page: Page | null = null;
    let fallbackRequired = false;
    let searchUrl = "https://lens.google.com";

    try {
      browser = await this.getBrowser();
      const context = await browser.newContext({
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        viewport: { width: 1280, height: 800 },
        locale: "en-US",
      });

      page = await context.newPage();
      page.setDefaultTimeout(timeoutMs);

      // Navigate to Google Lens Upload
      await page.goto("https://lens.google.com/upload", { waitUntil: "domcontentloaded", timeout: 15000 });
      searchUrl = page.url();

      // Look for file input
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) {
        await fileInput.setInputFiles(tempFilePath);
        
        // Wait for search result container or navigation
        try {
          await page.waitForTimeout(2500);

          // If on google home / lens upload overlay, click search button if needed
          const searchBtn = await page.$(
            'button[type="submit"], div[role="button"][aria-label*="Search"], input[value="Search"], button:has-text("Search")'
          );
          if (searchBtn) {
            await searchBtn.click().catch(() => {});
          }

          await page.waitForNavigation({ waitUntil: "networkidle", timeout: 8000 }).catch(() => {});
          await page.waitForTimeout(2000);
          searchUrl = page.url();

          // Extract visible search result cards
          const extractedResults = await page.evaluate(() => {
            const results: { title?: string; url: string; domain?: string; snippet?: string; imageUrl?: string }[] = [];
            
            // Query result links and cards
            const linkElements = Array.from(document.querySelectorAll('a[href^="http"]'));
            const seenUrls = new Set<string>();

            for (const el of linkElements) {
              const href = el.getAttribute("href") || "";
              let hostname = "";
              try {
                hostname = new URL(href).hostname.toLowerCase();
              } catch {
                continue;
              }

              // Filter out search engine internal links
              if (
                hostname.includes("google") ||
                hostname.includes("gstatic") ||
                hostname.includes("youtube.com/about") ||
                hostname.includes("googleapis") ||
                hostname.includes("bing.com") ||
                hostname.includes("microsoft") ||
                hostname.includes("msn.com") ||
                seenUrls.has(href)
              ) {
                continue;
              }

              seenUrls.add(href);
              const rawTitle = el.textContent?.trim() || el.getAttribute("aria-label") || "";
              const img = el.querySelector("img")?.getAttribute("src") || undefined;
              const parentText = el.closest("div")?.textContent?.trim() || "";

              // Clean text from CSS/JS artifacts
              const cleanText = (t: string) => {
                if (t.includes("{") || t.includes("px;") || t.includes("var(--") || t.includes("display:")) {
                  return "";
                }
                return t.replace(/\s+/g, " ").trim();
              };

              const title = cleanText(rawTitle) || `Public Match on ${hostname}`;
              let snippet = cleanText(parentText);
              if (!snippet || snippet.length < 15) {
                snippet = `Public visual evidence match discovered on ${hostname}`;
              }

              if (href.startsWith("http")) {
                results.push({
                  title: title.slice(0, 100),
                  url: href,
                  domain: hostname.replace(/^www\./, ""),
                  snippet: snippet.slice(0, 200),
                  imageUrl: img,
                });
              }

              if (results.length >= 6) break;
            }

            return results;
          });

          if (extractedResults.length > 0) {
            extractedResults.forEach((res, idx) => {
              try {
                candidates.push(scoreCandidateResult(res, idx));
              } catch (e) {
                // Ignore SSRF-blocked candidate
              }
            });
          }
        } catch (navErr) {
          console.warn("[GoogleLensProvider] Result parsing timed out or was blocked by bot check:", navErr);
        }
      }

      if (options.saveDebugScreenshot && page) {
        const screenshotPath = path.join(os.tmpdir(), `trace-lens-debug-${Date.now()}.png`);
        await page.screenshot({ path: screenshotPath });
      }

      await context.close();
    } catch (err: any) {
      console.warn("[GoogleLensProvider] Browser automation encountered an issue:", err.message);
      fallbackRequired = true;
    } finally {
      // Clean up temporary image file
      try {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      } catch {}
    }

    if (candidates.length === 0) {
      fallbackRequired = true;
    }

    const durationMs = Date.now() - startTime;

    return {
      provider: this.name,
      searchedAt: new Date().toISOString(),
      queryImageHash,
      isAutomatedExtraction: !fallbackRequired,
      candidatesCount: candidates.length,
      candidates,
      selectedEvidence: candidates[0],
      searchUrl,
      fallbackRequired,
      durationMs,
    };
  }
}
