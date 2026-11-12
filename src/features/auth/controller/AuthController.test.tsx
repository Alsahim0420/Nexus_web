import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AuthError } from '@/features/auth/model/AuthError';
import { buildSession } from '@/test/builders';
import { FakeAuthRepository, deferred } from '@/test/fakes';
import { AuthProvider, useAuth } from './AuthController';

function setup(repository = new FakeAuthRepository()) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider repository={repository}>{children}</AuthProvider>
  );
  return { repository, wrapper };
}

describe('AuthController', () => {
  it('arranca en "loading" mientras restaura la sesión', () => {
    // Arrange
    const { repository, wrapper } = setup();
    repository.getCurrentSession.mockReturnValue(deferred<null>().promise);

    // Act
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Assert
    expect(result.current.status).toBe('loading');
  });

  it('queda "authenticated" si hay una sesión guardada', async () => {
    // Arrange
    const { repository, wrapper } = setup();
    repository.getCurrentSession.mockResolvedValue(buildSession());

    // Act
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Assert
    await waitFor(() => expect(result.current.status).toBe('authenticated'));
    expect(result.current.session).toEqual(buildSession());
  });

  it('queda "unauthenticated" si no hay sesión', async () => {
    // Arrange
    const { wrapper } = setup();

    // Act
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Assert
    await waitFor(() => expect(result.current.status).toBe('unauthenticated'));
    expect(result.current.session).toBeNull();
  });

  it('queda "unauthenticated" si restaurar la sesión falla', async () => {
    // Arrange
    const { repository, wrapper } = setup();
    repository.getCurrentSession.mockRejectedValue(new Error('storage roto'));

    // Act
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Assert
    await waitFor(() => expect(result.current.status).toBe('unauthenticated'));
  });

  it('signIn guarda la sesión devuelta por el repositorio', async () => {
    // Arrange
    const { repository, wrapper } = setup();
    repository.login.mockResolvedValue(buildSession());
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe('unauthenticated'));

    // Act
    await act(() => result.current.signIn({ email: 'ana@nexus.app', password: 'x' }));

    // Assert
    expect(repository.login).toHaveBeenCalledWith({ email: 'ana@nexus.app', password: 'x' });
    expect(result.current.status).toBe('authenticated');
    expect(result.current.session).toEqual(buildSession());
  });

  it('signIn propaga el error y no cambia el estado', async () => {
    // Arrange
    const { repository, wrapper } = setup();
    repository.login.mockRejectedValue(new AuthError('invalid_credentials'));
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe('unauthenticated'));

    // Act
    let caught: unknown;
    await act(async () => {
      caught = await result.current.signIn({ email: 'a@b.co', password: 'x' }).catch((e) => e);
    });

    // Assert
    expect(caught).toMatchObject({ code: 'invalid_credentials' });
    expect(result.current.status).toBe('unauthenticated');
  });

  it('signOut cierra la sesión en el repositorio', async () => {
    // Arrange
    const { repository, wrapper } = setup();
    repository.getCurrentSession.mockResolvedValue(buildSession());
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe('authenticated'));

    // Act
    await act(() => result.current.signOut());

    // Assert
    expect(repository.logout).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe('unauthenticated');
    expect(result.current.session).toBeNull();
  });

  it('useAuth falla con un mensaje claro fuera del AuthProvider', () => {
    // Arrange
    const silence = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    // Act
    const render = () => renderHook(() => useAuth());

    // Assert
    expect(render).toThrow('useAuth debe usarse dentro de <AuthProvider>');
    silence.mockRestore();
  });
});
