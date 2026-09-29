import type { InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function Input({ label, hint, error, id, ...props }: InputProps) {
  const errorId = `${id}-erro`;
  const hintId = `${id}-ajuda`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        {...props}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
      />
      <span id={hintId} className={styles.hint}>
        {hint ?? ''}
      </span>
      <span
        id={errorId}
        className={styles.error}
        role={error ? 'alert' : undefined}
      >
        {error ?? ''}
      </span>
    </div>
  );
}
