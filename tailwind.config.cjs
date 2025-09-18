/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./index.html', './src/**/*.{svelte,ts,js}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        quote: ['"Merriweather"', 'serif'],
        body: ['"Poppins"', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: 'rgba(15, 23, 42, 0.88)',
        },
      },
    },
  },
  plugins: [],
};

module.exports = config;
