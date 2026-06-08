/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fredoka_700Bold'],
        'display-semi': ['Fredoka_600SemiBold'],
        'display-medium': ['Fredoka_500Medium'],
        ui: ['Nunito_700Bold'],
        body: ['Nunito_400Regular'],
        'body-semi': ['Nunito_600SemiBold'],
      },
      colors: {
        background: "#EFE8F7",
        surface: "#EFE8F7",
        "surface-container": "#FFFFFF",
        "p1": "#2D9CFF",
        "p1-bg": "#E2F0FF",
        "p2": "#FF6B4D",
        "p2-bg": "#FFE7E0",
        "text-primary": "#2A2150",
        "text-secondary": "#6B6396",
        tornado: "#6C4CF1",
        "tornado-container": "#6C4CF1",
        primary: "#6C4CF1",
        success: "#1FC08A",
        error: "#FF6B4D",
        // Arcade hues
        violet: "#6C4CF1",
        "violet-d": "#4A2BC0",
        coral: "#FF6B4D",
        gold: "#FFC23C",
        ink: "#2A2150",
      },
    },
  },
  plugins: [],
};
