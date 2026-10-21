import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-vazirmatn-variable)", "system-ui", "sans-serif"]
      },
      colors: {
        brand: {
          50: "#eef5ff", 100: "#d9e8ff", 200: "#b9d4ff",
          500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8", 900: "#0b2a6b"
        }
      },
      borderRadius: { xl: "1rem", "2xl": "1.5rem", "3xl": "2rem" },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(16,24,40,.18)",
        glow: "0 0 0 1px rgba(59,130,246,.15), 0 20px 50px -20px rgba(59,130,246,.45)"
      },
      keyframes: {
        floaty: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        fadeUp: { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } }
      },
      animation: { floaty: "floaty 4s ease-in-out infinite", fadeUp: "fadeUp .6s ease-out both" }
    }
  },
  plugins: [require("tailwindcss-animate")]
};
export default config;