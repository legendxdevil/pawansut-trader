import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#000000",
        graphite: "#0e0e0e",
        carbon: "#1d1d1f",
        steel: "#333336",
        slate: "#6e6e73",
        ash: "#86868b",
        porcelain: "#f5f5f7",
        white: "#ffffff",
        "apple-blue": "#0071e3",
        "electric-link": "#2997ff",
        "cobalt-link": "#0066cc",
        "copper-new": "#b64400",
        "optical-yellow": "#ffd500",
        error: "#ff453a",
        success: "#30d158",
        warning: "#ffd60a",
      },
      borderRadius: {
        tile: "28px",
        nav: "20px",
        input: "980px",
        pill: "9999px",
        card: "28px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      backgroundImage: {
        "section-fade": "linear-gradient(#1d1d1f, #000000 288px)",
      },
      letterSpacing: {
        tightest: "-0.01em",
      },
    },
  },
  plugins: [],
};
export default config;
