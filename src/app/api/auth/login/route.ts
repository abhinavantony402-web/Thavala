import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { setSession, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const user = db.prepare("SELECT * FROM users WHERE email=?").get(email) as { id: number; email: string; name: string; role: string; password_hash: string } | undefined;
  if (!user || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  await setSession({ id: user.id, role: user.role, email: user.email });
  return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role });
}
