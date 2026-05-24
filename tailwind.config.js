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
        background: "#fdfdfd",
        card: "#FFFFFF",
        border: "#E5E7EB",
        "text-primary": "#111827",
        "text-secondary": "#4b5563",
        error: "#EF4444",
        success: "#10B981",
        warning: "#F59E0B",
      },
    },
  },
  plugins: [],
};
