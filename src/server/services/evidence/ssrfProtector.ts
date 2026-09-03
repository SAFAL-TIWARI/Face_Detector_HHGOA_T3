import net from "net";

/**
 * Validates URLs to prevent SSRF (Server-Side Request Forgery).
 * Blocks localhost, private network ranges, loopback, and link-local addresses.
 */
export function isSafePublicUrl(rawUrl: string): { isSafe: boolean; reason?: string } {
  try {
    const parsed = new URL(rawUrl);

    // Only allow standard web protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { isSafe: false, reason: `Disallowed protocol: ${parsed.protocol}` };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Check for localhost / loopback aliases
    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname === "0.0.0.0" ||
      hostname === "127.0.0.1" ||
      hostname === "::1"
    ) {
      return { isSafe: false, reason: "Localhost addresses are forbidden." };
    }

    // Check IP addresses for private ranges
    if (net.isIP(hostname)) {
      if (isPrivateIp(hostname)) {
        return { isSafe: false, reason: `Private IP address is forbidden: ${hostname}` };
      }
    }

    // Check AWS/cloud metadata address
    if (hostname === "169.254.169.254") {
      return { isSafe: false, reason: "Cloud metadata endpoint is forbidden." };
    }

    return { isSafe: true };
  } catch (err: any) {
    return { isSafe: false, reason: `Invalid URL format: ${err.message}` };
  }
}

/**
 * Checks whether an IPv4 or IPv6 address belongs to a private / reserved range.
 */
export function isPrivateIp(ip: string): boolean {
  if (ip === "127.0.0.1" || ip === "::1" || ip === "0.0.0.0") return true;

  const parts = ip.split(".").map(Number);
  if (parts.length === 4 && parts.every((p) => !isNaN(p))) {
    // 10.0.0.0 - 10.255.255.255
    if (parts[0] === 10) return true;
    // 172.16.0.0 - 172.31.255.255
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0 - 192.168.255.255
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 169.254.0.0 - 169.254.255.255 (Link-local)
    if (parts[0] === 169 && parts[1] === 254) return true;
  }

  // IPv6 unique local (fc00::/7) or link-local (fe80::/10)
  if (ip.toLowerCase().startsWith("fc") || ip.toLowerCase().startsWith("fd") || ip.toLowerCase().startsWith("fe80")) {
    return true;
  }

  return false;
}
