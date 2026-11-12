import type { FormEvent } from 'react';
import type { LoginActions, LoginState } from '@/features/auth/controller/useLoginController';
import { Icon, IconButton, PrimaryButton, TextField } from '@/shared/components';
import { PlatformPreview } from './PlatformPreview';
import styles from './LoginView.module.css';

type Props = { state: LoginState; actions: LoginActions };

/**
 * Vista pura del login: solo pinta `state` y dispara `actions`.
 * No conoce repositorios, red ni navegación.
 */
export function LoginView({ state, actions }: Props) {
  const { fieldErrors, isSubmitting, isPasswordVisible } = state;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void actions.submit();
  };

  return (
    <div className={styles.page}>
      <title>Inicia sesión · Nexus</title>

      <header className={styles.topbar}>
        <span className={styles.wordmark}>NEXUS</span>
        <span className="t-caps">Plataforma web</span>
      </header>

      <main className={styles.main}>
        <section className={styles.intro} aria-labelledby="intro-title">
          <p className="t-caps">Nexus para web</p>
          <h2 id="intro-title" className={`t-hero ${styles.introTitle}`}>
            Tu cuenta de Nexus, ahora en pantalla grande.
          </h2>
          <p className={`t-body ${styles.introText}`}>
            Revisa tu saldo, gestiona tus campañas y sigue tus directos desde el navegador.
          </p>
          <PlatformPreview />
        </section>

        <section className={styles.panel}>
          <h1 id="login-title" className={styles.title}>
            Inicia sesión
          </h1>
          <p className={`t-body ${styles.subtitle}`}>Usa el correo y la contraseña de tu cuenta de Nexus.</p>

          <form noValidate aria-labelledby="login-title" onSubmit={handleSubmit} className={styles.form}>
            <fieldset className={styles.fieldset} disabled={isSubmitting}>
              <TextField
                id="login-email"
                label="Correo electrónico"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                autoFocus
                placeholder="tu@correo.com"
                value={state.email}
                onChange={(e) => actions.changeEmail(e.target.value)}
                error={fieldErrors.email}
              />

              <TextField
                id="login-password"
                label="Contraseña"
                name="password"
                type={isPasswordVisible ? 'text' : 'password'}
                autoComplete="current-password"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="Tu contraseña"
                value={state.password}
                onChange={(e) => actions.changePassword(e.target.value)}
                error={fieldErrors.password}
                trailing={
                  <IconButton
                    icon={isPasswordVisible ? 'visibilityOff' : 'visibility'}
                    aria-label={isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-pressed={isPasswordVisible}
                    aria-controls="login-password"
                    onClick={actions.togglePasswordVisibility}
                  />
                }
              />
            </fieldset>

            {state.formError && (
              <div className={styles.alert}>
                <Icon name="errorOutline" size={18} />
                <p role="alert" className={styles.alertText}>
                  {state.formError}
                </p>
              </div>
            )}

            <PrimaryButton type="submit" size="md" loading={isSubmitting}>
              Iniciar sesión
            </PrimaryButton>
          </form>

          <p className={`t-body ${styles.footnote}`}>¿Aún no tienes cuenta? Créala desde la app de Nexus.</p>
        </section>
      </main>

      <footer className={styles.footer}>
        <span className="t-caps">© {new Date().getFullYear()} Nexus</span>
      </footer>
    </div>
  );
}
