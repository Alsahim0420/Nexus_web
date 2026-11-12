import type { ButtonHTMLAttributes } from 'react';
import styles from './TextAction.module.css';

/** Acción de texto en versalitas: REINTENTAR, CARGAR MÁS, MOSTRAR… (DESIGN.md §6). */
export function TextAction({ className, type = 'button', ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...rest} type={type} className={`t-caps ${styles.action} ${className ?? ''}`} />;
}
