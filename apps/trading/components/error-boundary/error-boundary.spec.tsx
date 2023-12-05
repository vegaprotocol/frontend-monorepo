import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './error-boundary';
import { localLoggerFactory } from '@vegaprotocol/logger';

jest.mock('@vegaprotocol/logger', () => ({
  localLoggerFactory: jest.fn(),
}));

describe('ErrorBoundary', () => {
  const mockLogError = jest.fn();
  const originalConsoleError = console.error;
  const mockLoggerFactory = localLoggerFactory as jest.Mock;

  beforeAll(() => {
    console.error = () => {};
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    mockLoggerFactory.mockImplementation(() => ({
      error: mockLogError,
    }));
  });

  afterEach(() => {
    mockLogError.mockClear();
  });

  it('renders children', () => {
    render(
      <ErrorBoundary feature="feature">
        <div data-testid="child" />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders fallback ui and logs an error', () => {
    const error = new Error('bork!');
    const BorkedComponent = () => {
      throw error;
    };

    render(
      <ErrorBoundary feature="test-feature">
        <BorkedComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(mockLogError).toHaveBeenCalledTimes(1);
    expect(mockLogError).toHaveBeenCalledWith(
      error.message,
      expect.stringContaining('componentStack')
    );
  });

  it('renders fallback render prop if error', () => {
    const error = new Error('bork!');
    const BorkedComponent = () => {
      throw error;
    };

    render(
      <ErrorBoundary
        feature="test-feature"
        fallback={<div data-testid="custom-ui" />}
      >
        <BorkedComponent />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('custom-ui')).toBeInTheDocument();
  });
});
