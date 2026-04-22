import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PT. Industri Nabati Lestari FAQ",
  description: "Pusat bantuan dan informasi PT. Industri Nabati Lestari",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
