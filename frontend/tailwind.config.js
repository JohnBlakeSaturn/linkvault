/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Sora"', 'sans-serif']
      },
      colors: {
        ink: '#0f172a',
        brand: {
          50: '#edf5ff',
          100: '#dcecff',
          200: '#bfd9ff',
          300: '#93c0ff',
          400: '#609eff',
          500: '#387df6',
          600: '#2662d8',
          700: '#224eb0',
          800: '#22448e',
          900: '#203d72'
        }
      },
      boxShadow: {
        panel: '0 20px 45px -25px rgba(12, 20, 28, 0.35)'
      }
    }
  },
  plugins: []
};
