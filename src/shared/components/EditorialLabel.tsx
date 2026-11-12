import styles from './EditorialLabel.module.css';

/** Etiqueta de sección numerada: `ACCESO · 01` (DESIGN.md §6). */
export function EditorialLabel({ label, trailing }: { label: string; trailing?: string }) {
  return (
    <div className={styles.label}>
      <span className="t-caps">{label}</span>
      {trailing && <span className={`t-caps ${styles.trailing}`}>{trailing}</span>}
    </div>
  );
}
