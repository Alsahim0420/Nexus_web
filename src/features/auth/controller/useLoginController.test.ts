import { act, renderHook } from '@testing-library/react';
import { AuthError } from '@/features/auth/model/AuthError';
import type { Credentials } from '@/features/auth/model/Credentials';
import type { Session } from '@/features/auth/model/Session';
import { buildSession } from '@/test/builders';
import { deferred } from '@/test/fakes';
import { useLoginController } from './useLoginController';

function setup() {
  const signIn = vi.fn<(c: Credentials) => Promise<Session>>().mockResolvedValue(buildSession());
  return { signIn };
}

function renderController(signIn: (c: Credentials) => Promise<Session>) {
  return renderHook(() => useLoginController({ signIn }));
}

describe('useLoginController', () => {
  it('arranca con el formulario vacío y sin errores', async () => {
    // Arrange
    const { signIn } = setup();

    // Act
    const { result } = renderController(signIn);

    // Assert
    expect(result.current.state).toEqual({
      email: '',
      password: '',
      fieldErrors: {},
      formError: null,
      isSubmitting: false,
      isPasswordVisible: false,
    });
  });

  it('actualiza los campos', async () => {
    // Arrange
    const { signIn } = setup();
    const { result } = renderController(signIn);

    // Act
    await act(() => {
      result.current.actions.changeEmail('ana@nexus.app');
      result.current.actions.changePassword('secreta123');
    });

    // Assert
    expect(result.current.state.email).toBe('ana@nexus.app');
    expect(result.current.state.password).toBe('secreta123');
  });

  it('muestra errores de validación y no llama a signIn', async () => {
    // Arrange
    const { signIn } = setup();
    const { result } = renderController(signIn);

    // Act
    await act(() => result.current.actions.submit());

    // Assert
    expect(signIn).not.toHaveBeenCalled();
    expect(result.current.state.fieldErrors).toEqual({
      email: 'Escribe tu correo.',
      password: 'Escribe tu contraseña.',
    });
  });

  it('limpia el error de un campo al editarlo', async () => {
    // Arrange
    const { signIn } = setup();
    const { result } = renderController(signIn);
    await act(() => result.current.actions.submit());

    // Act
    await act(() => result.current.actions.changeEmail('a'));

    // Assert
    expect(result.current.state.fieldErrors).toEqual({ password: 'Escribe tu contraseña.' });
  });

  it('envía las credenciales normalizadas', async () => {
    // Arrange
    const { signIn } = setup();
    const { result } = renderController(signIn);
    await act(() => {
      result.current.actions.changeEmail('  Ana@Nexus.app ');
      result.current.actions.changePassword('secreta123');
    });

    // Act
    await act(() => result.current.actions.submit());

    // Assert
    expect(signIn).toHaveBeenCalledWith({ email: 'ana@nexus.app', password: 'secreta123' });
  });

  it('marca isSubmitting mientras espera y lo apaga al terminar', async () => {
    // Arrange
    const pending = deferred<Session>();
    const signIn = vi.fn<(c: Credentials) => Promise<Session>>().mockReturnValue(pending.promise);
    const { result } = renderController(signIn);
    await act(() => {
      result.current.actions.changeEmail('ana@nexus.app');
      result.current.actions.changePassword('secreta123');
    });

    // Act
    let submitting!: Promise<void>;
    await act(() => {
      submitting = result.current.actions.submit();
    });
    const whilePending = result.current.state.isSubmitting;
    await act(async () => {
      pending.resolve(buildSession());
      await submitting;
    });

    // Assert
    expect(whilePending).toBe(true);
    expect(result.current.state.isSubmitting).toBe(false);
  });

  it('ignora un segundo envío mientras el primero sigue en curso', async () => {
    // Arrange
    const pending = deferred<Session>();
    const signIn = vi.fn<(c: Credentials) => Promise<Session>>().mockReturnValue(pending.promise);
    const { result } = renderController(signIn);
    await act(() => {
      result.current.actions.changeEmail('ana@nexus.app');
      result.current.actions.changePassword('secreta123');
    });

    // Act
    await act(() => {
      void result.current.actions.submit();
    });
    await act(() => {
      void result.current.actions.submit();
    });

    // Assert
    expect(signIn).toHaveBeenCalledTimes(1);
  });

  it('muestra el mensaje del error de autenticación', async () => {
    // Arrange
    const signIn = vi.fn<(c: Credentials) => Promise<Session>>().mockRejectedValue(new AuthError('invalid_credentials'));
    const { result } = renderController(signIn);
    await act(() => {
      result.current.actions.changeEmail('ana@nexus.app');
      result.current.actions.changePassword('mala');
    });

    // Act
    await act(() => result.current.actions.submit());

    // Assert
    expect(result.current.state.formError).toBe(
      'Correo o contraseña incorrectos. Revísalos e inténtalo de nuevo.',
    );
    expect(result.current.state.isSubmitting).toBe(false);
  });

  it('borra el error general cuando el usuario vuelve a escribir', async () => {
    // Arrange
    const signIn = vi.fn<(c: Credentials) => Promise<Session>>().mockRejectedValue(new AuthError('network'));
    const { result } = renderController(signIn);
    await act(() => {
      result.current.actions.changeEmail('ana@nexus.app');
      result.current.actions.changePassword('secreta123');
    });
    await act(() => result.current.actions.submit());

    // Act
    await act(() => result.current.actions.changePassword('secreta1234'));

    // Assert
    expect(result.current.state.formError).toBeNull();
  });

  it('alterna la visibilidad de la contraseña', async () => {
    // Arrange
    const { signIn } = setup();
    const { result } = renderController(signIn);

    // Act
    await act(() => result.current.actions.togglePasswordVisibility());

    // Assert
    expect(result.current.state.isPasswordVisible).toBe(true);
  });
});
