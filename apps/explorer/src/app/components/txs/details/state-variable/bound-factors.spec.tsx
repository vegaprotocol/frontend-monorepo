import { getValues } from './bound-factors';
import type { components } from '../../../../../types/explorer';

type kvb = components['schemas']['vegaKeyValueBundle'][];

describe('getValues', () => {
  it('handles an empty array by returning a dashed template', () => {
    const res = getValues([]);
    expect(res).toHaveProperty('down');
    expect(res.down).toHaveProperty('tolerance', '-');
    expect(res.down).toHaveProperty('value', '-');
    expect(res).toHaveProperty('up');
    expect(res.up).toHaveProperty('tolerance', '-');
    expect(res.up).toHaveProperty('value', '-');
  });

  it('handles undefined', () => {
    const res = getValues(undefined as unknown as kvb);
    expect(res).toHaveProperty('down');
    expect(res.down).toHaveProperty('tolerance', '-');
    expect(res.down).toHaveProperty('value', '-');
    expect(res).toHaveProperty('up');
    expect(res.up).toHaveProperty('tolerance', '-');
    expect(res.up).toHaveProperty('value', '-');
  });

  it('handles a kvb that only has one side (should not happen)', () => {
    const k: kvb = [
      {
        key: 'up',
        tolerance: '0.1',
        value: { vectorVal: { value: ['0.123'] } },
      },
    ];

    const res = getValues(k);
    expect(res).toHaveProperty('down');
    expect(res.down).toHaveProperty('tolerance', '-');
    expect(res.down).toHaveProperty('value', '-');
    expect(res).toHaveProperty('up');
    expect(res.up).toHaveProperty('tolerance', '0.1');
    expect(res.up).toHaveProperty('value', '0.123');
  });

  it('handles a kvb that has a matrixVal instead of a scalarval by ignoring it', () => {
    const k: kvb = [
      {
        key: 'up',
        tolerance: '0.1',
        value: { matrixVal: { value: [{ value: ['0.123'] }] } },
      },
    ];

    const res = getValues(k);
    expect(res).toHaveProperty('down');
    expect(res.down).toHaveProperty('tolerance', '-');
    expect(res.down).toHaveProperty('value', '-');
    expect(res).toHaveProperty('up');
    expect(res.up).toHaveProperty('tolerance', '0.1');
    expect(res.up).toHaveProperty('value', '-');
  });

  it('ignores unexpected extra values in the kvb', () => {
    const k: kvb = [
      {
        key: 'up',
        tolerance: '0.1',
        value: { vectorVal: { value: ['0.123', '0.77'] } },
      },
      {
        key: 'down',
        tolerance: '0.001',
        value: { vectorVal: { value: ['0.321'] } },
      },
    ];

    const res = getValues(k);
    expect(res).toHaveProperty('down');
    expect(res.down).toHaveProperty('tolerance', '0.001');
    expect(res.down).toHaveProperty('value', '0.321');
    expect(res).toHaveProperty('up');
    expect(res.up).toHaveProperty('tolerance', '0.1');
    expect(res.up).toHaveProperty('value', '0.123');
  });

  it('handles a full kvb', () => {
    const k: kvb = [
      {
        key: 'up',
        tolerance: '0.1',
        value: { vectorVal: { value: ['0.123'] } },
      },
      {
        key: 'down',
        tolerance: '0.001',
        value: { vectorVal: { value: ['0.321'] } },
      },
    ];

    const res = getValues(k);
    expect(res).toHaveProperty('down');
    expect(res.down).toHaveProperty('tolerance', '0.001');
    expect(res.down).toHaveProperty('value', '0.321');
    expect(res).toHaveProperty('up');
    expect(res.up).toHaveProperty('tolerance', '0.1');
    expect(res.up).toHaveProperty('value', '0.123');
  });
});
