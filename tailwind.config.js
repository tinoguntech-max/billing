/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          pink:     '#FFD6E0',
          blue:     '#C8E6FF',
          mint:     '#C8F5E8',
          yellow:   '#FFF3C8',
          purple:   '#E8D5FF',
          peach:    '#FFE5CC',
          lavender: '#D8D5FF',
          sky:      '#D0F0FF',
        },
        accent: {
          pink:   '#FF7EB3',
          blue:   '#4BA3E3',
          mint:   '#2EC98A',
          yellow: '#F5C842',
          purple: '#9B6FD4',
          peach:  '#FF8C42',
        },
        dark:  '#2D2D3A',
        muted: '#8A8A9E',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      boxShadow: {
        soft:  '0 4px 20px rgba(100,100,150,0.08)',
        card:  '0 8px 32px rgba(100,100,150,0.12)',
        float: '0 16px 48px rgba(100,100,150,0.18)',
      },
    },
  },
  plugins: [],
}
