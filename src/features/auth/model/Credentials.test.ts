import { validateCredentials } from './Credentials';

describe('validateCredentials', () => {
  it('acepta un correo y una contraseña válidos', () => {
    // Arrange
    const input = { email: 'ana@nexus.app', password: 'secreta123' };

    // Act
    const result = validateCredentials(input);

    // Assert
    expect(result).toEqual({
      ok: true,
      credentials: { email: 'ana@nexus.app', password: 'secreta123' },
    });
  });

  it('normaliza el correo quitando espacios y mayúsculas', () => {
    // Arrange
    const input = { email: '  Ana@Nexus.APP ', password: 'secreta123' };

    // Act
    const result = validateCredentials(input);

    // Assert
    expect(result.ok && result.credentials.email).toBe('ana@nexus.app');
  });

  it('no recorta la contraseña porque los espacios pueden ser parte de ella', () => {
    // Arrange
    const input = { email: 'ana@nexus.app', password: ' con espacios ' };

    // Act
    const result = validateCredentials(input);

    // Assert
    expect(result.ok && result.credentials.password).toBe(' con espacios ');
  });

  it('pide el correo cuando viene vacío', () => {
    // Arrange
    const input = { email: '   ', password: 'secreta123' };

    // Act
    const result = validateCredentials(input);

    // Assert
    expect(result).toEqual({ ok: false, errors: { email: 'Escribe tu correo.' } });
  });

  it.each(['ana', 'ana@', 'ana@nexus', '@nexus.app', 'ana nexus@app.com'])(
    'rechaza el correo con formato inválido "%s"',
    (email) => {
      // Arrange
      const input = { email, password: 'secreta123' };

      // Act
      const result = validateCredentials(input);

      // Assert
      expect(result).toEqual({ ok: false, errors: { email: 'Ese correo no parece válido.' } });
    },
  );

  it('pide la contraseña cuando viene vacía', () => {
    // Arrange
    const input = { email: 'ana@nexus.app', password: '' };

    // Act
    const result = validateCredentials(input);

    // Assert
    expect(result).toEqual({ ok: false, errors: { password: 'Escribe tu contraseña.' } });
  });

  it('reporta los dos errores a la vez', () => {
    // Arrange
    const input = { email: '', password: '' };

    // Act
    const result = validateCredentials(input);

    // Assert
    expect(result).toEqual({
      ok: false,
      errors: { email: 'Escribe tu correo.', password: 'Escribe tu contraseña.' },
    });
  });
});
