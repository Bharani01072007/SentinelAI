/** @type {import('tailwindcss').Config} */
export default {
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
        border: 'rgba(255,255,255,0.08)',
        foreground: '#F9FAFB',
        success: '#10B981',
        warning: '#F59E0B',
        critical: '#EF4444',
        primary: {
          DEFAULT: '#2563EB',
          foreground: '#F9FAFB',
        },
        muted: {
          DEFAULT: '#1F2937',
          foreground: '#94A3B8',
        },
        accent: {
          DEFAULT: '#7C3AED',
          foreground: '#F9FAFB',
        },
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
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'ticker': 'ticker 30s linear infinite',
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
        ticker: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
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
    },
  },
  plugins: [],
}
