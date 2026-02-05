import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: 'class',
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                accent: "#FBBF24", // Example accent color from original
            },
            fontFamily: {
                display: ["var(--font-montserrat)", "system-ui", "sans-serif"],
                sans: ["var(--font-montserrat)", "system-ui", "sans-serif"],
            },
            animation: {
                'marquee': 'marquee 30s linear infinite',
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-in': 'slideIn 0.3s ease-out',
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideIn: {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(0)' },
                }
            }
        },
    },
    plugins: [],
};
export default config;
