import { cookies } from "next/headers";
import crypto from "node:crypto";
import { db } from "./db";

const SECRET = process.env.AUTH_SECRET || "dev-secret-change-me";
const COOKIE = "session";

export function hashPassword(pw: string) { return crypto.scryptSync(pw, "salt", 64).toString("hex"); }
export function verifyPassword(pw: string, hash: string) { return crypto.scryptSync(pw, "salt", 64).toString("hex") === hash; }

export function sign(payload: object) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verify(token: string) {
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  if (sig !== expected) return null;
  try { return JSON.parse(Buffer.from(data, "base64url").toString()); } catch { return null; }
}

export async function getSession() {
  const c = (await cookies()).get(COOKIE)?.value;
  if (!c) return null;
  return verify(c) as { userId: number; role: string; email: string } | null;
}

export async function setSession(user: { id: number; role: string; email: string }) {
  (await cookies()).set(COOKIE, sign({ userId: user.id, role: user.role, email: user.email }), {
    httpOnly: true, path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() { (await cookies()).delete(COOKIE); }

export function getUser(id: number) {
  return db.prepare("SELECT id,email,name,role FROM users WHERE id=?").get(id) as { id: number; email: string; name: string | null; role: string } | undefined;
}

export async function requireAdmin() {
  const s = await getSession();
  if (!s || s.role !== "admin") return null;
  return s;
}
