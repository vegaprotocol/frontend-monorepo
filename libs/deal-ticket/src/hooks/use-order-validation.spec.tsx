import type { ReactNode } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { OrderTimeInForce, OrderType, useVegaWallet } from '@vegaprotocol/wallet';
import type { VegaWalletContextShape, VegaKeyExtended } from '@vegaprotocol/wallet';
import { MarketState, MarketTradingMode } from '@vegaprotocol/types';
import type { ValidationProps } from './use-order-validation';
import { useOrderValidation } from './use-order-validation';
import type { DealTicketQuery_market } from '../__generated__/DealTicketQuery';
import { ERROR_SIZE_DECIMAL } from '../utils/validate-size';

jest.mock('@vegaprotocol/wallet');

const market: DealTicketQuery_market = {
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
  orderType: OrderType.Market,
  orderTimeInForce: OrderTimeInForce.FOK,
};

const ERROR = {
  KEY_MISSING: 'No public key selected',
  KEY_TAINTED: 'Selected public key has been tainted',
  MARKET_SUSPENDED: 'Market is currently suspended',
  MARKET_INACTIVE: 'Market is no longer active',
  MARKET_WAITING: 'Market is not active yet',
  MARKET_CONTINUOUS_LIMIT:
    'Only limit orders are permitted when market is in auction',
  MARKET_COUNTINUOUS_TIF:
    'Only GTT, GTC and GFA are permitted when market is in auction',
  FIELD_SIZE_REQ: 'An amount needs to be provided',
  FIELD_SIZE_MIN: `The amount cannot be lower than "${defaultOrder.step}"`,
  FIELD_PRICE_REQ: 'A price needs to be provided',
  FIELD_PRICE_MIN: 'The price cannot be negative',
  FIELD_PRICE_STEP_NULL: 'No decimal amounts allowed for this order',
  FIELD_PRICE_STEP_DECIMAL:
    `The amount field only takes up to ${market.positionDecimalPlaces} decimals`,
};

function setup(
  props?: Partial<ValidationProps>,
  context?: Partial<VegaWalletContextShape>
) {
  const mockUseVegaWallet = useVegaWallet as jest.Mock;
  mockUseVegaWallet.mockReturnValue({ ...defaultWalletContext, context });
  return renderHook(() => useOrderValidation({ ...defaultOrder, ...props }));
}

it('Returns empty string when given valid data', () => {
  const { result } = setup();
  expect(result.current).toEqual('');
});

it('Returns an error message when no keypair found', async () => {
  const { result } = setup(defaultOrder, { keypair: null });
  expect(result.current).toEqual('');
});

it('Returns an error message when the keypair is tainted', async () => {
  const { result } = setup(defaultOrder, {
    keypair: { ...defaultWalletContext.keypair, tainted: true },
  });
  expect(result.current).toEqual('');
});

it.each`
  state                            | errorMessage
  ${MarketState.Cancelled}         | ${ERROR.MARKET_INACTIVE}
  ${MarketState.Closed}            | ${ERROR.MARKET_INACTIVE}
  ${MarketState.Rejected}          | ${ERROR.MARKET_INACTIVE}
  ${MarketState.Settled}           | ${ERROR.MARKET_INACTIVE}
  ${MarketState.TradingTerminated} | ${ERROR.MARKET_INACTIVE}
  ${MarketState.Suspended}         | ${ERROR.MARKET_SUSPENDED}
  ${MarketState.Pending}           | ${ERROR.MARKET_WAITING}
  ${MarketState.Proposed}          | ${ERROR.MARKET_WAITING}
`(
  'Returns an error message for "$marketState" market',
  async ({ state, errorMessage }) => {
    const { result } = setup({ market: { ...defaultOrder.market, state } });
    expect(result.current).toEqual(errorMessage);
  }
);

