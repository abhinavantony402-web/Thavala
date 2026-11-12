"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CartPage() {
  type CartItem = { productId: number; name: string; price: number; image: string; qty: number };
  const [cart, setCart] = useState<CartItem[]>([]);
  useEffect(() => {
    const load = () => setCart(JSON.parse(localStorage.getItem("cart")||"[]"));
    load();
    window.addEventListener("cart:update", load);
    return () => window.removeEventListener("cart:update", load);
  }, []);
  const updateQty = (id:number, qty:number) => {
    const c = cart.map(i=> i.productId===id ? {...i, qty: Math.max(1,qty)} : i);
    setCart(c); localStorage.setItem("cart", JSON.stringify(c)); window.dispatchEvent(new Event("cart:update"));
  };
  const remove = (id:number) => {
    const c = cart.filter(i=>i.productId!==id);
    setCart(c); localStorage.setItem("cart", JSON.stringify(c)); window.dispatchEvent(new Event("cart:update"));
  };
  const total = cart.reduce((a,b)=>a+b.price*b.qty,0);
  if (cart.length===0) return (
    <div className="page-heading">
      <p className="eyebrow">Your selection</p>
      <h1 className="page-title">Your cart is empty</h1>
      <p className="page-description">There’s plenty to discover in the collection.</p>
      <div className="button-row" style={{ marginTop: 22 }}>
        <Link href="/products" className="button button-primary">Explore the collection</Link>
      </div>
    </div>
  );
  return (
    <div>
      <div className="page-heading">
        <p className="eyebrow">Your selection</p>
        <h1 className="page-title">Shopping cart</h1>
      </div>
      <div className="cart-list">
        {cart.map(i=>(
          <div key={i.productId} className="panel cart-row">
            <img src={i.image} alt={i.name} className="cart-image" />
            <div>
              <p className="product-name">{i.name}</p>
              <p className="muted-text">${(i.price/100).toFixed(2)}</p>
            </div>
            <input aria-label={`Quantity of ${i.name}`} type="number" min={1} value={i.qty} onChange={e=>updateQty(i.productId, Number(e.target.value))} className="field quantity-field" />
            <button onClick={()=>remove(i.productId)} className="text-button">Remove</button>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <span>Total <strong className="cart-total">${(total/100).toFixed(2)}</strong></span>
        <Link href="/checkout" className="button button-primary">Continue to checkout</Link>
      </div>
    </div>
  );
}
