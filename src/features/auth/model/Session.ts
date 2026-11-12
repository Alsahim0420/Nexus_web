export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export type Session = {
  accessToken: string;
  refreshToken: string | null;
  /** ISO 8601. `null` si el backend no informa expiración. */
  expiresAt: string | null;
  user: User;
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;
const isString = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
const optionalString = (v: unknown): string | null => (isString(v) ? v : null);

function parseUser(raw: unknown): User | null {
  if (!isRecord(raw)) return null;
  const { id, name, email, avatarUrl } = raw;
  if (!isString(id) || !isString(name) || !isString(email)) return null;
  return { id, name, email, avatarUrl: optionalString(avatarUrl) };
}

/** Convierte datos no confiables (backend o almacenamiento) en una `Session`, o `null`. */
export function parseSession(raw: unknown): Session | null {
  if (!isRecord(raw) || !isString(raw.accessToken)) return null;
  const user = parseUser(raw.user);
  if (!user) return null;
  return {
    accessToken: raw.accessToken,
    refreshToken: optionalString(raw.refreshToken),
    expiresAt: optionalString(raw.expiresAt),
    user,
  };
}

export function isSessionExpired(session: Session, now: Date = new Date()): boolean {
  if (!session.expiresAt) return false;
  return new Date(session.expiresAt).getTime() <= now.getTime();
}
