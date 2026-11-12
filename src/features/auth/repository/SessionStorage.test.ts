import { buildSession } from '@/test/builders';
import { LocalStorageSessionStorage, SESSION_KEY } from './SessionStorage';

describe('LocalStorageSessionStorage', () => {
  it('guarda y recupera la sesión', async () => {
    // Arrange
    const storage = new LocalStorageSessionStorage(localStorage);
    const session = buildSession();

    // Act
    await storage.save(session);
    const loaded = await storage.load();

    // Assert
    expect(loaded).toEqual(session);
  });

  it('devuelve null cuando no hay sesión guardada', async () => {
    // Arrange
    const storage = new LocalStorageSessionStorage(localStorage);

    // Act
    const loaded = await storage.load();

    // Assert
    expect(loaded).toBeNull();
  });

  it('devuelve null cuando lo guardado está corrupto', async () => {
    // Arrange
    localStorage.setItem(SESSION_KEY, '{no es json');
    const storage = new LocalStorageSessionStorage(localStorage);

    // Act
    const loaded = await storage.load();

    // Assert
    expect(loaded).toBeNull();
  });

  it('devuelve null si el navegador bloquea el almacenamiento', async () => {
    // Arrange
    const blocked = {
      getItem: () => {
        throw new DOMException('SecurityError');
      },
    } as unknown as Storage;
    const storage = new LocalStorageSessionStorage(blocked);

    // Act
    const loaded = await storage.load();

    // Assert
    expect(loaded).toBeNull();
  });

  it('borra la sesión', async () => {
    // Arrange
    const storage = new LocalStorageSessionStorage(localStorage);
    await storage.save(buildSession());

    // Act
    await storage.clear();

    // Assert
    expect(await storage.load()).toBeNull();
  });
});
