import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0B3954",
        teal: "#1B9AAA",
        ink: "#1D2A35",
        good: "#2E7D32",
        warn: "#E08A1E",
        poor: "#C0392B",
        mineLi: "#2A7DB5",
        mineRee: "#1B9AAA",
        mineAu: "#C8922A",
      },
      fontFamily: {
        sans: ["Barlow", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
