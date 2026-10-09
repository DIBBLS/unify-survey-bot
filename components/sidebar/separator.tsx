'use client';

import * as SeparatorPrimitive from '@radix-ui/react-separator';

export function Separator({
  orientation = 'horizontal',
  className = '',
}: {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}) {
  return (
    <SeparatorPrimitive.Root
      orientation={orientation}
      decorative
      className={`${orientation === 'vertical' ? 'h-4 w-px' : 'h-px w-full'} shrink-0 bg-border ${className}`}
    />
  );
}
