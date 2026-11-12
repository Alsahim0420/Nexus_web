import { DemoAuthRepository } from '@/features/auth/repository/DemoAuthRepository';
import { HttpAuthRepository } from '@/features/auth/repository/HttpAuthRepository';
import { createAuthRepository } from './container';

describe('createAuthRepository', () => {
  it('usa el backend real cuando hay URL de API', () => {
    // Arrange
    const config = { apiUrl: 'https://api.nexus.app', isDev: false };

    // Act
    const repository = createAuthRepository(config);

    // Assert
    expect(repository).toBeInstanceOf(HttpAuthRepository);
  });

  it('usa el modo demo en desarrollo sin URL de API', () => {
    // Arrange
    const config = { apiUrl: undefined, isDev: true };

    // Act
    const repository = createAuthRepository(config);

    // Assert
    expect(repository).toBeInstanceOf(DemoAuthRepository);
  });

  it('falla en producción si falta la URL de API, en vez de caer al modo demo', () => {
    // Arrange
    const config = { apiUrl: '', isDev: false };

    // Act
    const create = () => createAuthRepository(config);

    // Assert
    expect(create).toThrow('Falta VITE_API_URL');
  });
});
