import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Resend } from "resend";

export async function POST(req: Request) {
  const { items, email } = await req.json();
  if (!Array.isArray(items) || items.length === 0) return NextResponse.json({ error: "Empty cart" }, { status: 400 });
  const s = await getSession();
  let total = 0;
  const validated: { p: { id: number; price_cents: number; name: string }; qty: number }[] = [];
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

  // Send admin notification email (non-blocking — never fail the order if email fails)
  if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const itemLines = validated
        .map((v) => `<li>${v.qty} × ${v.p.name} — ₹${((v.p.price_cents * v.qty) / 100).toFixed(2)}</li>`)
        .join("");
      await resend.emails.send({
        from: "Thavala Orders <onboarding@resend.dev>",
        to: process.env.ADMIN_EMAIL,
        subject: `🛒 New Order #${orderId} — ₹${(total / 100).toFixed(2)}`,
        html: `
          <h2>New order received on Thavala!</h2>
          <p><strong>Order #${orderId}</strong></p>
          <p><strong>Customer:</strong> ${email}</p>
          <p><strong>Items:</strong></p>
          <ul>${itemLines}</ul>
          <p><strong>Total: ₹${(total / 100).toFixed(2)}</strong></p>
          <hr/>
          <p style="color:#888;font-size:12px">Thavala Store — automated order notification</p>
        `,
      });
    } catch (err) {
      console.error("Order email notification failed:", err);
    }
  }

  return NextResponse.json({ orderId, total });
}
