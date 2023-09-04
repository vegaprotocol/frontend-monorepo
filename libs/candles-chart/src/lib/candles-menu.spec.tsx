import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CandlesMenu } from './candles-menu';

describe('CandlesMenu', () => {
  it('should render with the correct default studies', async () => {
    render(<CandlesMenu />);

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Studies',
      })
    );
    expect(await screen.findByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Volume')).toHaveAttribute('data-state', 'checked');
    expect(screen.getByText('MACD')).toHaveAttribute('data-state', 'checked');
  });

  it('should render with the correct default overlays', async () => {
    render(<CandlesMenu />);

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Overlays',
      })
    );
    expect(await screen.findByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Moving average')).toHaveAttribute(
      'data-state',
      'checked'
    );
  });
});
