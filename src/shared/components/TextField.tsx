import type { InputHTMLAttributes, ReactNode } from 'react';
import styles from './TextField.module.css';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  id: string;
  label: string;
  error?: string;
  /** Elemento dentro del campo, a la derecha (p. ej. ver contraseña). */
  trailing?: ReactNode;
};

/** Campo de formulario web: etiqueta arriba, caja con borde y anillo de foco, error debajo. */
export function TextField({ id, label, error, trailing, className, ...inputProps }: Props) {
  const errorId = `${id}-error`;
  return (
    <div className={`${styles.field} ${className ?? ''}`}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={`${styles.control} ${error ? styles.invalid : ''}`}>
        <input
          {...inputProps}
          id={id}
          className={styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        {trailing && <div className={styles.trailing}>{trailing}</div>}
      </div>
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
