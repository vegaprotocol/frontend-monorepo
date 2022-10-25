import { renderHook } from '@testing-library/react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import {
  MarketState,
  MarketStateMapping,
  MarketTradingMode,
  OrderTimeInForce,
  OrderType,
} from '@vegaprotocol/types';
import type { ValidationProps } from './use-order-validation';
import { marketTranslations } from './use-order-validation';
import { useOrderValidation } from './use-order-validation';
import { ERROR_SIZE_DECIMAL } from './validate-size';
import type { DealTicketMarketFragment } from '../deal-ticket/__generated___/DealTicket';

jest.mock('@vegaprotocol/wallet');

const market: DealTicketMarketFragment = {
  id: 'market-id',
  decimalPlaces: 2,
  positionDecimalPlaces: 1,
  tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
  state: MarketState.STATE_ACTIVE,
  tradableInstrument: {
    __typename: 'TradableInstrument',
    instrument: {
      __typename: 'Instrument',
      id: 'instrument-id',
      name: 'instrument-name',
      product: {
        __typename: 'Future',
        quoteName: 'quote-name',
        settlementAsset: {
          __typename: 'Asset',
          id: 'asset-id',
          symbol: 'asset-symbol',
          name: 'asset-name',
          decimals: 2,
        },
      },
    },
  },
  depth: {
    __typename: 'MarketDepth',
    lastTrade: {
      __typename: 'Trade',
      price: '100',
    },
  },
  fees: {
    __typename: 'Fees',
    factors: {
      __typename: 'FeeFactors',
      makerFee: '1',
      infrastructureFee: '2',
      liquidityFee: '3',
    },
  },
};

const defaultWalletContext = {
  pubKey: '111111__111111',
  pubKeys: [],
  sendTx: jest.fn().mockReturnValue(Promise.resolve(null)),
  connect: jest.fn(),
  disconnect: jest.fn(),
  selectPubKey: jest.fn(),
  connector: null,
};

const defaultOrder = {
  market,
  step: 0.1,
  orderType: OrderType.TYPE_MARKET,
  orderTimeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
};

const ERROR = {
  KEY_MISSING: 'No public key selected',
  KEY_TAINTED: 'Selected public key has been tainted',
  MARKET_SUSPENDED: 'Market is currently suspended',
  MARKET_INACTIVE: 'Market is no longer active',
  MARKET_WAITING: 'Market is not active yet',
  MARKET_CONTINUOUS_LIMIT:
    'Only limit orders are permitted when market is in auction',
  MARKET_CONTINUOUS_TIF:
    'Until the auction ends, you can only place GFA, GTT, or GTC limit orders',
  FIELD_SIZE_REQ: 'You need to provide a size',
  FIELD_SIZE_MIN: `Size cannot be lower than "${defaultOrder.step}"`,
  FIELD_PRICE_REQ: 'You need to provide a price',
  FIELD_PRICE_MIN: 'The price cannot be negative',
  FIELD_PRICE_STEP_NULL: 'Order sizes must be in whole numbers for this market',
  FIELD_PRICE_STEP_DECIMAL: `The size field accepts up to ${market.positionDecimalPlaces} decimal places`,
};

function setup(
  props?: Partial<ValidationProps>,
  context?: Partial<VegaWalletContextShape>
) {
  const mockUseVegaWallet = useVegaWallet as jest.Mock;
  mockUseVegaWallet.mockReturnValue({ ...defaultWalletContext, context });
  return renderHook(() => useOrderValidation({ ...defaultOrder, ...props }));
}

