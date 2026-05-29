/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0d3666",
          light: "#1e40af",
          dark: "#0a264a",
        },
        accent: "#f5921e",
        background: {
          light: "#fdfdfd",
          DEFAULT: "#fdfdfd",
          dark: "#0F172A",
        },
        card: {
          light: "#FFFFFF",
          DEFAULT: "#FFFFFF",
          dark: "#1E293B",
        },
        border: {
          light: "#E5E7EB",
          DEFAULT: "#E5E7EB",
          dark: "#334155",
        },
        "text-primary": {
          light: "#111827",
          DEFAULT: "#111827",
          dark: "#F1F5F9",
        },
        "text-secondary": {
          light: "#4b5563",
          DEFAULT: "#4b5563",
          dark: "#94A3B8",
        },
        error: "#EF4444",
        success: "#10B981",
        warning: "#F59E0B",
      },
    },
  },
  plugins: [],
};
