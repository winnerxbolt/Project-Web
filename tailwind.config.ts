import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e0f7fa',
          100: '#b2ebf2',
          200: '#80deea',
          300: '#4dd0e1',
          400: '#26c6da',
          500: '#00bcd4',
          600: '#00acc1',
          700: '#0097a7',
          800: '#00838f',
          900: '#006064',
        },
        pool: {
          blue: '#00B4D8',
          dark: '#0077B6',
          light: '#90E0EF',
          accent: '#48CAE4',
          teal: '#06D6A0',
        },
        tropical: {
          green: '#06D6A0',
          mint: '#5FD3BC',
          lime: '#7AE582',
          yellow: '#FFE66D',
          orange: '#FF6B6B',
        },
        luxury: {
          gold: '#FFD700',
          bronze: '#CD7F32',
          silver: '#C0C0C0',
          rose: '#FFE5E5',
        },
        sand: {
          50: '#FFF9F0',
          100: '#FFF3E0',
          200: '#FFE5B4',
          300: '#FFD89B',
          400: '#FFCB82',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
        handwriting: ['Pacifico', 'cursive'],
      },
      backgroundImage: {
        'gradient-pool': 'linear-gradient(135deg, #00B4D8 0%, #0077B6 100%)',
        'gradient-tropical': 'linear-gradient(135deg, #06D6A0 0%, #FFE66D 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #FF6B6B 0%, #FFD700 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #90E0EF 0%, #00B4D8 50%, #0077B6 100%)',
        'water-texture': "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M0 0h60v60H0z\" fill=\"%2390E0EF\" fill-opacity=\"0.1\"/%3E%3Cpath d=\"M30 30c-5.5 0-10-4.5-10-10s4.5-10 10-10 10 4.5 10 10-4.5 10-10 10z\" fill=\"%2300B4D8\" fill-opacity=\"0.1\"/%3E%3C/svg%3E')",
      },
      boxShadow: {
        'pool': '0 10px 40px rgba(0, 180, 216, 0.3)',
        'pool-lg': '0 20px 60px rgba(0, 180, 216, 0.4)',
        'tropical': '0 10px 40px rgba(6, 214, 160, 0.3)',
        'sunset': '0 10px 40px rgba(255, 107, 107, 0.3)',
        'luxury': '0 10px 40px rgba(255, 215, 0, 0.3)',
        'float': '0 25px 50px -12px rgba(0, 180, 216, 0.25)',
      },
      animation: {
        'ripple': 'ripple 1.5s cubic-bezier(0, 0.2, 0.8, 1) infinite',
        'wave': 'wave 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 3s infinite',
        'gradient-border': 'gradient-border 3s ease infinite',
      },
    },
  },
  plugins: [],
}
export default config
