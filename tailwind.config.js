/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        ink: {
          DEFAULT: 'var(--text)',
          muted: 'var(--text-muted)',
          subtle: 'var(--text-subtle)',
        },
        accent: {
          DEFAULT: 'var(--green)',
          deep: 'var(--green-deep)',
          fg: 'var(--green-text)',
          tint: 'var(--green-tint)',
          line: 'var(--green-tint-border)',
        },
        danger: {
          DEFAULT: 'var(--red)',
          fg: 'var(--red-text)',
          tint: 'var(--red-tint)',
        },
        tag: 'var(--tag-bg)',
        offwhite: 'var(--off-white)',
        nearblack: 'var(--near-black)',
        ongreen: 'var(--on-green)',
        invert: {
          DEFAULT: 'var(--invert-bg)',
          fg: 'var(--invert-text)',
          muted: 'var(--invert-muted)',
          accent: 'var(--invert-accent)',
          line: 'var(--invert-border)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-sans)'],
        mono: ['ui-monospace', 'Cascadia Mono', 'Menlo', 'Consolas', 'monospace'],
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
