import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextField } from './TextField';

describe('TextField', () => {
  it('asocia la etiqueta con el campo', () => {
    // Arrange
    const props = { id: 'email', label: 'Correo electrónico' };

    // Act
    render(<TextField {...props} />);

    // Assert
    expect(screen.getByRole('textbox', { name: 'Correo electrónico' })).toBeInTheDocument();
  });

  it('marca el campo inválido y lo describe con el error', () => {
    // Arrange
    const props = { id: 'email', label: 'Correo electrónico', error: 'Escribe tu correo.' };

    // Act
    render(<TextField {...props} />);

    // Assert
    const input = screen.getByRole('textbox', { name: 'Correo electrónico' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Escribe tu correo.');
  });

  it('sin error no marca el campo como inválido', () => {
    // Arrange
    const props = { id: 'email', label: 'Correo electrónico' };

    // Act
    render(<TextField {...props} />);

    // Assert
    expect(screen.getByRole('textbox', { name: 'Correo electrónico' })).not.toHaveAttribute('aria-invalid');
  });

  it('reenvía lo que se escribe', async () => {
    // Arrange
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<TextField id="email" label="Correo electrónico" onChange={onChange} />);

    // Act
    await user.type(screen.getByRole('textbox', { name: 'Correo electrónico' }), 'a');

    // Assert
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('muestra un elemento al final del campo', () => {
    // Arrange
    const trailing = <button type="button">Ver</button>;

    // Act
    render(<TextField id="pwd" label="Contraseña" type="password" trailing={trailing} />);

    // Assert
    expect(screen.getByRole('button', { name: 'Ver' })).toBeInTheDocument();
  });
});
