import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
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
      url: origin,
      siteName: "Fernanda Lara",
      locale: "es_MX",
      type: "website",
      images: [{ url: `${origin}/og.png`, width: 1200, height: 630, alt: "Fernanda Lara · Moda, Calzado y Lotes" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Fernanda Lara | Moda, calzado y lotes",
      description: "Detalles que hacen especial tu estilo.",
      images: [`${origin}/og.png`],
    },
  };
}

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
