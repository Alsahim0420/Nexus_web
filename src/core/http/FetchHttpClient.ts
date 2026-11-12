import { HttpError, NetworkError, type HttpClient, type HttpRequest } from './HttpClient';

type FetchFn = typeof fetch;

export class FetchHttpClient implements HttpClient {
  private readonly baseUrl: string;

  constructor(
    baseUrl: string,
    private readonly fetchFn: FetchFn = (...args) => fetch(...args),
  ) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  async request<T = unknown>({ method, path, body, token }: HttpRequest): Promise<T> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;

    let response: Response;
    try {
      response = await this.fetchFn(`${this.baseUrl}${path}`, {
        method,
        headers,
        ...(body !== undefined && { body: JSON.stringify(body) }),
      });
    } catch (cause) {
      throw new NetworkError(cause);
    }

    const data = await parseBody(response);
    if (!response.ok) throw new HttpError(response.status, data);
    return data as T;
  }
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
