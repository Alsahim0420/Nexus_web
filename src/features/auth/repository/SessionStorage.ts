import { parseSession, type Session } from '@/features/auth/model/Session';

export interface SessionStorage {
  load(): Promise<Session | null>;
  save(session: Session): Promise<void>;
  clear(): Promise<void>;
}

export const SESSION_KEY = 'nexus.session';

/** Persiste la sesión en el navegador. Recibe el `Storage` para poder probarlo. */
export class LocalStorageSessionStorage implements SessionStorage {
  constructor(private readonly storage: Storage = window.localStorage) {}

  async load(): Promise<Session | null> {
    try {
      const raw = this.storage.getItem(SESSION_KEY);
      return raw ? parseSession(JSON.parse(raw)) : null;
    } catch {
      // JSON corrupto o almacenamiento bloqueado (modo privado, permisos).
      return null;
    }
  }

  async save(session: Session): Promise<void> {
    this.storage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  async clear(): Promise<void> {
    this.storage.removeItem(SESSION_KEY);
  }
}

export class InMemorySessionStorage implements SessionStorage {
  private session: Session | null = null;

  async load() {
    return this.session;
  }

  async save(session: Session) {
    this.session = session;
  }

  async clear() {
    this.session = null;
  }
}
