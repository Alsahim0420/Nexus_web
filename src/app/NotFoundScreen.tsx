import { Link } from 'react-router';
import styles from './NotFoundScreen.module.css';

export function NotFoundScreen() {
  return (
    <main className={styles.page}>
      <title>Página no encontrada · Nexus</title>
      <h1 className="t-screen-title">Esta página no existe</h1>
      <p className="t-body">Puede que el enlace esté mal escrito o que la página ya no esté disponible.</p>
      <Link to="/" className={`t-caps ${styles.link}`}>
        Volver al inicio
      </Link>
    </main>
  );
}
