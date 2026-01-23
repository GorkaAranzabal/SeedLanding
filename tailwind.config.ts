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
        'exec-black': '#000000',
        'exec-carbon': '#121212',
        'exec-silver': '#E5E5E5',
        'exec-platinum': '#A0A0A0',
        'exec-blue': '#007AFF',
        'exec-green': '#44cc44', // Stronger, more saturated green
        'exec-white': '#FFFFFF',
      },
      fontFamily: {
        'space': ['Space Mono', 'monospace'],
        'rajdhani': ['Rajdhani', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin-slow 10s linear infinite',
        'liquid-shimmer': 'liquid-shimmer 2s linear infinite',
      },
      keyframes: {
        'liquid-shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
