import { MarketTradingMode } from '@vegaprotocol/enums';

import { getMarketPriceAssetId, isActiveMarket } from './markets';

describe('isActiveMarket', () => {
  it('should return true for CONTINUOUS trading mode', () => {
    const market = {
      tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
    };
    expect(isActiveMarket(market)).toBe(true);
  });

  it('should return true for MONITORING_AUCTION trading mode', () => {
    const market = {
      tradingMode: MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
    };
    expect(isActiveMarket(market)).toBe(true);
  });

  it('should return false for undefined trading mode', () => {
    const market = {
      tradingMode: undefined,
    };
    expect(isActiveMarket(market)).toBe(false);
  });

  it('should return false for other trading modes', () => {
    const market = {
      tradingMode: MarketTradingMode.TRADING_MODE_NO_TRADING,
    };
    expect(isActiveMarket(market)).toBe(false);
  });

  it('should return false for null trading mode', () => {
    const market = {
      tradingMode: undefined,
    };
    expect(isActiveMarket(market)).toBe(false);
  });
});

describe('getMarketPriceAssetId', () => {
  it('should return the settlement asset ID for a future market', () => {
    const market = {
      id: 'market1',
      tradableInstrument: {
        instrument: {
          future: {
            settlementAsset: 'asset1',
          },
        },
      },
    };
    expect(getMarketPriceAssetId(market)).toBe('asset1');
  });

  it('should return the settlement asset ID for a perpetual market', () => {
    const market = {
      id: 'market2',
      tradableInstrument: {
        instrument: {
          perpetual: {
            settlementAsset: 'asset2',
          },
        },
      },
    };
    expect(getMarketPriceAssetId(market)).toBe('asset2');
  });

  it('should return the quote asset ID for a spot market', () => {
    const market = {
      id: 'market2',
      tradableInstrument: {
        instrument: {
          spot: {
            quoteAsset: 'asset3',
          },
        },
      },
    };
    expect(getMarketPriceAssetId(market)).toBe('asset3');
  });

  it('should throw an error if no settlement asset is found', () => {
    const market = {
      id: 'market3',
      tradableInstrument: {
        instrument: {
          future: {},
          perpetual: {},
        },
      },
    };
    expect(() => getMarketPriceAssetId(market)).toThrow(
      'Could not find settlement asset from market market3'
    );
  });

  it('should handle undefined tradableInstrument', () => {
    const market = {
      id: 'market4',
    };
    expect(() => getMarketPriceAssetId(market)).toThrow(
      'Could not find settlement asset from market market4'
    );
  });
});
