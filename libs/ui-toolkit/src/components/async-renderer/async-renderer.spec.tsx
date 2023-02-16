import { render, act, screen } from '@testing-library/react';
import { AsyncRenderer } from './async-renderer';

describe('AsyncRenderer', () => {
  it('timeout error should render button', async () => {
    const reload = jest.fn();
    await act(() => {
      render(
        <AsyncRenderer
          reload={reload}
          error={new Error('Timeout exceeded')}
          loading={false}
          data={undefined}
        />
      );
    });
    expect(screen.getByRole('button')).toBeInTheDocument();
    await act(() => {
      screen.getByRole('button').click();
    });
    expect(reload).toHaveBeenCalled();
  });
});
