import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Mocked } from 'vitest';
import type { LoginActions, LoginState } from '@/features/auth/controller/useLoginController';
import { LoginView } from './LoginView';

function buildState(overrides: Partial<LoginState> = {}): LoginState {
  return {
    email: '',
    password: '',
    fieldErrors: {},
    formError: null,
    isSubmitting: false,
    isPasswordVisible: false,
    ...overrides,
  };
}

function buildActions(): Mocked<LoginActions> {
  return {
    changeEmail: vi.fn(),
    changePassword: vi.fn(),
    togglePasswordVisibility: vi.fn(),
    submit: vi.fn().mockResolvedValue(undefined),
  };
}

function renderView(state = buildState(), actions = buildActions()) {
  render(<LoginView state={state} actions={actions} />);
  return { actions, user: userEvent.setup() };
}

describe('LoginView', () => {
  it('muestra el título, los campos y el botón principal', () => {
    // Arrange — estado inicial

    // Act
    renderView();

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Inicia sesión' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Correo electrónico' })).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument();
  });

  it('no ofrece registro, solo indica dónde crear la cuenta', () => {
    // Arrange — estado inicial

    // Act
    renderView();

    // Assert
    expect(screen.queryByRole('button', { name: /crear cuenta|registr/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /crear cuenta|registr/i })).not.toBeInTheDocument();
    expect(screen.getByText('¿Aún no tienes cuenta? Créala desde la app de Nexus.')).toBeInTheDocument();
  });

  it('notifica al controlador lo que el usuario escribe', async () => {
    // Arrange
    const { actions, user } = renderView();

    // Act
    await user.type(screen.getByRole('textbox', { name: 'Correo electrónico' }), 'a');
    await user.type(screen.getByLabelText('Contraseña'), 'b');

    // Assert
    expect(actions.changeEmail).toHaveBeenLastCalledWith('a');
    expect(actions.changePassword).toHaveBeenLastCalledWith('b');
  });

  it('muestra los valores del estado', () => {
    // Arrange
    const state = buildState({ email: 'ana@nexus.app', password: 'secreta' });

    // Act
    renderView(state);

    // Assert
    expect(screen.getByRole('textbox', { name: 'Correo electrónico' })).toHaveValue('ana@nexus.app');
    expect(screen.getByLabelText('Contraseña')).toHaveValue('secreta');
  });

  it('envía al hacer clic en el botón principal', async () => {
    // Arrange
    const { actions, user } = renderView();

    // Act
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    // Assert
    expect(actions.submit).toHaveBeenCalledTimes(1);
  });

  it('envía al pulsar Enter dentro del formulario', async () => {
    // Arrange
    const { actions, user } = renderView();

    // Act
    await user.type(screen.getByLabelText('Contraseña'), 'x{Enter}');

    // Assert
    expect(actions.submit).toHaveBeenCalledTimes(1);
  });

  it('marca y describe los campos con error', () => {
    // Arrange
    const state = buildState({
      fieldErrors: { email: 'Escribe tu correo.', password: 'Escribe tu contraseña.' },
    });

    // Act
    renderView(state);

    // Assert
    const email = screen.getByRole('textbox', { name: 'Correo electrónico' });
    const password = screen.getByLabelText('Contraseña');
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription('Escribe tu correo.');
    expect(password).toHaveAttribute('aria-invalid', 'true');
    expect(password).toHaveAccessibleDescription('Escribe tu contraseña.');
  });

  it('anuncia el error general como alerta', () => {
    // Arrange
    const state = buildState({ formError: 'No pudimos conectarnos.' });

    // Act
    renderView(state);

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos conectarnos.');
  });

  it('bloquea el formulario mientras envía', () => {
    // Arrange
    const state = buildState({ isSubmitting: true });

    // Act
    renderView(state);

    // Assert
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('textbox', { name: 'Correo electrónico' })).toBeDisabled();
    expect(screen.getByLabelText('Contraseña')).toBeDisabled();
  });

  it('oculta la contraseña y permite mostrarla', async () => {
    // Arrange
    const { actions, user } = renderView();

    // Act
    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));

    // Assert
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password');
    expect(actions.togglePasswordVisibility).toHaveBeenCalledTimes(1);
    expect(actions.submit).not.toHaveBeenCalled();
  });

  it('con la contraseña visible ofrece ocultarla', () => {
    // Arrange
    const state = buildState({ isPasswordVisible: true });

    // Act
    renderView(state);

    // Assert
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('pone el foco en el correo al abrir la página', () => {
    // Arrange — estado inicial

    // Act
    renderView();

    // Assert
    expect(screen.getByRole('textbox', { name: 'Correo electrónico' })).toHaveFocus();
  });

  it('al tabular desde el correo pasa a la contraseña', async () => {
    // Arrange
    const { user } = renderView();

    // Act
    await user.tab();

    // Assert
    expect(screen.getByLabelText('Contraseña')).toHaveFocus();
  });
});
