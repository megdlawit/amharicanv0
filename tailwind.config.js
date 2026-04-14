/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand blue — from Amharican logo (#1565E8)
        brand: {
          50:  '#eff4fe',
          100: '#dce6fd',
          200: '#b9ccfb',
          300: '#8aaaf8',
          400: '#5580f2',
          500: '#1565E8',   // primary — exact logo blue
          600: '#0f51cb',
          700: '#0b3fa8',
          800: '#072e80',
          900: '#041d54',
        },
        // Accent gold — kept for XP/rewards
        gold: {
          50:  '#fdf8ed',
          100: '#f9edcc',
          200: '#f2d88a',
          300: '#e8c14d',
          400: '#c9a030',
          500: '#a67e22',
          600: '#825f16',
        },
        // Neutrals — cool stone
        stone: {
          50:  '#fafaf9',
          100: '#f4f4f2',
          200: '#e8e8e4',
          300: '#d4d4ce',
          400: '#a8a89e',
          500: '#78786e',
          600: '#5a5a52',
          700: '#3e3e38',
          800: '#262622',
          900: '#141410',
        },
      },
      fontFamily: {
        sans:    ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        amharic: ['"Noto Sans Ethiopic"', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'xs':     '0 1px 2px rgba(0,0,0,0.04)',
        'card':   '0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        'lifted': '0 8px 30px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
        'float':  '0 20px 60px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.08)',
        'glow':   '0 0 0 3px rgba(21,101,232,0.20)',
      },
      keyframes: {
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '20%,60%': { transform: 'translateX(-5px)' },
          '40%,80%': { transform: 'translateX(5px)' },
        },
        pop: {
          '0%':   { transform: 'scale(0.92)', opacity: '0' },
          '60%':  { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        rise: {
          '0%':   { transform: 'translateY(14px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        'ring-pulse': {
          '0%,100%': { boxShadow: '0 0 0 0px rgba(21,101,232,0.4)' },
          '50%':     { boxShadow: '0 0 0 8px rgba(21,101,232,0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-800px 0' },
          '100%': { backgroundPosition:  '800px 0' },
        },
        confetti: {
          '0%':   { transform: 'translateY(-10px) rotate(0deg)',   opacity: '1' },
          '100%': { transform: 'translateY(80px)  rotate(360deg)', opacity: '0' },
        },
        fade: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
      },
      animation: {
        'shake':      'shake 0.4s ease-in-out',
        'pop':        'pop 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        'rise':       'rise 0.4s cubic-bezier(0.16,1,0.3,1)',
        'ring-pulse': 'ring-pulse 2s ease-in-out infinite',
        'shimmer':    'shimmer 1.4s linear infinite',
        'confetti':   'confetti 1.2s ease-out forwards',
        'fade':       'fade 0.25s ease-out',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34,1.56,0.64,1)',
        'smooth': 'cubic-bezier(0.16,1,0.3,1)',
      },
    },
  },
  plugins: [],
}
