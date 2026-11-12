import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  db.prepare("DELETE FROM products WHERE id=?").run(id);
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const { stock } = await req.json();
  db.prepare("UPDATE products SET stock=? WHERE id=?").run(stock, id);
  return NextResponse.json({ ok: true });
}
