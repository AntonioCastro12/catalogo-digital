import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const siteUrl = process.env.DEPLOY_PRIME_URL ?? process.env.URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Fernanda Lara | Moda, calzado y lotes",
    template: "%s | Fernanda Lara",
  },
  description:
    "Catálogo digital de moda, calzado, lotes y ofertas. Elige tus favoritos y envía tu pedido completo por WhatsApp.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
  openGraph: {
    title: "Fernanda Lara | Moda, calzado y lotes",
    description: "Detalles que hacen especial tu estilo. Explora el catálogo y envía tu pedido por WhatsApp.",
    url: siteUrl,
    siteName: "Fernanda Lara",
    locale: "es_MX",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Fernanda Lara · Moda, Calzado y Lotes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fernanda Lara | Moda, calzado y lotes",
    description: "Detalles que hacen especial tu estilo.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={geist.variable}>{children}</body>
    </html>
  );
}
