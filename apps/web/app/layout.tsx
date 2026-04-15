import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import AppLayout from "../src/components/layout/AppLayout";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "JP DK Streetwear",
  description: "Streetwear E-commerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CL">
      <body className={`${montserrat.variable} font-sans`}>
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

