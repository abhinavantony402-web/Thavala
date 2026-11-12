"use client";
import { useEffect, useState } from "react";

export default function AdminPage() {
  type AdminProduct = { id: number; name: string; price_cents: number; stock: number };
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [form, setForm] = useState({ name:"", slug:"", description:"", price:"", stock:"", image:"", categoryId:"1", featured:false });
  const load = () => fetch("/api/admin/products").then(r=>r.json()).then(setProducts).catch(()=>setProducts([]));
  useEffect(()=>{ load(); }, []);
  const add = async () => {
    await fetch("/api/admin/products", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({...form, price:Number(form.price), stock:Number(form.stock), categoryId:Number(form.categoryId)}) });
    setForm({ name:"", slug:"", description:"", price:"", stock:"", image:"", categoryId:"1", featured:false });
    load();
  };
  const del = async (id:number) => { await fetch(`/api/admin/products/${id}`, {method:"DELETE"}); load(); };
  return (
    <div>
      <div className="page-heading">
        <p className="eyebrow">Store management</p>
        <h1 className="page-title">Products</h1>
        <p className="page-description">Add and manage items in your collection.</p>
      </div>
      <div className="panel admin-form">
        {["name","slug","description","price","stock","image"].map(k=>(
          <input key={k} value={String(form[k as keyof typeof form])} onChange={e=>setForm({...form,[k]:e.target.value} as typeof form)} placeholder={k} aria-label={k} className="field" />
        ))}
        <button onClick={add} className="button button-primary">Add product</button>
      </div>
      <div className="admin-list">
        {products.map(p=>(
          <div key={p.id} className="panel admin-row">
            <span>{p.name} <span className="muted-text">— ${(p.price_cents/100).toFixed(2)} · stock {p.stock}</span></span>
            <button onClick={()=>del(p.id)} className="danger-button">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
