/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#F5F5F0",
        "card-back": "#E6F1FB",
        "card-border": "#378ADD",
        "p1-bg": "#E6F1FB",
        "p1-border": "#378ADD",
        "p2-bg": "#FAECE7",
        "p2-border": "#D85A30",
        "text-primary": "#1A1A1A",
        "text-secondary": "#6B6B6B",
        tornado: "#534AB7",
        success: "#1D9E75",
        error: "#D85A30",
      },
    },
  },
  plugins: [],
};
