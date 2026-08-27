import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { secureToken, tokenHash } from "./security";

const COOKIE = process.env.SESSION_COOKIE_NAME || "grow_session";
const SESSION_MS = 1000 * 60 * 60 * 24 * 14;

export async function createSession(userId: string) {
  const token = secureToken();
  const expiresAt = new Date(Date.now() + SESSION_MS);
  await db.session.create({ data: { userId, tokenHash: tokenHash(token), expiresAt } });
  const store = await cookies();
  store.set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", expires: expiresAt, path: "/" });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: tokenHash(token) } });
  store.set(COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", expires: new Date(0), path: "/" });
}

export async function currentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({ where: { tokenHash: tokenHash(token) }, include: { user: { include: { profile: true } } } });
  if (!session) return null;
  if(session.expiresAt<=new Date()){await db.session.deleteMany({where:{id:session.id}});return null}
  return session.user;
}

export class AuthenticationError extends Error{constructor(){super("Authentication required.");this.name="AuthenticationError"}}
export class AuthorizationError extends Error{constructor(){super("Role not permitted.");this.name="AuthorizationError"}}
export async function requireUser(options:{api?:boolean}={}) { const user = await currentUser(); if (!user){if(options.api)throw new AuthenticationError();redirect("/login")} return user; }
export async function requireRole(roles: string[],options:{api?:boolean}={}) { const user = await requireUser(options); if (!roles.includes(user.role)){if(options.api)throw new AuthorizationError();redirect("/dashboard")} return user; }

export function isSupportedLearner(profile: { age: number | null; ageGroup: string | null } | null | undefined) {
  return Boolean(profile?.age && profile.age >= 15 && profile.age <= 18 && profile.ageGroup === "YOUTH");
}

export class OwnershipError extends Error { constructor(){super("Owned record not found.");this.name="OwnershipError"} }
export async function requireOwnership<T>(userId:string,load:(userId:string)=>Promise<T|null>){const record=await load(userId);if(!record)throw new OwnershipError();return record}
