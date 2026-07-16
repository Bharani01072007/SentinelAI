import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#050816',
        card: '#111827',
        primary: {
          DEFAULT: '#2563EB',
          foreground: '#F9FAFB',
        },
        cyan: {
          DEFAULT: '#06B6D4',
          400: '#22D3EE',
          500: '#06B6D4',
        },
        purple: {
          DEFAULT: '#7C3AED',
          400: '#A78BFA',
          600: '#7C3AED',
        },
        success: '#10B981',
        warning: '#F59E0B',
        critical: '#EF4444',
        border: 'rgba(255,255,255,0.08)',
        muted: {
          DEFAULT: '#1F2937',
          foreground: '#94A3B8',
        },
        accent: {
          DEFAULT: '#7C3AED',
          foreground: '#F9FAFB',
        },
        foreground: '#F9FAFB',
        secondary: {
          DEFAULT: '#94A3B8',
          foreground: '#F9FAFB',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#F9FAFB',
        },
        popover: {
          DEFAULT: '#111827',
          foreground: '#F9FAFB',
        },
        input: 'rgba(255,255,255,0.08)',
        ring: '#2563EB',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': `linear-gradient(rgba(37,99,235,0.05) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(37,99,235,0.05) 1px, transparent 1px)`,
        'glow-blue': 'radial-gradient(ellipse at center, rgba(37,99,235,0.15) 0%, transparent 70%)',
        'glow-cyan': 'radial-gradient(ellipse at center, rgba(6,182,212,0.15) 0%, transparent 70%)',
        'glow-purple': 'radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, transparent 70%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'grid-scroll': 'grid-scroll 20s linear infinite',
        'ticker': 'ticker 30s linear infinite',
        'radar': 'radar 4s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(37,99,235,0.4)' },
          '100%': { boxShadow: '0 0 20px rgba(37,99,235,0.8), 0 0 40px rgba(37,99,235,0.4)' },
        },
        'grid-scroll': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 50px' },
        },
        ticker: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      boxShadow: {
        'glow-blue': '0 0 15px rgba(37,99,235,0.4)',
        'glow-cyan': '0 0 15px rgba(6,182,212,0.4)',
        'glow-purple': '0 0 15px rgba(124,58,237,0.4)',
        'glow-red': '0 0 15px rgba(239,68,68,0.4)',
        'glow-green': '0 0 15px rgba(16,185,129,0.4)',
        'glass': '0 8px 32px 0 rgba(0,0,0,0.37)',
        'card': '0 4px 24px rgba(0,0,0,0.5)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config
