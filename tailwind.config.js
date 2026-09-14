/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#090a0f',
          900: '#0e0f18',
          850: '#131422',
          800: '#181a2c',
          750: '#1f2238',
          700: '#282b46',
          600: '#383c5e',
          500: '#4f5580',
          border: '#262940',
          hover: '#1d2035',
        },
        brand: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        purpleglow: {
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        accent: {
          orange: '#f97316',
          orangeHover: '#ea580c',
          amber: '#f59e0b',
          emerald: '#10b981',
          rose: '#f43f5e',
          cyan: '#06b6d4',
          violet: '#8b5cf6',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
