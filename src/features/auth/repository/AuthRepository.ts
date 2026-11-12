import type { Credentials } from '@/features/auth/model/Credentials';
import type { Session } from '@/features/auth/model/Session';

/**
 * Contrato de autenticación. Los controladores dependen de esta interfaz,
 * nunca de una implementación concreta (HTTP, demo, etc.).
 *
 * Los métodos que fallan lanzan `AuthError`.
 */
export interface AuthRepository {
  login(credentials: Credentials): Promise<Session>;
  logout(): Promise<void>;
  /** Sesión persistida y vigente, o `null`. */
  getCurrentSession(): Promise<Session | null>;
}
