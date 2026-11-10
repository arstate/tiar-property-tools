import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: "#FAF9F5",
          100: "#F5F3ED",
          200: "#E9E5DA",
          DEFAULT: "#FAF9F5",
        },
        ink: {
          DEFAULT: "#0F172A",
          muted: "#475569",
          subtle: "#94A3B8",
        },
        tiar: {
          emerald: {
            50: "#ECFDF5",
            100: "#D1FAE5",
            500: "#10B981",
            600: "#059669",
            700: "#047857",
            DEFAULT: "#059669",
          },
          amber: {
            50: "#FFFBEB",
            100: "#FEF3C7",
            500: "#F59E0B",
            600: "#D97706",
            700: "#B45309",
            DEFAULT: "#D97706",
          },
          navy: {
            800: "#1E293B",
            900: "#0F172A",
            DEFAULT: "#0F172A",
          },
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)",
        card: "0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.03)",
        floating: "0 20px 40px -8px rgba(15, 23, 42, 0.12), 0 8px 16px -4px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
