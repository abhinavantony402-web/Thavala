import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { setSession, hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password, name } = await req.json();
  if (!email || !password || password.length < 6) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const exists = db.prepare("SELECT id FROM users WHERE email=?").get(email);
  if (exists) return NextResponse.json({ error: "Email in use" }, { status: 409 });
  const hash = hashPassword(password);
  const info = db.prepare("INSERT INTO users (email,password_hash,name,role) VALUES (?,?,?,?)").run(email, hash, name || null, "customer");
  const user = { id: Number(info.lastInsertRowid), role: "customer", email };
  await setSession(user);
  return NextResponse.json({ id: user.id, email, name, role: "customer" });
}
