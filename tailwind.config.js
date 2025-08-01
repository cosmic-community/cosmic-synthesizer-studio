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
          control: '#334155',
          accent: '#22d3ee',
          info: '#3b82f6',
          warning: '#ef4444',
          text: '#f8fafc',
          muted: '#64748b',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Monaco', 'Cascadia Code', 'Segoe UI Mono', 'Roboto Mono', 'Oxygen Mono', 'Ubuntu Monospace', 'Source Code Pro', 'Fira Code', 'Droid Sans Mono', 'Courier New', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'bounce-subtle': 'bounce 1s ease-in-out 3',
        'slide-in-top': 'slide-in-top 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'tooltip-show': 'tooltip-show 0.15s ease-out',
        'recording-pulse': 'recording-pulse 2s ease-in-out infinite',
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
        'slide-in-top': {
          '0%': {
            transform: 'translateY(-10px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        'slide-in-left': {
          '0%': {
            transform: 'translateX(-10px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        'slide-in-right': {
          '0%': {
            transform: 'translateX(10px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        'fade-in': {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        'scale-in': {
          '0%': {
            transform: 'scale(0.95)',
            opacity: '0',
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
        'tooltip-show': {
          '0%': {
            transform: 'translateY(5px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        'recording-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)',
          },
          '50%': {
            boxShadow: '0 0 0 10px rgba(239, 68, 68, 0)',
          },
        },
      },
      boxShadow: {
        'glow-sm': '0 0 5px rgba(34, 211, 238, 0.5)',
        'glow': '0 0 10px rgba(34, 211, 238, 0.5)',
        'glow-lg': '0 0 20px rgba(34, 211, 238, 0.5)',
        'inner-glow': 'inset 0 0 10px rgba(34, 211, 238, 0.3)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        'glass-lg': '0 16px 64px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.15)',
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
        'dvh': '100dvh',
      },
      maxHeight: {
        'screen': '100vh',
        'dvh': '100dvh',
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
        'width': 'width',
        'colors': 'color, background-color, border-color',
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
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
    },
  },
  plugins: [
    // Add custom utilities
    function({ addUtilities, addComponents, theme }) {
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
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        },
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': 'rgba(107, 114, 128, 0.5) transparent',
        },
      }

      const newComponents = {
        '.btn-primary': {
          '@apply bg-gradient-to-r from-synth-accent to-synth-info hover:from-cyan-400 hover:to-blue-500 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none': {},
        },
        '.btn-secondary': {
          '@apply bg-synth-control hover:bg-slate-600 text-slate-200 font-medium px-4 py-2 rounded-lg transition-all duration-200 border border-slate-600 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed': {},
        },
        '.btn-ghost': {
          '@apply bg-transparent hover:bg-synth-control/50 text-gray-400 hover:text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed': {},
        },
        '.input-field': {
          '@apply bg-synth-control border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-synth-accent/50 focus:border-synth-accent transition-all': {},
        },
        '.glass-panel': {
          backgroundColor: 'rgba(20, 20, 20, 0.75)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.12)',
        },
        '.glass-control': {
          backgroundColor: 'rgba(30, 30, 30, 0.8)',
          backdropFilter: 'blur(18px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 6px 24px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.08)',
        },
        '.glass-toolbar': {
          backgroundColor: 'rgba(15, 15, 15, 0.9)',
          backdropFilter: 'blur(32px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        },
        '.glass-button': {
          backgroundColor: 'rgba(40, 40, 40, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
          '@apply transition-all duration-200': {},
          '&:hover': {
            backgroundColor: 'rgba(50, 50, 50, 0.8)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
            transform: 'translateY(-1px)',
          },
        },
        '.glass-button-accent': {
          backgroundColor: 'rgba(34, 211, 238, 0.15)',
          borderColor: 'rgba(34, 211, 238, 0.3)',
          boxShadow: '0 4px 16px rgba(34, 211, 238, 0.2), inset 0 1px 1px rgba(34, 211, 238, 0.1)',
          '&:hover': {
            backgroundColor: 'rgba(34, 211, 238, 0.25)',
            borderColor: 'rgba(34, 211, 238, 0.4)',
            boxShadow: '0 6px 24px rgba(34, 211, 238, 0.3), inset 0 1px 1px rgba(34, 211, 238, 0.15)',
          },
        },
      }

      addUtilities(newUtilities)
      addComponents(newComponents)
    }
  ],
}