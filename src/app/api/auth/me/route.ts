import { NextResponse } from "next/server";
import { getSession, getUser } from "@/lib/auth";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ user: null });
  return NextResponse.json({ user: getUser(s.userId) });
}
