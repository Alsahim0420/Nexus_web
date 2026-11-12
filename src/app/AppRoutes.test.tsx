import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { AuthProvider } from '@/features/auth/controller/AuthController';
import { buildSession } from '@/test/builders';
import { FakeAuthRepository } from '@/test/fakes';
import { AppRoutes } from './AppRoutes';

function renderAt(path: string, repository: FakeAuthRepository) {
  render(
    <AuthProvider repository={repository}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('AppRoutes', () => {
  it('manda al login a quien entra a la zona privada sin sesión', async () => {
    // Arrange
    const repository = new FakeAuthRepository();

    // Act
    renderAt('/', repository);

    // Assert
    expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument();
  });

  it('manda al inicio a quien abre /login con sesión activa', async () => {
    // Arrange
    const repository = new FakeAuthRepository();
    repository.getCurrentSession.mockResolvedValue(buildSession());

    // Act
    renderAt('/login', repository);

    // Assert
    expect(await screen.findByRole('heading', { name: 'Inicio' })).toBeInTheDocument();
  });

  it('lleva al inicio después de iniciar sesión', async () => {
    // Arrange
    const repository = new FakeAuthRepository();
    repository.login.mockResolvedValue(buildSession());
    const user = userEvent.setup();
    renderAt('/login', repository);
    await user.type(await screen.findByRole('textbox', { name: 'Correo electrónico' }), 'ana@nexus.app');
    await user.type(screen.getByLabelText('Contraseña'), 'secreta123');

    // Act
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    // Assert
    expect(await screen.findByRole('heading', { name: 'Inicio' })).toBeInTheDocument();
  });

  it('vuelve al login al cerrar sesión', async () => {
    // Arrange
    const repository = new FakeAuthRepository();
    repository.getCurrentSession.mockResolvedValue(buildSession());
    const user = userEvent.setup();
    renderAt('/', repository);

    // Act
    await user.click(await screen.findByRole('button', { name: 'Cerrar sesión' }));

    // Assert
    expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument();
  });

  it('muestra una página amable para rutas que no existen', async () => {
    // Arrange
    const repository = new FakeAuthRepository();

    // Act
    renderAt('/no-existe', repository);

    // Assert
    expect(await screen.findByRole('heading', { name: 'Esta página no existe' })).toBeInTheDocument();
  });
});
