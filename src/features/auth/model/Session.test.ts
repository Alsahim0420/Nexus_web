import { isSessionExpired, parseSession } from './Session';

describe('parseSession', () => {
  it('construye la sesión a partir de la respuesta del backend', () => {
    // Arrange
    const raw = {
      accessToken: 'tok_123',
      refreshToken: 'ref_456',
      expiresAt: '2026-12-01T00:00:00.000Z',
      user: { id: 'u1', name: 'Ana López', email: 'ana@nexus.app', avatarUrl: null },
    };

    // Act
    const session = parseSession(raw);

    // Assert
    expect(session).toEqual({
      accessToken: 'tok_123',
      refreshToken: 'ref_456',
      expiresAt: '2026-12-01T00:00:00.000Z',
      user: { id: 'u1', name: 'Ana López', email: 'ana@nexus.app', avatarUrl: null },
    });
  });

  it('acepta campos opcionales ausentes', () => {
    // Arrange
    const raw = { accessToken: 'tok', user: { id: 'u1', name: 'Ana', email: 'ana@nexus.app' } };

    // Act
    const session = parseSession(raw);

    // Assert
    expect(session).toEqual({
      accessToken: 'tok',
      refreshToken: null,
      expiresAt: null,
      user: { id: 'u1', name: 'Ana', email: 'ana@nexus.app', avatarUrl: null },
    });
  });

  it.each([
    ['null', null],
    ['sin token', { user: { id: 'u1', name: 'Ana', email: 'a@b.co' } }],
    ['sin usuario', { accessToken: 'tok' }],
    ['usuario incompleto', { accessToken: 'tok', user: { id: 'u1' } }],
  ])('devuelve null cuando la respuesta es inválida (%s)', (_, raw) => {
    // Arrange — datos en la tabla

    // Act
    const session = parseSession(raw);

    // Assert
    expect(session).toBeNull();
  });
});

describe('isSessionExpired', () => {
  const base = {
    accessToken: 'tok',
    refreshToken: null,
    user: { id: 'u1', name: 'Ana', email: 'ana@nexus.app', avatarUrl: null },
  };

  it('considera vigente una sesión sin fecha de expiración', () => {
    // Arrange
    const session = { ...base, expiresAt: null };

    // Act
    const expired = isSessionExpired(session, new Date('2026-11-11T00:00:00Z'));

    // Assert
    expect(expired).toBe(false);
  });

  it('considera vencida una sesión cuya fecha ya pasó', () => {
    // Arrange
    const session = { ...base, expiresAt: '2026-11-10T00:00:00.000Z' };

    // Act
    const expired = isSessionExpired(session, new Date('2026-11-11T00:00:00Z'));

    // Assert
    expect(expired).toBe(true);
  });

  it('considera vigente una sesión con fecha futura', () => {
    // Arrange
    const session = { ...base, expiresAt: '2026-11-12T00:00:00.000Z' };

    // Act
    const expired = isSessionExpired(session, new Date('2026-11-11T00:00:00Z'));

    // Assert
    expect(expired).toBe(false);
  });
});
