'use client';

import { forwardRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { EyeIcon, EyeOffIcon } from '@hugeicons/core-free-icons';

export interface UiInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean;
  /** Show show/hide toggle for password fields. Defaults to true for type="password". */
  passwordToggle?: boolean;
}

const INPUT_BASE =
  'w-full rounded-md border border-border-strong bg-surface-2 px-4 py-3 font-sans text-sm text-ink outline-none transition-all placeholder:text-ink-subtle focus:border-ink focus:shadow-[0_0_0_3px_var(--green-tint)] disabled:cursor-not-allowed disabled:opacity-50';

/**
 * Brand-token input with optional side icons and a password toggle.
 * Error styling uses the danger tokens.
 */
const Input = forwardRef<HTMLInputElement, UiInputProps>(
  (
    {
      className = '',
      leftIcon,
      rightIcon,
      error,
      passwordToggle,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const [visible, setVisible] = useState(false);
    const isPassword = type === 'password';
    const showToggle = passwordToggle ?? isPassword;
    const actualType = isPassword && visible ? 'text' : type;
    const hasRight = Boolean(rightIcon || (isPassword && showToggle));

    return (
      <div className="relative">
        {leftIcon && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 text-ink-muted"
          >
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          type={actualType}
          className={[
            INPUT_BASE,
            leftIcon ? 'pl-11' : '',
            hasRight ? 'pr-11' : '',
            error ? 'border-danger text-danger-fg' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-invalid={error || undefined}
          {...props}
        />
        {hasRight && (
          <span className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center text-ink-muted">
            {rightIcon}
            {isPassword && showToggle && (
              <button
                type="button"
                className="flex items-center justify-center rounded-sm transition-colors hover:text-ink"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                <HugeiconsIcon
                  icon={visible ? EyeOffIcon : EyeIcon}
                  size={16}
                  strokeWidth={2}
                />
              </button>
            )}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export default Input;
