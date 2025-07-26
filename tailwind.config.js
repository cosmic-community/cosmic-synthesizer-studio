/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        synth: {
          bg: '#0f172a',
          panel: '#1e293b',
          accent: '#22d3ee',
          text: '#f8fafc',
          muted: '#64748b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Monaco', 'Cascadia Code', 'Segoe UI Mono', 'Roboto Mono', 'Oxygen Mono', 'Ubuntu Monospace', 'Source Code Pro', 'Fira Code', 'Droid Sans Mono', 'Courier New', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'bounce-subtle': 'bounce 1s ease-in-out 3',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 5px rgba(34, 211, 238, 0.5)',
          },
          '50%': {
            boxShadow: '0 0 20px rgba(34, 211, 238, 0.8)',
          },
        },
      },
      boxShadow: {
        'glow-sm': '0 0 5px rgba(34, 211, 238, 0.5)',
        'glow': '0 0 10px rgba(34, 211, 238, 0.5)',
        'glow-lg': '0 0 20px rgba(34, 211, 238, 0.5)',
        'inner-glow': 'inset 0 0 10px rgba(34, 211, 238, 0.3)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      minHeight: {
        '0': '0',
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
        'full': '100%',
        'screen': '100vh',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      scale: {
        '102': '1.02',
        '103': '1.03',
      },
      blur: {
        '2xs': '1px',
        'xs': '2px',
      },
      brightness: {
        '25': '.25',
        '175': '1.75',
      },
    },
  },
  plugins: [
    // Add custom utilities
    function({ addUtilities }) {
      const newUtilities = {
        '.text-glow': {
          textShadow: '0 0 10px rgba(34, 211, 238, 0.5)',
        },
        '.text-glow-sm': {
          textShadow: '0 0 5px rgba(34, 211, 238, 0.5)',
        },
        '.text-glow-lg': {
          textShadow: '0 0 20px rgba(34, 211, 238, 0.5)',
        },
        '.bg-mesh-gradient': {
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)',
        },
        '.glass-subtle': {
          backgroundColor: 'rgba(30, 41, 59, 0.3)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(71, 85, 105, 0.2)',
        },
        '.glass-strong': {
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(71, 85, 105, 0.4)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}