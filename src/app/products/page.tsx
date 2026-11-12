"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Product = { id: number; name: string; slug: string; description: string; price_cents: number; stock: number; image_url: string };
type Category = { id: number; name: string; slug: string };
type CartItem = { productId: number; qty: number; [key: string]: unknown };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories").then(r=>r.json()).then(setCategories);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    params.set("sort", sort);
    fetch(`/api/products?${params}`).then(r=>r.json()).then(d=>{ setProducts(d); setLoading(false); });
  }, [q, category, sort]);

const addToCart = (p: Product, qty: number = 1) => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart")||"[]");
    const idx = cart.findIndex((i)=>i.productId===p.id);
    if (idx>=0) cart[idx].qty += qty; else cart.push({productId:p.id,name:p.name,price:p.price_cents,image:p.image_url,qty});
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart:update"));
  };

  return (
    <div>
      <div className="page-heading">
        <p className="eyebrow">The collection</p>
        <h1 className="page-title">Find your everyday</h1>
        <p className="page-description">Browse watches, shoes, T-shirts, and gadgets made for everyday life.</p>
      </div>
      <div className="catalog-toolbar">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search the collection" aria-label="Search products" className="field catalog-search" />
        <select value={category} onChange={e=>setCategory(e.target.value)} aria-label="Filter by category" className="select-field catalog-select">
          <option value="">All categories</option>
          {categories.map(c=><option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort products" className="select-field catalog-select">
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      {loading ? <p className="muted-text" role="status">Loading products…</p> : products.length===0 ? <p className="empty-state">No products found. Try adjusting your search.</p> : (
        <div className="product-grid">
          {products.map(p=>(
            <article key={p.id} className="product-card">
              <img src={p.image_url} alt={p.name} className="product-image" />
              <div className="product-card-body">
                <h2 className="product-name">{p.name}</h2>
                <p className="product-description">{p.description}</p>
                <div className="product-meta">
                  <span className="product-price">${(p.price_cents/100).toFixed(2)}</span>
                  <span className="stock-label">{p.stock > 0 ? "In stock" : "Sold out"}</span>
                </div>
                <div className="product-actions">
                  <Link href={`/products/${p.slug}`} className="button button-secondary">Details</Link>
                  <button onClick={()=>addToCart(p)} disabled={p.stock <= 0} className="button button-cart product-cart-button">
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                      <path d="M3 4h2l2.2 10.1a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="10" cy="20" r="1.3" fill="currentColor" />
                      <circle cx="18" cy="20" r="1.3" fill="currentColor" />
                    </svg>
                    Add to cart
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
