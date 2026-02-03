"use client";

import { CartProvider } from "../src/store/CartContext";
import { ThemeProvider } from "../src/store/ThemeContext";
import { UserProvider } from "../src/store/UserContext";
import ThemeToggle from "../src/components/layout/ThemeToggle";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <UserProvider>
                <CartProvider>
                    {children}
                    <ThemeToggle />
                </CartProvider>
            </UserProvider>
        </ThemeProvider>
    );
}
