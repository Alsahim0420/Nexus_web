import { AuthError } from '@/features/auth/model/AuthError';
import type { Credentials } from '@/features/auth/model/Credentials';
import type { Session } from '@/features/auth/model/Session';
import type { AuthRepository } from './AuthRepository';
import type { SessionStorage } from './SessionStorage';

export const DEMO_CREDENTIALS: Credentials = { email: 'demo@nexus.app', password: 'nexus123' };

/**
 * Repositorio de demostración para desarrollar sin backend.
 * Solo se usa en `npm run dev` cuando falta `VITE_API_URL` (ver core/di/container.ts).
 */
export class DemoAuthRepository implements AuthRepository {
  constructor(
    private readonly storage: SessionStorage,
    private readonly latencyMs = 600,
  ) {}

  async login({ email, password }: Credentials): Promise<Session> {
    await new Promise((r) => setTimeout(r, this.latencyMs));
    if (email !== DEMO_CREDENTIALS.email || password !== DEMO_CREDENTIALS.password) {
      throw new AuthError('invalid_credentials');
    }
    const session: Session = {
      accessToken: 'demo-token',
      refreshToken: null,
      expiresAt: null,
      user: { id: 'demo', name: 'Cuenta demo', email, avatarUrl: null },
    };
    await this.storage.save(session);
    return session;
  }

  async logout(): Promise<void> {
    await this.storage.clear();
  }

  getCurrentSession(): Promise<Session | null> {
    return this.storage.load();
  }
}
