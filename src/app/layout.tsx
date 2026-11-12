import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = { title: "Thavala Store", description: "Premium e-commerce" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="page-shell">{children}</main>
      </body>
    </html>
  );
}
