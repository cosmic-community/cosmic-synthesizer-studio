/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'cosmic-dark': '#11171A',
        'cosmic-dark-hover': '#1a2326',
        'synth-bg': '#0a0a0a',
        'synth-panel': '#1a1a1a',
        'synth-control': '#2a2a2a',
        'synth-accent': '#00ff88',
        'synth-warning': '#ff6b6b',
        'synth-info': '#4dabf7',
        // Professional studio colors
        'studio-black': '#0a0a0a',
        'studio-dark': '#151515',
        'studio-panel': '#1e1e1e',
        'studio-control': '#2a2a2a',
        'studio-surface': '#353535',
        'studio-cyan': '#00d4ff',
        'studio-green': '#00ff88',
        'studio-orange': '#ff8c00',
        'studio-red': '#ff4757',
        'studio-purple': '#a55eea',
        'studio-yellow': '#feca57',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-synth': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-synth': 'bounce 1s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'studio-shimmer': 'studio-shimmer 3s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { 
            boxShadow: '0 0 5px #00ff88, 0 0 10px #00ff88, 0 0 15px #00ff88',
          },
          '100%': { 
            boxShadow: '0 0 10px #00ff88, 0 0 20px #00ff88, 0 0 30px #00ff88',
          },
        },
        'studio-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
};