import { update } from './market-depth-provider';

const mockCaptureException = jest.fn();
const reload = jest.fn();

jest.mock('@sentry/react', () => {
  const original = jest.requireActual('@sentry/react'); // Step 2.
  return {
    ...original,
    captureException: () => mockCaptureException(),
  };
});

jest.mock('./orderbook-data', () => ({
  updateLevels: jest.fn((arg) => arg),
}));

describe('market depth provider update', () => {
  beforeEach(() => {
    mockCaptureException.mockClear();
  });
  it('omits not matching market', () => {
    const data = {
      id: '1',
      depth: {
        sequenceNumber: '1',
      },
    };
    const delta = {
      marketId: '2',
      sequenceNumber: '',
      previousSequenceNumber: '',
    };
    const updatedData = update(data, [delta], reload);
    expect(updatedData).toBe(data);
  });

  it('omits overlapping updates', () => {
    const data = {
      id: '1',
      depth: {
        sequenceNumber: '10',
      },
    };
    const delta = [
      {
        marketId: '1',
        sequenceNumber: '5',
        previousSequenceNumber: '',
      },
      {
        marketId: '1',
        sequenceNumber: '10',
        previousSequenceNumber: '',
      },
    ];
    expect(update(data, delta.slice(0, 1), reload)).toBe(data);
    expect(update(data, delta.slice(1, 2), reload)).toBe(data);
    expect(mockCaptureException).toBeCalledTimes(2);
  });

  it('restarts and captureException when there is gap in updates', () => {
    const data = {
      id: '1',
      depth: {
        sequenceNumber: '10',
      },
    };
    const delta = [
      {
        marketId: '1',
        sequenceNumber: '16',
        previousSequenceNumber: '12',
      },
    ];
    const updatedData = update(data, delta, reload);
    expect(updatedData).toBe(data);
    expect(reload).toBeCalled();
    expect(mockCaptureException).toBeCalled();
  });
});
