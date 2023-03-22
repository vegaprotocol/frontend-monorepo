import { parseLevel, updateLevels } from './depth-chart-utils';

describe('parseLevel', () => {
  it('should parse valid raw price levels', () => {
    expect(parseLevel({ price: '132', volume: '4567' })).toEqual({
      price: 132,
      volume: 4567,
    });
  });

  it('should parse valid raw price levels with non-zero decimal places', () => {
    expect(parseLevel({ price: '132', volume: '4567' }, 2, 4)).toEqual({
      price: 1.32,
      volume: 0.4567,
    });
  });
});

describe('updateLevels', () => {
  it('should update by adding price levels', () => {
    const priceLevels = [
      { price: 1.28, volume: 100 },
      { price: 1.35, volume: 200 },
    ];

    const updates = [
      { price: '132', volume: '200' },
      { price: '131', volume: '150' },
    ];

    expect(updateLevels(priceLevels, updates, 2, 0)).toEqual([
      { price: 1.28, volume: 100 },
      { price: 1.31, volume: 150 },
      { price: 1.32, volume: 200 },
      { price: 1.35, volume: 200 },
    ]);
  });

  it('should update by updating price levels', () => {
    const priceLevels = [
      { price: 1.28, volume: 100 },
      { price: 1.3, volume: 200 },
      { price: 1.35, volume: 300 },
    ];
    const updates = [{ price: '135', volume: '200' }];

    expect(updateLevels(priceLevels, updates, 2, 0)).toEqual([
      { price: 1.28, volume: 100 },
      { price: 1.3, volume: 200 },
      { price: 1.35, volume: 200 },
    ]);
  });

  it('should update by removing price levels', () => {
    const priceLevels = [
      { price: 1.28, volume: 100 },
      { price: 1.3, volume: 200 },
      { price: 1.35, volume: 300 },
    ];

    const updates = [{ price: '130', volume: '0' }];

    expect(updateLevels(priceLevels, updates, 2, 0)).toEqual([
      { price: 1.28, volume: 100 },
      { price: 1.35, volume: 300 },
    ]);
  });

  it('should update by adding price levels in reverse order', () => {
    const priceLevels = [
      { price: 1.35, volume: 200 },
      { price: 1.28, volume: 100 },
    ];

    const updates = [{ price: '132', volume: '200' }];

    expect(updateLevels(priceLevels, updates, 2, 0, false)).toEqual([
      { price: 1.35, volume: 200 },
      { price: 1.32, volume: 200 },
      { price: 1.28, volume: 100 },
    ]);
  });
});
