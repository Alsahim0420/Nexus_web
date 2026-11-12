import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/features/auth/controller/AuthController';
import { AuthError } from '@/features/auth/model/AuthError';
import { buildSession } from '@/test/builders';
import { FakeAuthRepository } from '@/test/fakes';
import { LoginScreen } from './LoginScreen';

function renderScreen(repository: FakeAuthRepository) {
  render(
    <AuthProvider repository={repository}>
      <LoginScreen />
    </AuthProvider>,
  );
}

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup();
  await user.type(screen.getByRole('textbox', { name: 'Correo electrónico' }), email);
  await user.type(screen.getByLabelText('Contraseña'), password);
  await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
}

describe('LoginScreen (integración vista + controladores + repositorio)', () => {
  it('inicia sesión con el repositorio', async () => {
    // Arrange
    const repository = new FakeAuthRepository();
    repository.login.mockResolvedValue(buildSession());
    renderScreen(repository);

    // Act
    await fillAndSubmit('Ana@Nexus.app', 'secreta123');

    // Assert
    expect(repository.login).toHaveBeenCalledWith({ email: 'ana@nexus.app', password: 'secreta123' });
  });

  it('muestra el error cuando las credenciales son incorrectas', async () => {
    // Arrange
    const repository = new FakeAuthRepository();
    repository.login.mockRejectedValue(new AuthError('invalid_credentials'));
    renderScreen(repository);

    // Act
    await fillAndSubmit('ana@nexus.app', 'mala');

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Correo o contraseña incorrectos. Revísalos e inténtalo de nuevo.',
    );
  });

  it('valida antes de llamar al repositorio', async () => {
    // Arrange
    const repository = new FakeAuthRepository();
    renderScreen(repository);

    // Act
    await fillAndSubmit('no-es-correo', 'x');

    // Assert
    expect(screen.getByText('Ese correo no parece válido.')).toBeInTheDocument();
    expect(repository.login).not.toHaveBeenCalled();
  });
});
