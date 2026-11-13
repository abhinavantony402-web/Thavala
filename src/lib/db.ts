import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";

// On Render (or any host with a mounted persistent disk) set DATA_DIR to the
// mount path so the SQLite file survives deploys; falls back to ./data locally.
const DB_PATH = path.join(process.env.DATA_DIR || path.join(process.cwd(), "data"), "store.db");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new DatabaseSync(DB_PATH);

// Allow multiple Next.js build workers to share the SQLite file without
// "database is locked" errors when they each run the setup writes below.
db.exec("PRAGMA busy_timeout = 10000");
try { db.exec("PRAGMA journal_mode = WAL"); } catch {}

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL
);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL,
  details_json TEXT NOT NULL DEFAULT '[]',
  category_id INTEGER REFERENCES categories(id),
  featured INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  email TEXT NOT NULL,
  total_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_cents INTEGER NOT NULL
);
`);

const productColumns = db.prepare("PRAGMA table_info(products)").all() as { name: string }[];
if (!productColumns.some((column) => column.name === "details_json")) {
  db.exec("ALTER TABLE products ADD COLUMN details_json TEXT NOT NULL DEFAULT '[]'");
}

const cats = [
  { name: "Home", slug: "home" },
  { name: "Watches", slug: "watches" },
  { name: "Shoes", slug: "shoes" },
  { name: "T-shirts", slug: "t-shirts" },
  { name: "Gadgets", slug: "gadgets" },
];
const insertCat = db.prepare("INSERT OR IGNORE INTO categories (name, slug) VALUES (?, ?)");
for (const c of cats) insertCat.run(c.name, c.slug);

const catId = (slug: string) => {
  const category = db.prepare("SELECT id FROM categories WHERE slug=?").get(slug) as { id: number } | undefined;
  if (!category) throw new Error(`Missing product category: ${slug}`);
  return category.id;
};
const products = [
  { name: "Wireless Headphones", slug: "wireless-headphones", description: "Enjoy focused listening with comfortable over-ear headphones built for commutes, work, and downtime.", price: 12999, stock: 24, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80", category: "gadgets", featured: 1, details: [{ label: "Design", value: "Over-ear fit with padded ear cushions" }, { label: "Listening", value: "Noise-cancelling sound" }, { label: "Battery", value: "Up to 30 hours of listening" }, { label: "Connectivity", value: "Wireless Bluetooth" }] },
  { name: "Smart Watch", slug: "smart-watch", description: "Keep everyday activity and notifications close at hand with a versatile smartwatch for work and workouts.", price: 19999, stock: 12, image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80", category: "watches", featured: 1, details: [{ label: "Tracking", value: "Daily activity and fitness tracking" }, { label: "Health", value: "Heart-rate monitoring" }, { label: "Navigation", value: "Built-in GPS" }, { label: "Style", value: "Comfortable everyday wrist fit" }] },
  { name: "Classic Analog Watch", slug: "classic-analog-watch", description: "A timeless stainless-steel watch with a clean, easy-to-read dial, designed to complement both casual and dressed-up looks.", price: 15999, stock: 15, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80", category: "watches", featured: 0, details: [{ label: "Movement", value: "Classic analog display" }, { label: "Case", value: "Stainless-steel finish" }, { label: "Dial", value: "Minimal, easy-to-read face" }, { label: "Style", value: "Everyday and occasion wear" }] },
  { name: "Running Shoes", slug: "running-shoes", description: "Lightweight running shoes with a breathable upper and cushioned feel for daily training and active days.", price: 8999, stock: 40, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80", category: "shoes", featured: 0, details: [{ label: "Upper", value: "Lightweight breathable construction" }, { label: "Feel", value: "Cushioned for everyday runs" }, { label: "Use", value: "Running and active wear" }, { label: "Fit", value: "Lace-up closure" }] },
  { name: "Everyday Sneakers", slug: "everyday-sneakers", description: "Versatile, cushioned sneakers made for all-day comfort, easy styling, and everyday trips around town.", price: 7499, stock: 32, image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&auto=format&fit=crop&q=80", category: "shoes", featured: 0, details: [{ label: "Feel", value: "Soft cushioned footbed" }, { label: "Style", value: "Versatile low-profile design" }, { label: "Use", value: "Everyday casual wear" }, { label: "Fit", value: "Secure lace-up closure" }] },
  { name: "Cotton T-Shirt", slug: "cotton-tshirt", description: "A soft, unisex everyday tee made from 100% organic cotton. Easy to wear on its own or layer through the seasons.", price: 2499, stock: 100, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=80", category: "t-shirts", featured: 0, details: [{ label: "Material", value: "100% organic cotton" }, { label: "Fit", value: "Classic unisex fit" }, { label: "Feel", value: "Soft, breathable fabric" }, { label: "Care", value: "Machine wash cold with similar colors" }] },
  { name: "Relaxed Fit T-Shirt", slug: "relaxed-fit-tshirt", description: "A soft, relaxed-fit tee with an easy drape and breathable feel for laid-back everyday wear.", price: 2999, stock: 70, image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80", category: "t-shirts", featured: 0, details: [{ label: "Fit", value: "Relaxed everyday silhouette" }, { label: "Feel", value: "Soft, breathable fabric" }, { label: "Style", value: "Easy to wear or layer" }, { label: "Care", value: "Machine wash cold with similar colors" }] },
  { name: "Bluetooth Speaker", slug: "bluetooth-speaker", description: "Take your playlists anywhere with a portable wireless speaker offering rich sound, simple Bluetooth pairing, and all-day battery.", price: 6999, stock: 25, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80", category: "gadgets", featured: 0, details: [{ label: "Sound", value: "Rich, room-filling audio" }, { label: "Connectivity", value: "Wireless Bluetooth pairing" }, { label: "Portability", value: "Compact design for listening on the go" }, { label: "Battery", value: "All-day playback" }] },
  { name: "Ceramic Mug", slug: "ceramic-mug", description: "A handcrafted 350ml ceramic mug with a comfortable shape for your daily coffee, tea, or any favorite warm drink.", price: 1599, stock: 60, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&auto=format&fit=crop&q=80", category: "home", featured: 0, details: [{ label: "Material", value: "Handcrafted ceramic" }, { label: "Capacity", value: "350ml" }, { label: "Use", value: "Coffee, tea, and everyday drinks" }, { label: "Care", value: "Hand wash recommended" }] },
  { name: "Desk Lamp", slug: "desk-lamp", description: "A practical LED desk lamp with adjustable brightness to create comfortable lighting for reading, work, and winding down.", price: 4599, stock: 18, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80", category: "home", featured: 1, details: [{ label: "Light", value: "Energy-efficient LED" }, { label: "Brightness", value: "Adjustable settings" }, { label: "Use", value: "Reading, study, and desk work" }, { label: "Style", value: "Simple modern design" }] },
];
const insertProd = db.prepare("INSERT OR IGNORE INTO products (name,slug,description,price_cents,stock,image_url,category_id,featured) VALUES (?,?,?,?,?,?,?,?)");
const updatePlaceholderImage = db.prepare("UPDATE products SET image_url=? WHERE slug=? AND image_url LIKE 'https://picsum.photos/%'");
const updateProductDetails = db.prepare("UPDATE products SET description=?, details_json=? WHERE slug=? AND (details_json='[]' OR details_json IS NULL)");
const migrateLegacyCategory = db.prepare("UPDATE products SET category_id=? WHERE slug=? AND category_id IN (SELECT id FROM categories WHERE slug IN ('electronics','apparel'))");
for (const p of products) {
  const categoryId = catId(p.category);
  insertProd.run(p.name, p.slug, p.description, p.price, p.stock, p.image, categoryId, p.featured);
  updatePlaceholderImage.run(p.image, p.slug);
  updateProductDetails.run(p.description, JSON.stringify(p.details), p.slug);
  migrateLegacyCategory.run(categoryId, p.slug);
}
db.exec("DELETE FROM categories WHERE slug IN ('electronics','apparel') AND NOT EXISTS (SELECT 1 FROM products WHERE products.category_id=categories.id)");

const adminHash = crypto.scryptSync("admin123", "salt", 64).toString("hex");
const custHash = crypto.scryptSync("customer123", "salt", 64).toString("hex");
db.prepare("INSERT OR IGNORE INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)").run("admin@example.com", adminHash, "Admin", "admin");
db.prepare("INSERT OR IGNORE INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)").run("customer@example.com", custHash, "Customer", "customer");
