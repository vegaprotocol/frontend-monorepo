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
  it('should render successfully', () => {
    const dateString = new Date().toString();
    render(<TimeAgo data-testid="date" date={dateString} />);

    expect(screen.getByTestId('date')).toBeInTheDocument();
  });

  it('should show the correct amount of time ago', () => {
    const secondsToWait = 10;
    const date = new Date(-(secondsToWait * 1000)).toString();

    render(<TimeAgo data-testid="test-time-ago" date={date} />);

    expect(screen.getByTestId('test-time-ago')).toHaveTextContent(
      `${secondsToWait} seconds ago`
    );
  });

  it('should show the correct amount of time ago after time has advanced', () => {
    const date = new Date().toString();

    render(<TimeAgo data-testid="test-time-elapsed" date={date} />);

    act(() => {
      jest.advanceTimersByTime(30000);
    });

    expect(screen.getByTestId('test-time-elapsed')).toHaveTextContent(
      `30 seconds ago`
    );
  });
});
