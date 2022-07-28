import { render, screen, act } from '@testing-library/react';
import { TimeAgo } from './index';

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(0);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('Time ago', () => {
  it('should render successfully with string input', () => {
    const dateString = new Date().toString();
    render(<TimeAgo data-testid="date-string-input" date={dateString} />);

    expect(screen.getByTestId('date-string-input')).toBeInTheDocument();
  });

  it('should render successfully with date input', () => {
    const date = new Date();
    render(<TimeAgo data-testid="date-input" date={date} />);

    expect(screen.getByTestId('date-input')).toBeInTheDocument();
  });

  it('should show the correct amount of time ago', () => {
    const secondsToWait = 10;
    const date = new Date(-(secondsToWait * 1000));

    render(<TimeAgo data-testid="test-time-ago" date={date} />);

    expect(screen.getByTestId('test-time-ago')).toHaveTextContent(
      `${secondsToWait} seconds ago`
    );
  });

  it('should show the correct amount of time ago after time has advanced', () => {
    const date = new Date();

    render(<TimeAgo data-testid="test-time-elapsed" date={date} />);

    act(() => {
      jest.advanceTimersByTime(30000);
    });

    expect(screen.getByTestId('test-time-elapsed')).toHaveTextContent(
      `30 seconds ago`
    );
  });
});
