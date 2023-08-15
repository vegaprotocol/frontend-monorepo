import type { InstrumentConfiguration } from '@vegaprotocol/types';
import { getMarketProductType } from './get-market-product-type';

describe('getMarketProductType', () => {
  it('should resolve product type properly', () => {
    expect(
      getMarketProductType({
        futureProduct: {
          quoteName: 'Market 1',
        },
      } as InstrumentConfiguration)
    ).toEqual('Future');
    expect(
      getMarketProductType({
        spotProduct: {
          quoteName: 'Market 1',
        },
      } as unknown as InstrumentConfiguration)
    ).toEqual('Spot');
    expect(
      getMarketProductType({
        perpetualProduct: {
          quoteName: 'Market 1',
        },
      } as unknown as InstrumentConfiguration)
    ).toEqual('Perpetual');
    expect(
      getMarketProductType({
        product: {
          __typename: 'Perpetual',
        },
        futureProduct: {
          quoteName: 'Market 1',
        },
      } as unknown as InstrumentConfiguration)
    ).toEqual('Perpetual');
    expect(
      getMarketProductType({
        product: {
          __typename: 'Spot',
        },
        futureProduct: {
          quoteName: 'Market 1',
        },
      } as unknown as InstrumentConfiguration)
    ).toEqual('Spot');
    expect(
      getMarketProductType({
        product: {
          __typename: 'Future',
        },
        perpetualProduct: {
          quoteName: 'Market 1',
        },
      } as unknown as InstrumentConfiguration)
    ).toEqual('Future');
  });
});
