"use client";

import { CartProvider } from "../src/store/CartContext";
import { ThemeProvider } from "../src/store/ThemeContext";
import ThemeToggle from "../src/components/layout/ThemeToggle";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <CartProvider>
                {children}
                <ThemeToggle />
            </CartProvider>
        </ThemeProvider>
    );
}
