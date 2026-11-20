/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        henu: {
          brand: '#6D4AFF',
          lavender: '#DCD5FF',
          surface: '#F7F7FB',
          ink: '#171329',
          50: '#F7F7FB',
          100: '#F0EEFF',
          200: '#DCD5FF',
          300: '#B9AAFF',
          400: '#9279FF',
          500: '#6D4AFF',
          600: '#5B37EB',
          700: '#4825CC',
          800: '#341B94',
          900: '#171329',
          950: '#0F0C1C',
        },
      },
    },
  },
  plugins: [],
};
