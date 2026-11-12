import { DEMO_CREDENTIALS, DemoAuthRepository } from './DemoAuthRepository';
import { InMemorySessionStorage } from './SessionStorage';

function setup() {
  const storage = new InMemorySessionStorage();
  const repository = new DemoAuthRepository(storage, 0);
  return { storage, repository };
}

describe('DemoAuthRepository', () => {
  it('inicia sesión con las credenciales de demostración y la persiste', async () => {
    // Arrange
    const { storage, repository } = setup();

    // Act
    const session = await repository.login(DEMO_CREDENTIALS);

    // Assert
    expect(session.user.email).toBe(DEMO_CREDENTIALS.email);
    expect(await storage.load()).toEqual(session);
  });

  it('rechaza otras credenciales con "invalid_credentials"', async () => {
    // Arrange
    const { repository } = setup();

    // Act
    const promise = repository.login({ email: DEMO_CREDENTIALS.email, password: 'otra' });

    // Assert
    await expect(promise).rejects.toMatchObject({ code: 'invalid_credentials' });
  });

  it('recupera y cierra la sesión', async () => {
    // Arrange
    const { repository } = setup();
    await repository.login(DEMO_CREDENTIALS);

    // Act
    const before = await repository.getCurrentSession();
    await repository.logout();
    const after = await repository.getCurrentSession();

    // Assert
    expect(before).not.toBeNull();
    expect(after).toBeNull();
  });
});
