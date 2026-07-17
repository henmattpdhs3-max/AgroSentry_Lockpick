import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        asp: {
          bg: "var(--asp-bg)",
          primary: "var(--asp-primary)",
          accent: "var(--asp-accent)",
          grounded: "var(--asp-grounded)",
          escalate: "var(--asp-escalate)",
          reject: "var(--asp-reject)",
          ink: "var(--asp-ink)",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
