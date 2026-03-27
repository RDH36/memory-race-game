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
        background: "#FAF1F1",
        surface: "#FAF1F1",
        "surface-container": "#FFFFFF",
        "p1": "#5DA9FE",
        "p1-bg": "#E8F1FE",
        "p2": "#A2340A",
        "p2-bg": "#FAECE7",
        "text-primary": "#1A1C17",
        "text-secondary": "#474553",
        tornado: "#534AB7",
        "tornado-container": "#534AB7",
        primary: "#3B309E",
        success: "#1D9E75",
        error: "#A2340A",
      },
    },
  },
  plugins: [],
};
