/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
      backdropSaturate: {
        0: '0',
        50: '.5',
        100: '1',
        150: '1.5',
        180: '1.8',
        200: '2',
      },
      colors: {
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.25)',
          strong: 'rgba(255, 255, 255, 0.4)',
          border: 'rgba(255, 255, 255, 0.18)',
        },
        day1: { primary: '#ff6b9d', secondary: '#fff0f3', accent: '#ffc1e0' },
        day2: { primary: '#ff8c69', secondary: '#faf8f5', accent: '#ffd7be' },
        day3: { primary: '#8b4513', secondary: '#3d2817', accent: '#daa520' },
        day4: { primary: '#ffb4a2', secondary: '#fff5ee', accent: '#ffd7be' },
        day5: { primary: '#d4af37', secondary: '#ffffff', accent: '#f4e7c3' },
        day6: { primary: '#ff1744', secondary: '#ffc1e0', accent: '#ff6b9d' },
        day7: { primary: '#ff8c69', secondary: '#ffb4a2', accent: '#ffd7be' },
        day8: { primary: '#ff1744', secondary: '#ff4081', accent: '#f50057' },
      },
      animation: {
        'fadeIn': 'fadeIn 0.6s ease-in',
        'slideUp': 'slideUp 0.4s ease-out',
        'slideInRight': 'slideInRight 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      boxShadow: {
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
        'glass-lg': '0 12px 48px 0 rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}
