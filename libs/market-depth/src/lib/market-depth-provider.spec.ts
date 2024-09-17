import { update } from './market-depth-provider';

const reload = jest.fn();

jest.mock('./orderbook-data', () => ({
  updateLevels: jest.fn((arg) => arg),
}));

describe('market depth provider update', () => {
  it('omits not matching market', () => {
    const data = {
      id: '1',
      depth: {
        sequenceNumber: '1',
        buy: [],
        sell: [],
      },
    };
    const delta = {
      marketId: '2',
      sequenceNumber: '',
      previousSequenceNumber: '',
    };
    const updatedData = update(data, [delta], reload, { marketId: '1' });
    expect(updatedData).toBe(data);
  });

  it('omits overlapping updates', () => {
    const data = {
      id: '1',
      depth: {
        sequenceNumber: '10',
        buy: [],
        sell: [],
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
    expect(update(data, delta.slice(0, 1), reload, { marketId: '1' })).toBe(
      data
    );
    expect(update(data, delta.slice(1, 2), reload, { marketId: '1' })).toBe(
      data
    );
  });

  it('restarts and captureException when there is gap in updates', () => {
    const data = {
      id: '1',
      depth: {
        sequenceNumber: '10',
        buy: [],
        sell: [],
      },
    };
    const delta = [
      {
        marketId: '1',
        sequenceNumber: '16',
        previousSequenceNumber: '12',
      },
    ];
    const updatedData = update(data, delta, reload, { marketId: '1' });
    expect(updatedData).toBe(data);
    expect(reload).toBeCalled();
  });
});
