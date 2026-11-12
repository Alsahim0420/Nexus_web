import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PrimaryButton } from './PrimaryButton';

describe('PrimaryButton', () => {
  it('muestra la etiqueta y responde al clic', async () => {
    // Arrange
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<PrimaryButton onClick={onClick}>Iniciar sesión</PrimaryButton>);

    // Act
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    // Assert
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('en "loading" queda ocupado, deshabilitado y no responde', async () => {
    // Arrange
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <PrimaryButton loading onClick={onClick}>
        Iniciar sesión
      </PrimaryButton>,
    );
    const button = screen.getByRole('button', { name: 'Iniciar sesión' });

    // Act
    await user.click(button);

    // Assert
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });
});
