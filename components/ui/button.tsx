'use client';

import { forwardRef } from 'react';

type UiButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'hero';
type UiButtonSize = 'sm' | 'lg';

export interface UiButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: UiButtonVariant;
  size?: UiButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const VARIANTS: Record<UiButtonVariant, string> = {
  primary: 'bg-ink text-canvas hover:opacity-[0.82] disabled:cursor-default disabled:opacity-50',
  secondary: 'bg-surface text-ink border border-border-strong hover:bg-surface-2',
  ghost: 'bg-transparent text-ink-muted px-3 py-2 hover:text-ink hover:bg-surface-2',
  danger: 'bg-danger-tint text-danger-fg border border-danger/20 hover:bg-danger/[0.14]',
  hero: 'bg-offwhite text-nearblack hover:opacity-90',
};

const SIZES: Record<string, string> = {
  sm: 'px-3.5 py-1.5 text-[13px]',
  lg: 'px-7 py-3.5 text-[15px]',
};

/**
 * Brand-token button. Mirrors the guide API (loading / leftIcon /
 * rightIcon); spinner is inline SVG using the built-in spin animation.
 */
const Button = forwardRef<HTMLButtonElement, UiButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={[
          'inline-flex items-center gap-2 whitespace-nowrap rounded-md px-6 py-3 font-sans text-sm font-semibold transition-all duration-150',
          VARIANTS[variant],
          size ? SIZES[size] : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              opacity="0.25"
            />
            <path
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              fill="currentColor"
              opacity="0.75"
            />
          </svg>
        )}
        {!loading && leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);
Button.displayName = 'Button';

export default Button;
