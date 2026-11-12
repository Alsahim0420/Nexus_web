import type { Session } from '@/features/auth/model/Session';

export function buildSession(overrides: Partial<Session> = {}): Session {
  return {
    accessToken: 'tok_123',
    refreshToken: 'ref_456',
    expiresAt: null,
    user: { id: 'u1', name: 'Ana López', email: 'ana@nexus.app', avatarUrl: null },
    ...overrides,
  };
}

/** Respuesta del backend tal como llega por la red. */
export function buildLoginResponse(overrides: Record<string, unknown> = {}) {
  return {
    accessToken: 'tok_123',
    refreshToken: 'ref_456',
    expiresAt: null,
    user: { id: 'u1', name: 'Ana López', email: 'ana@nexus.app', avatarUrl: null },
    ...overrides,
  };
}
