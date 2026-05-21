/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,css}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: '#3D423E',
        primary: '#FF6647',
        secondary: '#9E9E9E',
        accent: '#0066FF', // new accent color for selection utilities
        textPrimary: '#F3FFF7',
        border: { DEFAULT: '#1F2937', active: '#2D3748', subtle: '#161D2E' },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['selection'],
    },
  },
  plugins: [],
}
