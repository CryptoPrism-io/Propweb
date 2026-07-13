/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        moontint: '#F3F6FF',
        blueharbor: '#3770BF',
        iceblue: '#8DC2FF',
        limeglow: '#C3EA4F',
        graphite: '#1B1E23',
        coolgrey: '#5B6470',
        line: '#DDE3EE',
        amber: '#E8A13D',
        mutedred: '#E5533D',
      },
      borderRadius: { card: '16px' },
      boxShadow: { card: '0 2px 12px rgba(27,30,35,0.08)' },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
