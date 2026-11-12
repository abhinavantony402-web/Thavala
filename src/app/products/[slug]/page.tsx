"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type ProductDetailData = {
  id: number;
  name: string;
  price_cents: number;
  description: string;
  image_url: string;
  category_name: string;
  stock: number;
  details_json: string;
};

type CartItem = {
  productId: number;
  name: string;
  price: number;
  image: string;
  qty: number;
};

export default function ProductDetail() {
  const { slug } = useParams() as { slug: string };
  const [p, setP] = useState<ProductDetailData | null>(null);
  const [err, setErr] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  useEffect(() => {
    fetch(`/api/products/${slug}`).then(r=>{ if(!r.ok) throw new Error("Not found"); return r.json() as Promise<ProductDetailData>; }).then(setP).catch(e=>setErr(e.message));
  }, [slug]);
  if (err) return <p className="empty-state">{err}</p>;
  if (!p) return <p className="muted-text" role="status">Loading product…</p>;
  const details = JSON.parse(p.details_json || "[]") as { label: string; value: string }[];
  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart")||"[]") as CartItem[];
    const idx = cart.findIndex((i)=>i.productId===p.id);
    if (idx>=0) cart[idx].qty+=1; else cart.push({productId:p.id,name:p.name,price:p.price_cents,image:p.image_url,qty:1});
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart:update"));
    setCartMessage(`${p.name} added to your cart.`);
  };
  return (
    <div className="detail-layout">
      <img src={p.image_url} alt={p.name} className="detail-image" />
      <div className="detail-info">
        <p className="eyebrow">{p.category_name}</p>
        <h1 className="page-title">{p.name}</h1>
        <p className="detail-price">${(p.price_cents/100).toFixed(2)}</p>
        <p className="detail-description">{p.description}</p>
        {details.length > 0 && (
          <section className="detail-specs" aria-labelledby="product-details-heading">
            <h2 id="product-details-heading">Product details</h2>
            <dl>
              {details.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
        <p className="stock-label">{p.stock > 0 ? `${p.stock} available` : "Currently out of stock"}</p>
        <div className="button-row" style={{ marginTop: 20 }}>
          <button disabled={p.stock<=0} onClick={addToCart} className="button button-cart">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <path d="M3 4h2l2.2 10.1a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="10" cy="20" r="1.3" fill="currentColor" />
              <circle cx="18" cy="20" r="1.3" fill="currentColor" />
            </svg>
            Add to cart
          </button>
        </div>
        {cartMessage && (
          <p className="cart-feedback" role="status">
            <span>{cartMessage}</span>
            <Link href="/cart" className="cart-feedback-link">View cart →</Link>
          </p>
        )}
      </div>
    </div>
  );
}
