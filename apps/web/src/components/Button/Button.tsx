import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingLabel?: string;
};

export function Button({
  loading = false,
  loadingLabel = 'Processando...',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={styles.button}
      disabled={loading || disabled}
      aria-busy={loading}
    >
      {loading ? loadingLabel : children}
    </button>
  );
}
