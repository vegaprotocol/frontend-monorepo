import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CandlesMenu } from './candles-menu';

describe('CandlesMenu', () => {
  it('should render with volume study showing by default', async () => {
    render(<CandlesMenu />);

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Studies',
      })
    );
    expect(await screen.findByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Volume')).toHaveAttribute('data-state', 'checked');
  });
});
