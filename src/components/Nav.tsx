"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Nav() {
  const [user, setUser] = useState<{ role?: string; name?: string; email?: string } | null>(null);
  const [cartCount, setCartCount] = useState(0);
  useEffect(() => {
    fetch("/api/auth/me").then(r=>r.json()).then(d=>setUser(d.user));
    const update = () => {
      try { const c: { qty: number }[] = JSON.parse(localStorage.getItem("cart")||"[]"); setCartCount(c.reduce((a,b)=>a+b.qty,0)); } catch {}
    };
    update();
    window.addEventListener("cart:update", update);
    return () => window.removeEventListener("cart:update", update);
  }, []);
  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">T</span>
          <span>thavala</span>
        </Link>
        <nav className="site-nav" aria-label="Main navigation">
          <Link href="/products" className="nav-link">Shop</Link>
          <Link href="/wishlist" className="nav-link">Wishlist</Link>
          <Link href="/cart" className="nav-link">Cart<span className="nav-cart-count">{cartCount}</span></Link>
          {user?.role === "admin" && <Link href="/admin" className="nav-link">Admin</Link>}
          {user ? <span className="nav-account">{user.name || user.email}</span> : <Link href="/login" className="nav-link">Sign in</Link>}
        </nav>
      </div>
    </header>
  );
}
