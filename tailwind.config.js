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
          light: "#f5921e",
          dark: "#0a264a",
        },
        background: "#F3F4F6",
        card: "#FFFFFF",
        border: "#E5E7EB",
        "text-primary": "#111827",
        "text-secondary": "#6B7280",
        error: "#EF4444",
        success: "#10B981",
        warning: "#F59E0B",
      },
    },
  },
  plugins: [],
};
