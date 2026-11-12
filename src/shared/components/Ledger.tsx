import type { InputHTMLAttributes, ReactNode } from 'react';
import styles from './Ledger.module.css';

/** Ficha con filetes: caja de 1 px y radio 14, dividida en filas (DESIGN.md §6). */
export function Ledger({ children }: { children: ReactNode }) {
  return <div className={styles.ledger}>{children}</div>;
}

/** Fila con varias celdas lado a lado. Una celda sola no necesita fila. */
export function LedgerRow({ children }: { children: ReactNode }) {
  return <div className={styles.row}>{children}</div>;
}

type CellProps = {
  label: string;
  children: ReactNode;
  /** id del campo para asociar la etiqueta (`<label for>`). */
  htmlFor?: string;
  trailing?: ReactNode;
  error?: string;
  errorId?: string;
};

/** Celda: etiqueta pequeña arriba, valor abajo, error opcional. */
export function LedgerCell({ label, children, htmlFor, trailing, error, errorId }: CellProps) {
  const Label = htmlFor ? 'label' : 'span';
  return (
    <div className={`${styles.cell} ${error ? styles.invalid : ''}`}>
      <Label className={styles.label} htmlFor={htmlFor}>
        {label}
      </Label>
      <div className={styles.body}>
        <div className={styles.value}>{children}</div>
        {trailing}
      </div>
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}

/** Campo sin caja propia: la ficha es la caja (`ledgerInput` en Flutter). */
export function LedgerInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={`${styles.input} ${className ?? ''}`} />;
}
