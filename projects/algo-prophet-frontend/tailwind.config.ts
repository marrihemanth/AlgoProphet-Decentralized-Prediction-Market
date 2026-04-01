/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0A0A0A',
        surface: '#111111',
        'surface-hi': '#1A1A1A',
        border: '#222222',
        muted: '#333333',
        ghost: '#666666',
        primary: '#EAEAEA',
        cyan: '#00E5FF',
        'cyan-dim': '#00B8CC',
        pink: '#FF006E',
        'pink-dim': '#CC0058',
        green: '#00FF88',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Courier New"', 'Courier', 'monospace'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0px',
        sm: '2px',
      },
      boxShadow: {
        cyan: '0 0 12px 2px rgba(0, 229, 255, 0.2)',
        'cyan-lg': '0 0 24px 4px rgba(0, 229, 255, 0.3)',
        pink: '0 0 12px 2px rgba(255, 0, 110, 0.2)',
        'pink-lg': '0 0 24px 4px rgba(255, 0, 110, 0.3)',
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        blink: 'blink 1s step-end infinite',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
