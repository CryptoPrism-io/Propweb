import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function Button({
  variant = 'primary', children, onClick, className = '', disabled = false,
}: {
  variant?: 'primary' | 'secondary';
  children: ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  disabled?: ButtonHTMLAttributes<HTMLButtonElement>['disabled'];
}) {
  const styles =
    variant === 'primary'
      ? 'bg-blueharbor text-white p-[13px] text-[15px] hover:brightness-95'
      : 'bg-white text-blueharbor border-[1.5px] border-blueharbor px-[20px] py-[11px] text-[14px] hover:bg-moontint';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full font-bold transition inline-flex items-center justify-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-40 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}
