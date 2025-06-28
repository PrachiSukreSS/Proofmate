/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary and Accent aliases
        'primary': {
          50: '#f5f0ff',
          100: '#ebe1ff',
          200: '#d7c3ff',
          300: '#c3a5ff',
          400: '#af87ff',
          500: '#9B69FF',
          600: '#9747FF',
          700: '#7c38cc',
          800: '#612999',
          900: '#461a66',
          950: '#2b0d33'
        },
        'accent': {
          50: '#f0fffe',
          100: '#ccfffe',
          200: '#99fffd',
          300: '#66fffc',
          400: '#33fffb',
          500: '#00F4E3',
          600: '#00c7b8',
          700: '#009a8d',
          800: '#006d62',
          900: '#004037',
          950: '#00201b'
        },
        // Deep Space Theme
        'deep-space': {
          50: '#f0f0f7',
          100: '#e1e1ef',
          200: '#c3c3df',
          300: '#a5a5cf',
          400: '#8787bf',
          500: '#6969af',
          600: '#4b4b9f',
          700: '#3a3a7a',
          800: '#2d2d5a',
          900: '#1B1B3A',
          950: '#0f0f1f'
        },
        // Electric Teal
        'electric-teal': {
          50: '#f0fffe',
          100: '#ccfffe',
          200: '#99fffd',
          300: '#66fffc',
          400: '#33fffb',
          500: '#00F4E3',
          600: '#00c7b8',
          700: '#009a8d',
          800: '#006d62',
          900: '#004037',
          950: '#00201b'
        },
        // Cosmic Purple
        'cosmic-purple': {
          50: '#f5f0ff',
          100: '#ebe1ff',
          200: '#d7c3ff',
          300: '#c3a5ff',
          400: '#af87ff',
          500: '#9B69FF',
          600: '#9747FF',
          700: '#7c38cc',
          800: '#612999',
          900: '#461a66',
          950: '#2b0d33'
        },
        // Nebula Pink
        'nebula-pink': {
          50: '#fff0f5',
          100: '#ffe1eb',
          200: '#ffc3d7',
          300: '#ffa5c3',
          400: '#ff87af',
          500: '#FF6B9C',
          600: '#ff4d88',
          700: '#cc3a6a',
          800: '#99294c',
          900: '#66182e',
          950: '#330c17'
        },
        // Stellar Gold
        'stellar-gold': {
          50: '#fffef0',
          100: '#fffde1',
          200: '#fffbc3',
          300: '#fff9a5',
          400: '#fff787',
          500: '#FFD700',
          600: '#e6c200',
          700: '#b39600',
          800: '#806b00',
          900: '#4d4000',
          950: '#1a1500'
        },
        // Stardust White
        'stardust': {
          50: '#F8F9FC',
          100: '#f1f3f6',
          200: '#e3e7ed',
          300: '#d5dbe4',
          400: '#c7cfdb',
          500: '#b9c3d2',
          600: '#9ba7b8',
          700: '#7d8b9e',
          800: '#5f6f84',
          900: '#41536a',
          950: '#233750'
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'parallax': 'parallax 20s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 244, 227, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 244, 227, 0.8)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        parallax: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'cosmic-gradient': 'linear-gradient(135deg, #1B1B3A 0%, #9747FF 25%, #00F4E3 50%, #FF6B9C 75%, #FFD700 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'neumorphic': '20px 20px 60px #bebebe, -20px -20px 60px #ffffff',
        'neumorphic-dark': '20px 20px 60px #0a0a0a, -20px -20px 60px #2a2a2a',
        'glow-sm': '0 0 10px rgba(151, 71, 255, 0.3)',
        'glow-md': '0 0 20px rgba(151, 71, 255, 0.4)',
        'glow-lg': '0 0 30px rgba(151, 71, 255, 0.5)',
      },
      perspective: {
        '100': '100px',
        '200': '200px',
        '300': '300px',
        '500': '500px',
        '1000': '1000px',
      },
      transformStyle: {
        'preserve-3d': 'preserve-3d',
      },
      screens: {
        'xs': '320px',
        '3xl': '1920px',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.perspective-100': {
          perspective: '100px',
        },
        '.perspective-200': {
          perspective: '200px',
        },
        '.perspective-300': {
          perspective: '300px',
        },
        '.preserve-3d': {
          transformStyle: 'preserve-3d',
        },
        '.backface-hidden': {
          backfaceVisibility: 'hidden',
        },
        '.glassmorphic': {
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glassmorphic-dark': {
          background: 'rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.neumorphic': {
          background: '#f0f0f0',
          boxShadow: '20px 20px 60px #bebebe, -20px -20px 60px #ffffff',
        },
        '.neumorphic-dark': {
          background: '#1a1a1a',
          boxShadow: '20px 20px 60px #0a0a0a, -20px -20px 60px #2a2a2a',
        },
        '.text-gradient': {
          background: 'linear-gradient(135deg, #9747FF, #00F4E3)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.bg-cosmic': {
          background: 'linear-gradient(135deg, #1B1B3A 0%, #9747FF 25%, #00F4E3 50%, #FF6B9C 75%, #FFD700 100%)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
};