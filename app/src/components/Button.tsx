import type { ReactNode } from 'react';

export function Button({
  variant = 'primary', children, onClick, className = '',
}: {
  variant?: 'primary' | 'secondary';
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const styles =
    variant === 'primary'
      ? 'bg-blueharbor text-white hover:brightness-95'
      : 'bg-white text-blueharbor border border-blueharbor hover:bg-moontint';
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${styles} ${className}`}
    >
      {children}
    </button>
  );
}
