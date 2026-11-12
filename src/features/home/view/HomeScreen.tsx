import { useAuth } from '@/features/auth/controller/AuthController';
import { EditorialLabel, Ledger, LedgerCell, TextAction } from '@/shared/components';
import styles from './HomeScreen.module.css';

/** Provisional: confirma la sesión mientras se construyen las secciones de la plataforma. */
export function HomeScreen() {
  const { session, signOut } = useAuth();
  if (!session) return null;
  const { user } = session;

  return (
    <div className={styles.page}>
      <title>Inicio · Nexus</title>
      <header className={styles.appBar}>
        <h1 className="t-screen-title">Inicio</h1>
        <TextAction onClick={() => void signOut()}>Cerrar sesión</TextAction>
      </header>

      <main>
        <section>
          <EditorialLabel label="Cuenta" trailing="01" />
          <Ledger>
            <LedgerCell label="Nombre">
              <span className="t-ledger-value">{user.name}</span>
            </LedgerCell>
            <LedgerCell label="Correo">
              <span className="t-ledger-value">{user.email}</span>
            </LedgerCell>
          </Ledger>
        </section>

        <section className={styles.section}>
          <EditorialLabel label="Plataforma" trailing="02" />
          <h2 className="t-screen-title">Muy pronto</h2>
          <p className={`t-body ${styles.soon}`}>Aquí vas a ver tu billetera, tus campañas y tus directos.</p>
        </section>
      </main>
    </div>
  );
}
