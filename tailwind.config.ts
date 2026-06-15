import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#161616",
        paper: "#f8f7f3",
        graphite: "#2a2d2f",
        signal: "#0f766e",
        amberline: "#c27803",
        danger: "#b42318"
      },
      boxShadow: {
        panel: "0 1px 2px rgba(22, 22, 22, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
