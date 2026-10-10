/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

// Tailwind v4 derives every spacing utility from --spacing (0.275rem here).
// v3 uses a static scale, so replicate it: default scale x 1.1 (0.25 -> 0.275).
const spacing = Object.fromEntries(
  Object.entries(defaultTheme.spacing).map(([key, value]) => {
    const match = /^(-?[\d.]+)rem$/.exec(value)
    return [key, match ? `${parseFloat((parseFloat(match[1]) * 1.1).toFixed(4))}rem` : value]
  })
)

module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      spacing,
      colors: {
        canvas: 'var(--background)',
        surface: 'var(--card)',
        'surface-2': 'var(--muted)',
        border: 'var(--border)',
        'border-strong': 'var(--input)',
        ink: {
          DEFAULT: 'var(--foreground)',
          muted: 'var(--muted-foreground)',
          subtle:
            'color-mix(in srgb, var(--muted-foreground) 72%, transparent)',
        },
        accent: {
          DEFAULT: 'var(--primary)',
          deep: 'var(--green-text)',
          fg: 'var(--green-text)',
          tint: 'color-mix(in srgb, var(--primary) 12%, transparent)',
          line: 'color-mix(in srgb, var(--primary) 30%, transparent)',
        },
        danger: {
          DEFAULT: 'var(--destructive)',
          fg: 'var(--danger-fg)',
          tint: 'color-mix(in srgb, var(--destructive) 10%, transparent)',
        },
        tag: 'var(--muted)',
        offwhite: '#f5f4f0',
        nearblack: '#0a0a0a',
        ongreen: 'var(--primary-foreground)',
        // Full shadcn-style token set (the @theme mapping, as utilities)
        background: 'var(--background)',
        foreground: {
          DEFAULT: 'var(--foreground)',
          // Row/hover tints: v3 can't do /opacity on var() colors.
          faint: 'color-mix(in srgb, var(--foreground) 4%, transparent)',
          mist: 'color-mix(in srgb, var(--foreground) 6%, transparent)',
          wash: 'color-mix(in srgb, var(--foreground) 7%, transparent)',
          soft: 'color-mix(in srgb, var(--foreground) 8%, transparent)',
          line: 'color-mix(in srgb, var(--foreground) 25%, var(--border))',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
          // v3 cannot apply /opacity modifiers to var() colors, so the
          // translucent steps are pre-mixed tokens (bg-primary-soft etc.).
          soft: 'color-mix(in srgb, var(--primary) 15%, transparent)',
          tile: 'color-mix(in srgb, var(--primary) 14%, transparent)',
          deep: 'color-mix(in srgb, var(--primary) 18%, transparent)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
          soft: 'color-mix(in srgb, var(--muted) 60%, transparent)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
          soft: 'color-mix(in srgb, var(--destructive) 10%, transparent)',
          faint: 'color-mix(in srgb, var(--destructive) 12%, transparent)',
          tint: 'color-mix(in srgb, var(--destructive) 14%, transparent)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          soft: 'color-mix(in srgb, var(--warning) 18%, transparent)',
          ink: 'color-mix(in srgb, var(--warning) 70%, var(--foreground))',
        },
        input: 'var(--input)',
        ring: 'var(--ring)',
        chart: {
          1: 'var(--chart-1)',
          2: 'var(--chart-2)',
          3: 'var(--chart-3)',
          4: 'var(--chart-4)',
          5: 'var(--chart-5)',
        },
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
        },
        'green-text': 'var(--green-text)',
      },
      fontFamily: {
        // Inter for everything (headings included): display maps to the
        // sans stack so legacy `font-display` utilities stop emitting serif.
        display: ['var(--font-sans)'],
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        hover: 'var(--shadow-hover)',
        drawer: 'var(--shadow-drawer)',
        toast: 'var(--shadow-toast)',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease both',
        'fade-in': 'fadeIn 0.3s ease both',
        'pulse-dot': 'pulseDot 2s infinite',
      },
    },
  },
  plugins: [],
};
