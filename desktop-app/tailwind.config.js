// Tailwind configuration mapped from Stitch "Obsidian Command" design system.
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── Stitch Surface Layers ──
        base: '#0B1020',
        surface: {
          DEFAULT: '#121826',
          dim: '#0B1020',
          bright: '#3c3742',
          lowest: '#080C18',
          low: '#0E1422',
          mid: '#151C2A',
          high: '#1B2336',
          highest: '#212A3D',
        },
        // ── Borders ──
        border: {
          DEFAULT: '#1F2937',
          active: '#2D3748',
          subtle: '#161D2E',
        },
        // ── Primary ──
        primary: {
          DEFAULT: '#7C3AED',
          light: '#D2BBFF',
          dim: '#5A00C6',
          container: '#7C3AED',
          on: '#FFFFFF',
          'on-container': '#EDE0FF',
        },
        // ── Secondary / Accent ──
        accent: {
          DEFAULT: '#06B6D4',
          light: '#4CD7F6',
          dim: '#004E5C',
          container: '#03B5D3',
          'on-container': '#00424E',
        },
        // ── Tertiary ──
        tertiary: {
          DEFAULT: '#FFB784',
          container: '#A15100',
        },
        // ── Functional ──
        success: '#10B981',
        warning: '#F59E0B',
        error: {
          DEFAULT: '#FFB4AB',
          container: '#93000A',
        },
        // ── Text ──
        'on-surface': '#E8DFEE',
        'on-surface-variant': '#CCC3D8',
        'text-primary': '#E8DFEE',
        'text-secondary': '#958DA1',
        'text-muted': '#6B6478',
        // ── Outline ──
        outline: {
          DEFAULT: '#958DA1',
          variant: '#4A4455',
        },
        // ── Inverse ──
        'inverse-surface': '#E8DFEE',
        'inverse-on-surface': '#332F39',
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        // Stitch typography scale
        'headline-lg': ['30px', { lineHeight: '36px', fontWeight: '600', letterSpacing: '-0.02em' }],
        'headline-md': ['20px', { lineHeight: '28px', fontWeight: '600', letterSpacing: '-0.01em' }],
        'headline-sm': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'code-md': ['13px', { lineHeight: '20px', fontWeight: '450' }],
        'code-sm': ['11px', { lineHeight: '16px', fontWeight: '450' }],
        'label-caps': ['11px', { lineHeight: '16px', fontWeight: '700', letterSpacing: '0.05em' }],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '40px',
        'gutter': '16px',
        'sidebar': '240px',
      },
      borderRadius: {
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        'full': '9999px',
      },
      maxWidth: {
        'container': '1440px',
      },
      boxShadow: {
        'elevated': '0 1px 3px rgba(0, 0, 0, 0.3)',
        'float': '0 4px 16px rgba(0, 0, 0, 0.4)',
        'glow-primary': '0 0 0 2px rgba(124, 58, 237, 0.3)',
        'glow-accent': '0 0 0 2px rgba(6, 182, 212, 0.3)',
      },
      animation: {
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in': 'slideIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        skeleton: {
          '0%, 100%': { opacity: '0.05' },
          '50%': { opacity: '0.1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionDuration: {
        'fast': '100ms',
        'normal': '200ms',
        'slow': '300ms',
      },
    },
  },
  plugins: [],
};
