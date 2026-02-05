import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "../src/components/layout/Navbar";
import Footer from "../src/components/layout/Footer";
import CartDrawer from "../src/components/layout/CartDrawer";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
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
    <html lang="en">
      <body className={`${montserrat.variable} font-sans`}>
        <Providers>
          <Navbar />
          <CartDrawer />
          <main className="min-h-screen pt-[80px]">
            {children}
          </main>
          <Toaster richColors position="top-center" />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

