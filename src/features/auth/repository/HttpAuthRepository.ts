import { HttpError, NetworkError, type HttpClient } from '@/core/http/HttpClient';
import { AuthError, type AuthErrorCode } from '@/features/auth/model/AuthError';
import type { Credentials } from '@/features/auth/model/Credentials';
import { isSessionExpired, parseSession, type Session } from '@/features/auth/model/Session';
import type { AuthRepository } from './AuthRepository';
import type { SessionStorage } from './SessionStorage';

export class HttpAuthRepository implements AuthRepository {
  constructor(
    private readonly http: HttpClient,
    private readonly storage: SessionStorage,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async login({ email, password }: Credentials): Promise<Session> {
    let raw: unknown;
    try {
      raw = await this.http.request({ method: 'POST', path: '/auth/login', body: { email, password } });
    } catch (error) {
      throw toAuthError(error);
    }

    const session = parseSession(raw);
    if (!session) throw new AuthError('unknown');

    await this.storage.save(session);
    return session;
  }

  async logout(): Promise<void> {
    const session = await this.storage.load();
    try {
      if (session) {
        await this.http.request({ method: 'POST', path: '/auth/logout', token: session.accessToken });
      }
    } catch {
      // Cerrar sesión localmente siempre debe funcionar, aunque el backend no responda.
    } finally {
      await this.storage.clear();
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    const session = await this.storage.load();
    if (!session) return null;
    if (isSessionExpired(session, this.now())) {
      await this.storage.clear();
      return null;
    }
    return session;
  }
}

function toAuthError(error: unknown): AuthError {
  if (error instanceof NetworkError) return new AuthError('network', { cause: error });
  if (error instanceof HttpError) return new AuthError(codeForStatus(error.status), { cause: error });
  return new AuthError('unknown', { cause: error });
}

function codeForStatus(status: number): AuthErrorCode {
  if (status === 400 || status === 401) return 'invalid_credentials';
  if (status === 403) return 'account_disabled';
  if (status === 429) return 'rate_limited';
  return 'unknown';
}