it.each`
  tradingMode                            | errorMessage
  ${MarketTradingMode.BatchAuction}      | ${ERROR.MARKET_CONTINUOUS_LIMIT}
  ${MarketTradingMode.MonitoringAuction} | ${ERROR.MARKET_CONTINUOUS_LIMIT}
  ${MarketTradingMode.OpeningAuction}    | ${ERROR.MARKET_CONTINUOUS_LIMIT}
`(
  'Returns an error message when trying to submit a non-limit order for a "$tradingMode" market',
  async ({ tradingMode, errorMessage }) => {
    const { result } = setup({
      market: { ...defaultOrder.market, tradingMode },
      orderType: OrderType.Market,
    });
    expect(result.current).toEqual(errorMessage);
  }
);

it.each`
  tradingMode                            | orderTimeInForce        | errorMessage
  ${MarketTradingMode.BatchAuction}      | ${OrderTimeInForce.FOK} | ${ERROR.MARKET_COUNTINUOUS_TIF}
  ${MarketTradingMode.MonitoringAuction} | ${OrderTimeInForce.FOK} | ${ERROR.MARKET_COUNTINUOUS_TIF}
  ${MarketTradingMode.OpeningAuction}    | ${OrderTimeInForce.FOK} | ${ERROR.MARKET_COUNTINUOUS_TIF}
  ${MarketTradingMode.BatchAuction}      | ${OrderTimeInForce.IOC} | ${ERROR.MARKET_COUNTINUOUS_TIF}
  ${MarketTradingMode.MonitoringAuction} | ${OrderTimeInForce.IOC} | ${ERROR.MARKET_COUNTINUOUS_TIF}
  ${MarketTradingMode.OpeningAuction}    | ${OrderTimeInForce.IOC} | ${ERROR.MARKET_COUNTINUOUS_TIF}
  ${MarketTradingMode.BatchAuction}      | ${OrderTimeInForce.GFN} | ${ERROR.MARKET_COUNTINUOUS_TIF}
  ${MarketTradingMode.MonitoringAuction} | ${OrderTimeInForce.GFN} | ${ERROR.MARKET_COUNTINUOUS_TIF}
  ${MarketTradingMode.OpeningAuction}    | ${OrderTimeInForce.GFN} | ${ERROR.MARKET_COUNTINUOUS_TIF}
`(
  'Returns an error message when submitting a limit order with a "$orderTimeInForce" value to a "$tradingMode" market',
  async ({ tradingMode, orderTimeInForce, errorMessage }) => {
    const { result } = setup({
      market: { ...defaultOrder.market, tradingMode },
      orderType: OrderType.Limit,
      orderTimeInForce,
    });
    expect(result.current).toEqual(errorMessage);
  }
);

it.each`
  fieldName  | errorType     | errorMessage
  ${'size'}  | ${'required'} | ${ERROR.FIELD_SIZE_REQ}
  ${'size'}  | ${'min'}      | ${ERROR.FIELD_SIZE_MIN}
  ${'price'} | ${'required'} | ${ERROR.FIELD_PRICE_REQ}
  ${'price'} | ${'min'}      | ${ERROR.FIELD_PRICE_MIN}
`(
  'Returns an error message when the order $fieldName "$errorType" validation fails',
  async ({ fieldName, errorType, errorMessage }) => {
    const { result } = setup({
      fieldErrors: { [fieldName]: { type: errorType } },
    });
    expect(result.current).toEqual(errorMessage);
  }
);

it('Returns an error message when the order size incorrectly has decimal values', async () => {
  const { result } = setup({
    market: { ...market, positionDecimalPlaces: 0 },
    fieldErrors: { size: { type: 'validate', message: ERROR_SIZE_DECIMAL } },
  });
  expect(result.current).toEqual(ERROR.FIELD_PRICE_STEP_NULL);
});

it('Returns an error message when the order size has more decimals then allowed', async () => {
  const { result } = setup({
    fieldErrors: { size: { type: 'validate', message: ERROR_SIZE_DECIMAL } },
  });
  expect(result.current).toEqual(ERROR.FIELD_PRICE_STEP_DECIMAL);
});
