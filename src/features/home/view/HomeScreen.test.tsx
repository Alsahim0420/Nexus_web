import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/features/auth/controller/AuthController';
import { buildSession } from '@/test/builders';
import { FakeAuthRepository } from '@/test/fakes';
import { HomeScreen } from './HomeScreen';

async function renderAuthenticated() {
  const repository = new FakeAuthRepository();
  repository.getCurrentSession.mockResolvedValue(buildSession());
  render(
    <AuthProvider repository={repository}>
      <HomeScreen />
    </AuthProvider>,
  );
  await screen.findByText('Ana López');
  return { repository };
}

describe('HomeScreen', () => {
  it('muestra los datos de la cuenta conectada', async () => {
    // Arrange — sesión de Ana

    // Act
    await renderAuthenticated();

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Inicio' })).toBeInTheDocument();
    expect(screen.getByText('ana@nexus.app')).toBeInTheDocument();
  });

  it('cierra la sesión', async () => {
    // Arrange
    const user = userEvent.setup();
    const { repository } = await renderAuthenticated();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    // Assert
    await waitFor(() => expect(repository.logout).toHaveBeenCalledTimes(1));
  });
});
