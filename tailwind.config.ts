import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        rosa: '#D4829A',
        blush: '#F2C4CE',
        fundo: '#FDFAF8',
        dourado: '#C9A96E',
        texto: '#1A1A1A',
      },
      fontFamily: {
        title: ['"Tan Pearl"', 'serif'],
        subtitle: ['Barlow', 'sans-serif'],
        body: ['"Open Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
