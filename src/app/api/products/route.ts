import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.toLowerCase() || "";
  const category = url.searchParams.get("category");
  const sort = url.searchParams.get("sort") || "newest";
  let sql = "SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE 1=1";
  const params: (string | number)[] = [];
  if (q) { sql += " AND (LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ?)"; params.push(`%${q}%`, `%${q}%`); }
  if (category) { sql += " AND c.slug=?"; params.push(category); }
  if (sort === "price-asc") sql += " ORDER BY p.price_cents ASC";
  else if (sort === "price-desc") sql += " ORDER BY p.price_cents DESC";
  else sql += " ORDER BY p.id DESC";
  const rows = db.prepare(sql).all(...params);
  return NextResponse.json(rows);
}
