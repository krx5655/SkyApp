/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // macOS-inspired colors
        'macos-bg': '#1e1e1e',
        'macos-bg-light': '#f5f5f7',
        'macos-card': '#2c2c2e',
        'macos-card-light': '#ffffff',
        'macos-border': '#38383a',
        'macos-border-light': '#d2d2d7',
        'macos-text': '#f5f5f7',
        'macos-text-light': '#1d1d1f',
        'macos-text-secondary': '#98989d',
        'macos-text-secondary-light': '#86868b',
        'macos-blue': '#0a84ff',
        'macos-blue-light': '#007aff',
        'macos-blue-muted': '#5a8fca',
        'macos-blue-muted-light': '#4a7fba',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'macos': '12px',
        'macos-lg': '20px',
      },
    },
  },
  plugins: [],
}
