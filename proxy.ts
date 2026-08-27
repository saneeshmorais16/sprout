import { NextResponse } from "next/server";

export function proxy(request:Request) {
  const requestHeaders=new Headers(request.headers);const requestId=requestHeaders.get("x-request-id")||crypto.randomUUID();requestHeaders.set("x-request-id",requestId);
  const response = NextResponse.next({request:{headers:requestHeaders}});
  response.headers.set("X-Request-Id",requestId);
  const isDev = process.env.NODE_ENV !== "production";
  response.headers.set("Content-Security-Policy", `default-src 'self'; script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' https://api.resend.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

export const config = { matcher: "/((?!_next/static|_next/image|favicon.ico).*)" };
