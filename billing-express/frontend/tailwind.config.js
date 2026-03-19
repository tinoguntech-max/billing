/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'pastel-purple':  '#E8D5FF',
        'pastel-blue':    '#C8E6FF',
        'pastel-mint':    '#C8F5E8',
        'pastel-yellow':  '#FFF3C8',
        'pastel-pink':    '#FFD5E8',
        'pastel-peach':   '#FFE5D0',
        'pastel-lavender':'#F0EFF8',
        'pastel-sky':     '#D0EEFF',
        'accent-purple':  '#9B6FD4',
        'accent-blue':    '#4BA3E3',
        'accent-mint':    '#2EC98A',
        'accent-yellow':  '#F5C842',
        'accent-pink':    '#E8609A',
        'accent-peach':   '#F5956A',
        'dark':           '#2D2D3A',
        'muted':          '#8B8BA0',
      },
      boxShadow: {
        soft: '0 2px 16px 0 rgba(155,111,212,0.08)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
