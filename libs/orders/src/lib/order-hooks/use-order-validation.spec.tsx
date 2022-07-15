import { renderHook } from '@testing-library/react-hooks';
import {
  VegaWalletOrderTimeInForce,
  VegaWalletOrderType,
  useVegaWallet,
} from '@vegaprotocol/wallet';
import type {
  VegaWalletContextShape,
  VegaKeyExtended,
} from '@vegaprotocol/wallet';
import { MarketState, MarketTradingMode } from '@vegaprotocol/types';
import type { ValidationProps } from './use-order-validation';
import { marketTranslations } from './use-order-validation';
import { useOrderValidation } from './use-order-validation';
import { ERROR_SIZE_DECIMAL } from '../utils/validate-size';
import type { Market } from '../market';

jest.mock('@vegaprotocol/wallet');

const market: Market = {
  __typename: 'Market',
  id: 'market-id',
  decimalPlaces: 2,
  positionDecimalPlaces: 1,
  tradingMode: MarketTradingMode.Continuous,
  state: MarketState.Active,
  tradableInstrument: {
    __typename: 'TradableInstrument',
    instrument: {
      __typename: 'Instrument',
      product: {
        __typename: 'Future',
        quoteName: 'quote-name',
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
};

const defaultWalletContext = {
  keypair: {
    name: 'keypair0',
    tainted: false,
    pub: '111111__111111',
  } as VegaKeyExtended,
  keypairs: [],
  sendTx: jest.fn().mockReturnValue(Promise.resolve(null)),
  connect: jest.fn(),
  disconnect: jest.fn(),
  selectPublicKey: jest.fn(),
  connector: null,
};

const defaultOrder = {
  market,
  step: 0.1,
  orderType: VegaWalletOrderType.Market,
  orderTimeInForce: VegaWalletOrderTimeInForce.FOK,
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
    'Only GTT, GTC and GFA are permitted when market is in auction',
  FIELD_SIZE_REQ: 'You need to provide an amount',
  FIELD_SIZE_MIN: `The amount cannot be lower than "${defaultOrder.step}"`,
  FIELD_PRICE_REQ: 'You need to provide a price',
  FIELD_PRICE_MIN: 'The price cannot be negative',
  FIELD_PRICE_STEP_NULL: 'No decimal amounts allowed for this order',
  FIELD_PRICE_STEP_DECIMAL: `The amount field only takes up to ${market.positionDecimalPlaces} decimals`,
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
    const { result } = setup(defaultOrder, { keypair: null });
    expect(result.current).toStrictEqual({ isDisabled: false, message: `` });
  });

  it('Returns an error message when the keypair is tainted', () => {
    const { result } = setup(defaultOrder, {
      keypair: { ...defaultWalletContext.keypair, tainted: true },
    });
    expect(result.current).toStrictEqual({ isDisabled: false, message: `` });
  });

  it.each`
    state
    ${MarketState.Settled}
    ${MarketState.Rejected}
    ${MarketState.TradingTerminated}
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
    ${MarketState.Suspended}
    ${MarketState.Pending}
    ${MarketState.Cancelled}
    ${MarketState.Proposed}
    ${MarketState.Closed}
  `(
    'Returns an error message for market state suspended or pending',
    ({ state }) => {
      const { result } = setup({
        market: {
          ...defaultOrder.market,
          state,
          tradingMode: MarketTradingMode.BatchAuction,
        },
      });
      expect(result.current).toStrictEqual({
        isDisabled: false,
        message: `This market is ${state.toLowerCase()} and only accepting liquidity commitment orders`,
      });
    }
  );

  it.each`
    tradingMode                            | errorMessage
    ${MarketTradingMode.BatchAuction}      | ${ERROR.MARKET_CONTINUOUS_LIMIT}
    ${MarketTradingMode.MonitoringAuction} | ${ERROR.MARKET_CONTINUOUS_LIMIT}
    ${MarketTradingMode.OpeningAuction}    | ${ERROR.MARKET_CONTINUOUS_LIMIT}
  `(
    `Returns an error message when trying to submit a non-limit order for a "$tradingMode" market`,
    ({ tradingMode, errorMessage }) => {
      const { result } = setup({
        market: { ...defaultOrder.market, tradingMode },
        orderType: VegaWalletOrderType.Market,
      });
      expect(result.current).toStrictEqual({
        isDisabled: true,
        message: errorMessage,
      });
    }
  );

  it.each`
    tradingMode                            | orderTimeInForce                  | errorMessage
    ${MarketTradingMode.BatchAuction}      | ${VegaWalletOrderTimeInForce.FOK} | ${ERROR.MARKET_CONTINUOUS_TIF}
    ${MarketTradingMode.MonitoringAuction} | ${VegaWalletOrderTimeInForce.FOK} | ${ERROR.MARKET_CONTINUOUS_TIF}
    ${MarketTradingMode.OpeningAuction}    | ${VegaWalletOrderTimeInForce.FOK} | ${ERROR.MARKET_CONTINUOUS_TIF}
    ${MarketTradingMode.BatchAuction}      | ${VegaWalletOrderTimeInForce.IOC} | ${ERROR.MARKET_CONTINUOUS_TIF}
    ${MarketTradingMode.MonitoringAuction} | ${VegaWalletOrderTimeInForce.IOC} | ${ERROR.MARKET_CONTINUOUS_TIF}
    ${MarketTradingMode.OpeningAuction}    | ${VegaWalletOrderTimeInForce.IOC} | ${ERROR.MARKET_CONTINUOUS_TIF}
    ${MarketTradingMode.BatchAuction}      | ${VegaWalletOrderTimeInForce.GFN} | ${ERROR.MARKET_CONTINUOUS_TIF}
    ${MarketTradingMode.MonitoringAuction} | ${VegaWalletOrderTimeInForce.GFN} | ${ERROR.MARKET_CONTINUOUS_TIF}
    ${MarketTradingMode.OpeningAuction}    | ${VegaWalletOrderTimeInForce.GFN} | ${ERROR.MARKET_CONTINUOUS_TIF}
  `(
    `Returns an error message when submitting a limit order with a "$orderTimeInForce" value to a "$tradingMode" market`,
    ({ tradingMode, orderTimeInForce, errorMessage }) => {
      const { result } = setup({
        market: { ...defaultOrder.market, tradingMode },
        orderType: VegaWalletOrderType.Limit,
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

  it('Returns an error message when the order size has more decimals then allowed', () => {
    const { result } = setup({
      fieldErrors: { size: { type: `validate`, message: ERROR_SIZE_DECIMAL } },
    });
    expect(result.current).toStrictEqual({
      isDisabled: true,
      message: ERROR.FIELD_PRICE_STEP_DECIMAL,
    });
  });
});
