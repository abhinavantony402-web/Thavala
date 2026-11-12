"use client";
import { useState } from "react";

type WishItem = { id: number; name: string };

export default function WishlistPage() {
  const [items, setItems] = useState<WishItem[] | null>(null);

  // Read localStorage lazily during the first client render, after hydration,
  // so we avoid both SSR mismatches and setState inside effects.
  if (typeof window !== "undefined" && items === null) {
    try { setItems(JSON.parse(localStorage.getItem("wishlist") || "[]")); } catch { setItems([]); }
  }

  if (items === null) return <p className="muted-text" role="status">Loading wishlist…</p>;

  return (
    <div>
      <div className="page-heading">
        <p className="eyebrow">Saved for later</p>
        <h1 className="page-title">Your wishlist</h1>
      </div>
      {items.length === 0
        ? <p className="empty-state">Nothing saved just yet.</p>
        : <div className="admin-list">{items.map((i) => <div key={i.id} className="panel admin-row">{i.name}</div>)}</div>}
    </div>
  );
}
