import styles from './PlatformPreview.module.css';

const MOVEMENTS = [
  ['Regalo en directo', 'Exitoso · hace 3 h', '+$320 MXN'],
  ['Campaña «Verano»', 'Activa · 4 días', '−$700 MXN'],
  ['Cobro a tu banco', 'En camino · ayer', '−$2,000 MXN'],
] as const;

/** Vista previa ilustrativa de la plataforma (datos de ejemplo, decorativa). */
export function PlatformPreview() {
  return (
    <div className={styles.window} aria-hidden="true">
      <div className={styles.chrome}>
        <span />
        <span />
        <span />
        <p className={styles.url}>nexus · billetera</p>
      </div>
      <div className={styles.body}>
        <div className={styles.labelRow}>
          <span className="t-caps">Saldo</span>
          <span className={`t-caps ${styles.dim}`}>01</span>
        </div>
        <p className={styles.balance}>$12,480 MXN</p>

        <div className={styles.cells}>
          <div>
            <p className={styles.cellLabel}>Cobros</p>
            <p className="t-ledger-value">$4,200</p>
          </div>
          <div>
            <p className={styles.cellLabel}>Campañas</p>
            <p className="t-ledger-value">3 activas</p>
          </div>
          <div>
            <p className={styles.cellLabel}>Directos</p>
            <p className="t-ledger-value">12 este mes</p>
          </div>
        </div>

        <div className={`${styles.labelRow} ${styles.movementsLabel}`}>
          <span className="t-caps">Movimientos</span>
          <span className={`t-caps ${styles.dim}`}>02</span>
        </div>
        <ul className={styles.movements}>
          {MOVEMENTS.map(([title, detail, amount]) => (
            <li key={title}>
              <span className={styles.dot} />
              <div className={styles.movementText}>
                <p className="t-ledger-value">{title}</p>
                <p className="t-caps">{detail}</p>
              </div>
              <p className={amount.startsWith('+') ? styles.amountIn : styles.amountOut}>{amount}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
