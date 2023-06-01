import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataGridNoRowsOverlay } from './overlays';

describe('DataGridNoRowsOverlay', () => {
  it('renders a no data message if no error provided', () => {
    const message = 'my message';
    const { rerender } = render(<DataGridNoRowsOverlay error={undefined} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
    rerender(<DataGridNoRowsOverlay error={undefined} message={message} />);
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('renders an error message with a reload button if provided', async () => {
    const mockReload = jest.fn();
    const error = new Error('Timeout exceeded');
    const { rerender } = render(<DataGridNoRowsOverlay error={error} />);
    expect(screen.getByText(error.message)).toBeInTheDocument();
    rerender(<DataGridNoRowsOverlay error={error} reload={mockReload} />);
    await userEvent.click(screen.getByText('Try again'));
    expect(mockReload).toHaveBeenCalledTimes(1);
  });
});
