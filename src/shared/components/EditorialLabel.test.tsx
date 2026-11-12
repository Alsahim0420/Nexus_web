import { render, screen } from '@testing-library/react';
import { EditorialLabel } from './EditorialLabel';

describe('EditorialLabel', () => {
  it('muestra la etiqueta y su número de sección', () => {
    // Arrange
    const props = { label: 'Acceso', trailing: '01' };

    // Act
    render(<EditorialLabel {...props} />);

    // Assert
    expect(screen.getByText('Acceso')).toBeInTheDocument();
    expect(screen.getByText('01')).toBeInTheDocument();
  });
});
