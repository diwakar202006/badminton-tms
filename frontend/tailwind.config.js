/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Deep stadium-night background
        stadium: {
          950: '#080F18',
          900: '#0D1B2A',
          800: '#16283D',
          700: '#1E3450',
        },
        // Team A - court-net mint
        teamA: {
          DEFAULT: '#3DDC97',
          dim: '#1F5C43',
        },
        // Team B - warm cork coral
        teamB: {
          DEFAULT: '#FF6B4A',
          dim: '#7A3324',
        },
        // Shuttlecock yellow for live/accent states
        shuttle: {
          DEFAULT: '#FFD23F',
          dim: '#8C7222',
        },
        courtline: '#EDF2F0',
      },
      fontFamily: {
        display: ['"Oswald"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        score: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px -4px rgba(255, 210, 63, 0.35)',
      },
    },
  },
  plugins: [],
};
