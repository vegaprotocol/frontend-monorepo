import { render, screen, act } from '@testing-library/react';
import { SecondsAgo } from './index';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('Seconds ago', () => {
  it('should render successfully', () => {
    const dateInString = new Date().toString();
    render(<SecondsAgo data-testid="test-seconds-ago" date={dateInString} />);

    expect(screen.getByTestId('test-seconds-ago')).toBeInTheDocument();
  });

  it('should show the correct amount of seconds ago', (done) => {
    const secondsToWait = 10;
    const dateInString = new Date().toString();

    act(() => {
      jest.advanceTimersByTime(secondsToWait * 1000);
    });

    jest.runOnlyPendingTimers();

    render(<SecondsAgo data-testid="test-seconds-ago" date={dateInString} />);

    expect(screen.getByTestId('test-seconds-ago')).toHaveTextContent(
      `${secondsToWait} seconds ago`
    );
  });
});
