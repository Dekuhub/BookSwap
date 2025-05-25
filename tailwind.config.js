/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#FF6B00',
        'primary-dark': '#E55D00',
        'dark-bg': '#2D2D2D',
        'dark-input': '#3D3D3D',
      },
      keyframes: {
        modalFadeIn: {
          'from': {
            opacity: '0',
            transform: 'translateY(-20px)'
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        }
      },
      animation: {
        'modalFadeIn': 'modalFadeIn 0.3s ease-out'
      }
    },
  },
  plugins: [],
} 