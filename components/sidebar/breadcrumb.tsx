import type { ReactNode } from 'react';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function Breadcrumb({ children }: { children: ReactNode }) {
  return (
    <nav aria-label="Breadcrumb">
      <BreadcrumbList>{children}</BreadcrumbList>
    </nav>
  );
}

export function BreadcrumbList({ children }: { children: ReactNode }) {
  return (
    <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-muted">
      {children}
    </ol>
  );
}

export function BreadcrumbItem({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <li className={cn('inline-flex items-center gap-1.5', className)}>{children}</li>;
}

export function BreadcrumbLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a href={href} className="transition-colors hover:text-ink">
      {children}
    </a>
  );
}

export function BreadcrumbPage({ children }: { children: ReactNode }) {
  return (
    <span aria-current="page" className="font-medium text-ink">
      {children}
    </span>
  );
}

export function BreadcrumbSeparator({ className = '' }: { className?: string }) {
  return (
    <li aria-hidden="true" className={`text-ink-subtle ${className}`}>
      /
    </li>
  );
}
