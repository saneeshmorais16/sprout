import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function secureToken(bytes = 32) { return randomBytes(bytes).toString("base64url"); }
export function tokenHash(token: string) { return createHash("sha256").update(token).digest("hex"); }
export function safeEqual(a: string, b: string) { const left = Buffer.from(a); const right = Buffer.from(b); return left.length === right.length && timingSafeEqual(left, right); }
export function requestIp(request: Request) { return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local"; }
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) { buckets.set(key, { count: 1, resetAt: now + windowMs }); return true; }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";
  try {
    const supplied = new URL(origin);
    const requestUrl = new URL(request.url);
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || requestUrl.host;
    const protocol = request.headers.get("x-forwarded-proto") || requestUrl.protocol.replace(":", "");
    return supplied.host === host && supplied.protocol === `${protocol}:`;
  } catch {
    return false;
  }
}
export function noStoreHeaders() { return { "Cache-Control": "no-store", "Content-Type": "application/json" }; }
