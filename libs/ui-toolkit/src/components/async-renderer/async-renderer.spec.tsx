import { render, act, screen } from '@testing-library/react';
import { AsyncRenderer } from './async-renderer';

describe('AsyncRenderer', () => {
  const reload = jest.fn();
  it('timeout error should render button', async () => {
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

  it('errors should be handled properly', async () => {
    const message = 'Node has been collapsed';
    await act(() => {
      render(
        <AsyncRenderer
          reload={reload}
          error={new Error(message)}
          loading={false}
          data={[]}
        />
      );
    });

    expect(
      screen.getByText(`Something went wrong: ${message}`)
    ).toBeInTheDocument();
  });
});