describe('useOrderValidation', () => {
  it('Returns empty string when given valid data', () => {
    const { result } = setup();
    expect(result.current).toStrictEqual({ isDisabled: false, message: `` });
  });

  it('Returns an error message when no keypair found', () => {
    const { result } = setup(defaultOrder, { pubKey: null });
    expect(result.current).toStrictEqual({ isDisabled: false, message: `` });
  });

  it.each`
    state
    ${MarketState.STATE_SETTLED}
    ${MarketState.STATE_REJECTED}
    ${MarketState.STATE_TRADING_TERMINATED}
    ${MarketState.STATE_CLOSED}
    ${MarketState.STATE_CANCELLED}
  `(
    'Returns an error message for market state when not accepting orders',
    ({ state }) => {
      const { result } = setup({ market: { ...defaultOrder.market, state } });
      expect(result.current).toStrictEqual({
        isDisabled: true,
        message: `This market is ${marketTranslations(
          state
        )} and not accepting orders`,
      });
    }
  );

  it.each`
    state
    ${MarketState.STATE_PENDING}
    ${MarketState.STATE_PROPOSED}
  `(
    'Returns an error message for market state suspended or pending',
    ({ state }) => {
      const { result } = setup({
        market: {
          ...defaultOrder.market,
          state,
          tradingMode: MarketTradingMode.TRADING_MODE_BATCH_AUCTION,
        },
      });
      expect(result.current).toStrictEqual({
        isDisabled: false,
        message: `This market is ${MarketStateMapping[
          state as MarketState
        ].toLowerCase()} and only accepting liquidity commitment orders`,
      });
    }
  );

  it.each`
    tradingMode                                          | errorMessage
    ${MarketTradingMode.TRADING_MODE_BATCH_AUCTION}      | ${ERROR.MARKET_CONTINUOUS_LIMIT}
    ${MarketTradingMode.TRADING_MODE_MONITORING_AUCTION} | ${ERROR.MARKET_CONTINUOUS_LIMIT}
    ${MarketTradingMode.TRADING_MODE_OPENING_AUCTION}    | ${ERROR.MARKET_CONTINUOUS_LIMIT}
  `(
    `Returns an error message when trying to submit a non-limit order for a "$tradingMode" market`,
    ({ tradingMode, errorMessage }) => {
      const { result } = setup({
        market: { ...defaultOrder.market, tradingMode },
        orderType: OrderType.TYPE_MARKET,
      });
      expect(result.current.isDisabled).toBeTruthy();
      expect(result.current.message).toBe(errorMessage);
    }
  );

  it.each`
    tradingMode                                          | orderTimeInForce                      | errorMessage
    ${MarketTradingMode.TRADING_MODE_BATCH_AUCTION}      | ${OrderTimeInForce.TIME_IN_FORCE_FOK} | ${ERROR.MARKET_CONTINUOUS_TIF}
    ${MarketTradingMode.TRADING_MODE_MONITORING_AUCTION} | ${OrderTimeInForce.TIME_IN_FORCE_FOK} | ${ERROR.MARKET_CONTINUOUS_TIF}
    ${MarketTradingMode.TRADING_MODE_OPENING_AUCTION}    | ${OrderTimeInForce.TIME_IN_FORCE_FOK} | ${ERROR.MARKET_CONTINUOUS_TIF}
    ${MarketTradingMode.TRADING_MODE_BATCH_AUCTION}      | ${OrderTimeInForce.TIME_IN_FORCE_IOC} | ${ERROR.MARKET_CONTINUOUS_TIF}
    ${MarketTradingMode.TRADING_MODE_MONITORING_AUCTION} | ${OrderTimeInForce.TIME_IN_FORCE_IOC} | ${ERROR.MARKET_CONTINUOUS_TIF}
    ${MarketTradingMode.TRADING_MODE_OPENING_AUCTION}    | ${OrderTimeInForce.TIME_IN_FORCE_IOC} | ${ERROR.MARKET_CONTINUOUS_TIF}
    ${MarketTradingMode.TRADING_MODE_BATCH_AUCTION}      | ${OrderTimeInForce.TIME_IN_FORCE_GFN} | ${ERROR.MARKET_CONTINUOUS_TIF}
    ${MarketTradingMode.TRADING_MODE_MONITORING_AUCTION} | ${OrderTimeInForce.TIME_IN_FORCE_GFN} | ${ERROR.MARKET_CONTINUOUS_TIF}
    ${MarketTradingMode.TRADING_MODE_OPENING_AUCTION}    | ${OrderTimeInForce.TIME_IN_FORCE_GFN} | ${ERROR.MARKET_CONTINUOUS_TIF}
  `(
    `Returns an error message when submitting a limit order with a "$orderTimeInForce" value to a "$tradingMode" market`,
    ({ tradingMode, orderTimeInForce, errorMessage }) => {
      const { result } = setup({
        market: { ...defaultOrder.market, tradingMode },
        orderType: OrderType.TYPE_LIMIT,
        orderTimeInForce,
      });
      expect(result.current).toStrictEqual({
        isDisabled: true,
        message: errorMessage,
      });
    }
  );

  it.each`
    fieldName  | errorType     | errorMessage
    ${`size`}  | ${`required`} | ${ERROR.FIELD_SIZE_REQ}
    ${`size`}  | ${`min`}      | ${ERROR.FIELD_SIZE_MIN}
    ${`price`} | ${`required`} | ${ERROR.FIELD_PRICE_REQ}
    ${`price`} | ${`min`}      | ${ERROR.FIELD_PRICE_MIN}
  `(
    `Returns an error message when the order $fieldName "$errorType" validation fails`,
    ({ fieldName, errorType, errorMessage }) => {
      const { result } = setup({
        fieldErrors: { [fieldName]: { type: errorType } },
        orderType: OrderType.TYPE_LIMIT,
      });
      expect(result.current).toStrictEqual({
        isDisabled: true,
        message: errorMessage,
      });
    }
  );

  it('Returns an error message when the order size incorrectly has decimal values', () => {
    const { result } = setup({
      market: { ...market, positionDecimalPlaces: 0 },
      fieldErrors: { size: { type: `validate`, message: ERROR_SIZE_DECIMAL } },
    });
    expect(result.current).toStrictEqual({
      isDisabled: true,
      message: ERROR.FIELD_PRICE_STEP_NULL,
    });
  });

  it('Returns an error message when the order size has more decimals than allowed', () => {
    const { result } = setup({
      fieldErrors: { size: { type: `validate`, message: ERROR_SIZE_DECIMAL } },
    });
    expect(result.current).toStrictEqual({
      isDisabled: true,
      message: ERROR.FIELD_PRICE_STEP_DECIMAL,
    });
  });
});
