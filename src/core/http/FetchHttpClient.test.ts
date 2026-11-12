import { FetchHttpClient } from './FetchHttpClient';
import { HttpError, NetworkError } from './HttpClient';

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => (body === undefined ? '' : JSON.stringify(body)),
  } as Response;
}

describe('FetchHttpClient', () => {
  it('envía JSON a la URL completa y devuelve el cuerpo parseado', async () => {
    // Arrange
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse(200, { hello: 'world' }));
    const client = new FetchHttpClient('https://api.nexus.app/', fetchFn);

    // Act
    const data = await client.request({ method: 'POST', path: '/auth/login', body: { a: 1 } });

    // Assert
    expect(data).toEqual({ hello: 'world' });
    expect(fetchFn).toHaveBeenCalledWith('https://api.nexus.app/auth/login', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ a: 1 }),
    });
  });

  it('agrega el token como cabecera Authorization', async () => {
    // Arrange
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse(204, undefined));
    const client = new FetchHttpClient('https://api.nexus.app', fetchFn);

    // Act
    await client.request({ method: 'POST', path: '/auth/logout', token: 'tok_123' });

    // Assert
    expect(fetchFn).toHaveBeenCalledWith(
      'https://api.nexus.app/auth/logout',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer tok_123' }),
      }),
    );
  });

  it('devuelve undefined cuando la respuesta no tiene cuerpo', async () => {
    // Arrange
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse(204, undefined));
    const client = new FetchHttpClient('https://api.nexus.app', fetchFn);

    // Act
    const data = await client.request({ method: 'GET', path: '/ping' });

    // Assert
    expect(data).toBeUndefined();
  });

  it('lanza HttpError con el estado y el cuerpo cuando la respuesta no es 2xx', async () => {
    // Arrange
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse(401, { error: 'invalid' }));
    const client = new FetchHttpClient('https://api.nexus.app', fetchFn);

    // Act
    const promise = client.request({ method: 'POST', path: '/auth/login' });

    // Assert
    await expect(promise).rejects.toBeInstanceOf(HttpError);
    await expect(promise).rejects.toMatchObject({ status: 401, body: { error: 'invalid' } });
  });

  it('lanza NetworkError cuando fetch falla', async () => {
    // Arrange
    const fetchFn = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    const client = new FetchHttpClient('https://api.nexus.app', fetchFn);

    // Act
    const promise = client.request({ method: 'GET', path: '/ping' });

    // Assert
    await expect(promise).rejects.toBeInstanceOf(NetworkError);
  });
});
