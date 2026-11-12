export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type HttpRequest = {
  method: HttpMethod;
  path: string;
  body?: unknown;
  /** Token de acceso; se envía como `Authorization: Bearer …`. */
  token?: string;
};

export interface HttpClient {
  request<T = unknown>(req: HttpRequest): Promise<T>;
}

/** El servidor respondió con un estado fuera de 2xx. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
  ) {
    super(`HTTP ${status}`);
    this.name = 'HttpError';
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

/** No hubo respuesta: sin conexión, DNS, CORS, etc. */
export class NetworkError extends Error {
  constructor(cause: unknown) {
    super('Network request failed', { cause });
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}
