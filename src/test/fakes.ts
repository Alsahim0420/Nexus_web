import type { HttpClient, HttpRequest } from '@/core/http/HttpClient';
import type { AuthRepository } from '@/features/auth/repository/AuthRepository';
import type { Credentials } from '@/features/auth/model/Credentials';
import type { Session } from '@/features/auth/model/Session';

type Responder = (req: HttpRequest) => unknown | Promise<unknown>;

/** Cliente HTTP falso: registra peticiones y responde con lo configurado. */
export class FakeHttpClient implements HttpClient {
  readonly requests: HttpRequest[] = [];
  private responders = new Map<string, Responder>();

  on(method: HttpRequest['method'], path: string, responder: Responder): this {
    this.responders.set(`${method} ${path}`, responder);
    return this;
  }

  async request<T>(req: HttpRequest): Promise<T> {
    this.requests.push(req);
    const responder = this.responders.get(`${req.method} ${req.path}`);
    if (!responder) throw new Error(`Sin respuesta configurada para ${req.method} ${req.path}`);
    return (await responder(req)) as T;
  }
}

/** Repositorio falso para probar controladores y vistas sin red. */
export class FakeAuthRepository implements AuthRepository {
  login = vi.fn<(credentials: Credentials) => Promise<Session>>();
  logout = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  getCurrentSession = vi.fn<() => Promise<Session | null>>().mockResolvedValue(null);
}

/** Promesa que se resuelve a mano: útil para inspeccionar estados de "cargando". */
export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
