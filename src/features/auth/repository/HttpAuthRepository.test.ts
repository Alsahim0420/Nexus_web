import { HttpError, NetworkError } from '@/core/http/HttpClient';
import { AuthError } from '@/features/auth/model/AuthError';
import { buildLoginResponse, buildSession } from '@/test/builders';
import { FakeHttpClient } from '@/test/fakes';
import { HttpAuthRepository } from './HttpAuthRepository';
import { InMemorySessionStorage } from './SessionStorage';

const NOW = new Date('2026-11-11T12:00:00.000Z');
const credentials = { email: 'ana@nexus.app', password: 'secreta123' };

function setup() {
  const http = new FakeHttpClient();
  const storage = new InMemorySessionStorage();
  const repository = new HttpAuthRepository(http, storage, () => NOW);
  return { http, storage, repository };
}

describe('HttpAuthRepository.login', () => {
  it('envía las credenciales a /auth/login', async () => {
    // Arrange
    const { http, repository } = setup();
    http.on('POST', '/auth/login', () => buildLoginResponse());

    // Act
    await repository.login(credentials);

    // Assert
    expect(http.requests).toEqual([
      { method: 'POST', path: '/auth/login', body: { email: 'ana@nexus.app', password: 'secreta123' } },
    ]);
  });

  it('devuelve la sesión y la persiste', async () => {
    // Arrange
    const { http, storage, repository } = setup();
    http.on('POST', '/auth/login', () => buildLoginResponse());

    // Act
    const session = await repository.login(credentials);

    // Assert
    expect(session).toEqual(buildSession());
    expect(await storage.load()).toEqual(buildSession());
  });

  it.each([
    [400, 'invalid_credentials'],
    [401, 'invalid_credentials'],
    [403, 'account_disabled'],
    [429, 'rate_limited'],
    [500, 'unknown'],
  ] as const)('traduce el estado HTTP %i a AuthError "%s"', async (status, code) => {
    // Arrange
    const { http, repository } = setup();
    http.on('POST', '/auth/login', () => {
      throw new HttpError(status, null);
    });

    // Act
    const promise = repository.login(credentials);

    // Assert
    await expect(promise).rejects.toEqual(new AuthError(code));
    await expect(promise).rejects.toMatchObject({ code });
  });

  it('traduce un fallo de red a AuthError "network"', async () => {
    // Arrange
    const { http, repository } = setup();
    http.on('POST', '/auth/login', () => {
      throw new NetworkError(new TypeError('Failed to fetch'));
    });

    // Act
    const promise = repository.login(credentials);

    // Assert
    await expect(promise).rejects.toMatchObject({ code: 'network' });
  });

  it('rechaza con "unknown" una respuesta sin el formato esperado', async () => {
    // Arrange
    const { http, repository } = setup();
    http.on('POST', '/auth/login', () => ({ token: 'formato viejo' }));

    // Act
    const promise = repository.login(credentials);

    // Assert
    await expect(promise).rejects.toMatchObject({ code: 'unknown' });
  });

  it('no persiste nada cuando el login falla', async () => {
    // Arrange
    const { http, storage, repository } = setup();
    http.on('POST', '/auth/login', () => {
      throw new HttpError(401, null);
    });

    // Act
    await repository.login(credentials).catch(() => undefined);

    // Assert
    expect(await storage.load()).toBeNull();
  });
});

describe('HttpAuthRepository.getCurrentSession', () => {
  it('devuelve la sesión guardada si sigue vigente', async () => {
    // Arrange
    const { storage, repository } = setup();
    const session = buildSession({ expiresAt: '2026-11-12T00:00:00.000Z' });
    await storage.save(session);

    // Act
    const current = await repository.getCurrentSession();

    // Assert
    expect(current).toEqual(session);
  });

  it('devuelve null cuando no hay sesión', async () => {
    // Arrange
    const { repository } = setup();

    // Act
    const current = await repository.getCurrentSession();

    // Assert
    expect(current).toBeNull();
  });

  it('descarta y borra una sesión vencida', async () => {
    // Arrange
    const { storage, repository } = setup();
    await storage.save(buildSession({ expiresAt: '2026-11-10T00:00:00.000Z' }));

    // Act
    const current = await repository.getCurrentSession();

    // Assert
    expect(current).toBeNull();
    expect(await storage.load()).toBeNull();
  });
});

describe('HttpAuthRepository.logout', () => {
  it('avisa al backend con el token y borra la sesión local', async () => {
    // Arrange
    const { http, storage, repository } = setup();
    await storage.save(buildSession());
    http.on('POST', '/auth/logout', () => undefined);

    // Act
    await repository.logout();

    // Assert
    expect(http.requests).toEqual([{ method: 'POST', path: '/auth/logout', token: 'tok_123' }]);
    expect(await storage.load()).toBeNull();
  });

  it('borra la sesión local aunque el backend falle', async () => {
    // Arrange
    const { http, storage, repository } = setup();
    await storage.save(buildSession());
    http.on('POST', '/auth/logout', () => {
      throw new NetworkError(new Error('offline'));
    });

    // Act
    await repository.logout();

    // Assert
    expect(await storage.load()).toBeNull();
  });

  it('no llama al backend si no había sesión', async () => {
    // Arrange
    const { http, repository } = setup();

    // Act
    await repository.logout();

    // Assert
    expect(http.requests).toHaveLength(0);
  });
});
