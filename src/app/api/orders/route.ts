import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { items, email } = await req.json();
  if (!Array.isArray(items) || items.length === 0) return NextResponse.json({ error: "Empty cart" }, { status: 400 });
  const s = await getSession();
  let total = 0;
  const validated: { p: { id: number; price_cents: number }; qty: number }[] = [];
  for (const it of items) {
    const p = db.prepare("SELECT id, price_cents, stock, name FROM products WHERE id=?").get(it.productId) as { id: number; price_cents: number; stock: number; name: string } | undefined;
    if (!p || p.stock < it.quantity) return NextResponse.json({ error: `Insufficient stock for ${p?.name || it.productId}` }, { status: 400 });
    validated.push({ p, qty: it.quantity });
    total += p.price_cents * it.quantity;
  }
  const info = db.prepare("INSERT INTO orders (user_id,email,total_cents,status) VALUES (?,?,?,?)").run(s?.userId || null, email, total, "confirmed");
  const orderId = Number(info.lastInsertRowid);
  const insertItem = db.prepare("INSERT INTO order_items (order_id,product_id,quantity,price_cents) VALUES (?,?,?,?)");
  const decStock = db.prepare("UPDATE products SET stock=stock-? WHERE id=?");
  for (const v of validated) {
    insertItem.run(orderId, v.p.id, v.qty, v.p.price_cents);
    decStock.run(v.qty, v.p.id);
  }
  return NextResponse.json({ orderId, total });
}
