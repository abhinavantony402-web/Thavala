"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const router = useRouter();
  const submit = async () => {
    const cart = JSON.parse(localStorage.getItem("cart")||"[]");
    const res = await fetch("/api/orders", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ items: cart.map((i: { productId: number; qty: number })=>({productId:i.productId,quantity:i.qty})), email }) });
    const data = await res.json();
    if (!res.ok) { setMsg(data.error || "Failed"); return; }
    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("cart:update"));
    setMsg(`Order #${data.orderId} confirmed. Total $${(data.total/100).toFixed(2)}`);
    setTimeout(()=>router.push("/"), 2000);
  };
  return (
    <div className="panel form-panel">
      <p className="eyebrow">Almost yours</p>
      <h1 className="page-title">Checkout</h1>
      <div className="form-stack">
        <label className="form-label">Email address
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="field" />
        </label>
        <button onClick={submit} className="button button-primary">Place order</button>
      </div>
      {msg && <p className="form-message" role="status">{msg}</p>}
    </div>
  );
}
