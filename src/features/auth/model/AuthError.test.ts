import { AuthError, authErrorMessage } from './AuthError';

describe('AuthError', () => {
  it('conserva el código y es instancia de Error', () => {
    // Arrange
    const code = 'invalid_credentials' as const;

    // Act
    const error = new AuthError(code);

    // Assert
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AuthError);
    expect(error.code).toBe('invalid_credentials');
  });
});

describe('authErrorMessage', () => {
  it.each([
    ['invalid_credentials', 'Correo o contraseña incorrectos. Revísalos e inténtalo de nuevo.'],
    ['network', 'No pudimos conectarnos. Revisa tu internet e inténtalo de nuevo.'],
    ['rate_limited', 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'],
    ['account_disabled', 'Tu cuenta está desactivada. Escríbenos a soporte para revisarla.'],
    ['unknown', 'Algo salió mal. Inténtalo de nuevo en unos minutos.'],
  ] as const)('traduce "%s" a un mensaje para el usuario', (code, expected) => {
    // Arrange
    const error = new AuthError(code);

    // Act
    const message = authErrorMessage(error);

    // Assert
    expect(message).toBe(expected);
  });

  it('usa el mensaje genérico para errores que no son de autenticación', () => {
    // Arrange
    const error = new TypeError('boom');

    // Act
    const message = authErrorMessage(error);

    // Assert
    expect(message).toBe('Algo salió mal. Inténtalo de nuevo en unos minutos.');
  });
});
