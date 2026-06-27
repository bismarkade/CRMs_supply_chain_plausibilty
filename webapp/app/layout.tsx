import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRM Supply-Chain Plausibility",
  description:
    "Geospatial verification of critical raw-material supply chains — Lithium, Rare Earths, Gold.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
