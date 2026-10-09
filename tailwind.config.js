/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
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
        foreground: 'var(--foreground)',
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
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
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
        warning: 'var(--warning)',
      },
      fontFamily: {
        display: ['var(--font-serif)'],
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
