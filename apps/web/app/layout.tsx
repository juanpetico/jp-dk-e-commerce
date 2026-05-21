import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import AppLayout from "../src/components/layout/AppLayout";
import { generateOrganizationJsonLd, generateWebSiteJsonLd } from "@/lib/jsonld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jpdk.cl'

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "JP DK Streetwear",
    template: "%s | JP DK Streetwear",
  },
  description: "Tienda de streetwear urbano. Poleras, accesorios y ropa con estilo único.",
  keywords: ["streetwear", "moda urbana", "poleras", "JP DK", "ropa", "Chile"],
  authors: [{ name: "JP DK Streetwear" }],
  creator: "JP DK Streetwear",
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: SITE_URL,
    siteName: "JP DK Streetwear",
    title: "JP DK Streetwear",
    description: "Tienda de streetwear urbano. Poleras, accesorios y ropa con estilo único.",
  },
  twitter: {
    card: "summary_large_image",
    title: "JP DK Streetwear",
    description: "Tienda de streetwear urbano. Poleras, accesorios y ropa con estilo único.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CL">
      <body className={`${montserrat.variable} font-sans`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: generateOrganizationJsonLd(SITE_URL) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: generateWebSiteJsonLd(SITE_URL) }}
        />
        <Providers>
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
