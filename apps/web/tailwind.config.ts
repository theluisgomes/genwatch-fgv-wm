import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0e1520",
        foreground: "#eeeae0",
        muted: "#6a7888",
        accent: "#3ecfaa",
        generation: {
          alfa: "#c4b5fd",
          z: "#3ecfaa",
          millennial: "#fcd34d",
          x: "#f9a8d4",
          boomer: "#fca5a5",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        display: ['"Google Sans Variable"', '"Google Sans"', "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
