import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json(db.prepare("SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id=c.id ORDER BY p.id DESC").all());
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { name, slug, description, price, stock, image, categoryId, featured } = await req.json();
  db.prepare("INSERT INTO products (name,slug,description,price_cents,stock,image_url,category_id,featured) VALUES (?,?,?,?,?,?,?,?)")
    .run(name, slug, description, Math.round(price*100), stock, image, categoryId, featured?1:0);
  return NextResponse.json({ ok: true });
}
