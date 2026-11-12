export type AuthErrorCode =
  | 'invalid_credentials'
  | 'network'
  | 'rate_limited'
  | 'account_disabled'
  | 'unknown';

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, options?: { cause?: unknown }) {
    super(code, options);
    this.name = 'AuthError';
    this.code = code;
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

const MESSAGES: Record<AuthErrorCode, string> = {
  invalid_credentials: 'Correo o contraseña incorrectos. Revísalos e inténtalo de nuevo.',
  network: 'No pudimos conectarnos. Revisa tu internet e inténtalo de nuevo.',
  rate_limited: 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
  account_disabled: 'Tu cuenta está desactivada. Escríbenos a soporte para revisarla.',
  unknown: 'Algo salió mal. Inténtalo de nuevo en unos minutos.',
};

/** Mensaje en español de tú, sin códigos técnicos (DESIGN.md §10). */
export function authErrorMessage(error: unknown): string {
  return error instanceof AuthError ? MESSAGES[error.code] : MESSAGES.unknown;
}
