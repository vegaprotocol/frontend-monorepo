import * as React from 'react';
import { renderHook } from '@testing-library/react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { MockedProvider } from '@apollo/client/testing';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { MarketStateMapping, Schema } from '@vegaprotocol/types';
import type { ValidationProps } from './use-order-validation';
import { marketTranslations, useOrderValidation } from './use-order-validation';
import type { DealTicketMarketFragment } from '@vegaprotocol/deal-ticket';
import * as DealTicket from '@vegaprotocol/deal-ticket';
import BigNumber from 'bignumber.js';

jest.mock('@vegaprotocol/wallet');
jest.mock('@vegaprotocol/deal-ticket', () => {
  return {
    ...jest.requireActual('@vegaprotocol/deal-ticket'),
    useOrderMarginValidation: jest.fn(),
  };
});

type SettlementAsset =
  DealTicketMarketFragment['tradableInstrument']['instrument']['product']['settlementAsset'];
const asset: SettlementAsset = {
  __typename: 'Asset',
  id: 'asset-id',
  symbol: 'asset-symbol',
  name: 'asset-name',
  decimals: 2,
};

const market: DealTicketMarketFragment = {
  id: 'market-id',
  decimalPlaces: 2,
  positionDecimalPlaces: 1,
  tradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
  state: Schema.MarketState.STATE_ACTIVE,
  tradableInstrument: {
    __typename: 'TradableInstrument',
    instrument: {
      __typename: 'Instrument',
      id: 'instrument-id',
      name: 'instrument-name',
      product: {
        __typename: 'Future',
        quoteName: 'quote-name',
        settlementAsset: asset,
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
  orderType: Schema.OrderType.TYPE_MARKET,
  orderTimeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
  estMargin: {
    margin: '0,000001',
    totalFees: '0,000006',
    fees: {
      makerFee: '0,000003',
      liquidityFee: '0,000002',
      infrastructureFee: '0,000001',
    },
  },
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
  return renderHook(() => useOrderValidation({ ...defaultOrder, ...props }), {
    wrapper: MockedProvider,
  });
}

describe('useOrderValidation', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Returns empty string when given valid data', () => {
    jest.spyOn(DealTicket, 'useOrderMarginValidation').mockReturnValue({
      balance: new BigNumber(0),
      margin: new BigNumber(100),
      asset,
    });

    const { result } = setup();
    expect(result.current).toStrictEqual({
      isDisabled: false,
      message: ``,
      section: '',
    });
  });

  it('Returns an error message when no keypair found', () => {
    jest.spyOn(DealTicket, 'useOrderMarginValidation').mockReturnValue({
      balance: new BigNumber(0),
      margin: new BigNumber(100),
      asset,
    });
    const { result } = setup(defaultOrder, { pubKey: null });
    expect(result.current).toStrictEqual({
      isDisabled: false,
      message: ``,
      section: '',
    });
  });

  it.each`
    state
    ${Schema.MarketState.STATE_SETTLED}
    ${Schema.MarketState.STATE_REJECTED}
    ${Schema.MarketState.STATE_TRADING_TERMINATED}
    ${Schema.MarketState.STATE_CLOSED}
    ${Schema.MarketState.STATE_CANCELLED}
  `(
    'Returns an error message for market state when not accepting orders',
    ({ state }) => {
      const { result } = setup({ market: { ...defaultOrder.market, state } });
      expect(result.current).toStrictEqual({
        isDisabled: true,
        message: `This market is ${marketTranslations(
          state
        )} and not accepting orders`,
        section: 'sec-summary',
      });
    }
  );

  it.each`
    state
    ${Schema.MarketState.STATE_PENDING}
    ${Schema.MarketState.STATE_PROPOSED}
  `(
    'Returns an error message for market state suspended or pending',
    ({ state }) => {
      jest.spyOn(DealTicket, 'useOrderMarginValidation').mockReturnValue({
        balance: new BigNumber(0),
        margin: new BigNumber(100),
        asset,
      });
      const { result } = setup({
        market: {
          ...defaultOrder.market,
          state,
          tradingMode: Schema.MarketTradingMode.TRADING_MODE_BATCH_AUCTION,
        },
        orderType: Schema.OrderType.TYPE_LIMIT,
        orderTimeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTT,
      });
      expect(result.current).toStrictEqual({
        isDisabled: false,
        message: `This market is ${MarketStateMapping[
          state as Schema.MarketState
        ].toLowerCase()} and only accepting liquidity commitment orders`,
        section: 'sec-summary',
      });
    }
  );

  it.each`
    tradingMode                                                 | errorMessage
    ${Schema.MarketTradingMode.TRADING_MODE_BATCH_AUCTION}      | ${ERROR.MARKET_CONTINUOUS_LIMIT}
    ${Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION} | ${ERROR.MARKET_CONTINUOUS_LIMIT}
    ${Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION}    | ${ERROR.MARKET_CONTINUOUS_LIMIT}
  `(
    `Returns an error message when trying to submit a non-limit order for a "$tradingMode" market`,
    ({ tradingMode, errorMessage }) => {
      const { result } = setup({
        market: { ...defaultOrder.market, tradingMode },
        orderType: Schema.OrderType.TYPE_MARKET,
      });
      expect(result.current.isDisabled).toBeTruthy();
      expect(result.current.message).toBe(errorMessage);
    }
  );

  it.each`
    tradingMode                                                 | orderTimeInForce                             | errorMessage
    ${Schema.MarketTradingMode.TRADING_MODE_BATCH_AUCTION}      | ${Schema.OrderTimeInForce.TIME_IN_FORCE_FOK} | ${ERROR.MARKET_CONTINUOUS_TIF}
    ${Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION} | ${Schema.OrderTimeInForce.TIME_IN_FORCE_FOK} | ${ERROR.MARKET_CONTINUOUS_TIF}
    ${Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION}    | ${Schema.OrderTimeInForce.TIME_IN_FORCE_FOK} | ${ERROR.MARKET_CONTINUOUS_TIF}
    ${Schema.MarketTradingMode.TRADING_MODE_BATCH_AUCTION}      | ${Schema.OrderTimeInForce.TIME_IN_FORCE_IOC} | ${ERROR.MARKET_CONTINUOUS_TIF}
    ${Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION} | ${Schema.OrderTimeInForce.TIME_IN_FORCE_IOC} | ${ERROR.MARKET_CONTINUOUS_TIF}
    ${Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION}    | ${Schema.OrderTimeInForce.TIME_IN_FORCE_IOC} | ${ERROR.MARKET_CONTINUOUS_TIF}
    ${Schema.MarketTradingMode.TRADING_MODE_BATCH_AUCTION}      | ${Schema.OrderTimeInForce.TIME_IN_FORCE_GFN} | ${ERROR.MARKET_CONTINUOUS_TIF}
    ${Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION} | ${Schema.OrderTimeInForce.TIME_IN_FORCE_GFN} | ${ERROR.MARKET_CONTINUOUS_TIF}
    ${Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION}    | ${Schema.OrderTimeInForce.TIME_IN_FORCE_GFN} | ${ERROR.MARKET_CONTINUOUS_TIF}
  `(
    `Returns an error message when submitting a limit order with a "$orderTimeInForce" value to a "$tradingMode" market`,
    ({ tradingMode, orderTimeInForce, errorMessage }) => {
      const { result } = setup({
        market: { ...defaultOrder.market, tradingMode },
        orderType: Schema.OrderType.TYPE_LIMIT,
        orderTimeInForce,
      });
      expect(result.current).toStrictEqual({
        isDisabled: true,
        message: errorMessage,
        section: 'sec-force',
      });
    }
  );

  it.each`
    fieldName  | errorType     | section        | errorMessage
    ${`size`}  | ${`required`} | ${'sec-size'}  | ${ERROR.FIELD_SIZE_REQ}
    ${`size`}  | ${`min`}      | ${'sec-size'}  | ${ERROR.FIELD_SIZE_MIN}
    ${`price`} | ${`required`} | ${'sec-price'} | ${ERROR.FIELD_PRICE_REQ}
    ${`price`} | ${`min`}      | ${'sec-price'} | ${ERROR.FIELD_PRICE_MIN}
  `(
    `Returns an error message when the order $fieldName "$errorType" validation fails`,
    ({ fieldName, errorType, section, errorMessage }) => {
      const { result } = setup({
        fieldErrors: { [fieldName]: { type: errorType } },
        orderType: Schema.OrderType.TYPE_LIMIT,
      });
      expect(result.current).toStrictEqual({
        isDisabled: true,
        message: errorMessage,
        section,
      });
    }
  );

  it('Returns an error message when the order size incorrectly has decimal values', () => {
    const { result } = setup({
      market: { ...market, positionDecimalPlaces: 0 },
      fieldErrors: {
        size: { type: `validate`, message: DealTicket.ERROR_SIZE_DECIMAL },
      },
    });
    expect(result.current).toStrictEqual({
      isDisabled: true,
      message: ERROR.FIELD_PRICE_STEP_NULL,
      section: 'sec-size',
    });
  });

  it('Returns an error message when the order size has more decimals than allowed', () => {
    const { result } = setup({
      fieldErrors: {
        size: { type: `validate`, message: DealTicket.ERROR_SIZE_DECIMAL },
      },
    });
    expect(result.current).toStrictEqual({
      isDisabled: true,
      message: ERROR.FIELD_PRICE_STEP_DECIMAL,
      section: 'sec-size',
    });
  });

  it('Returns an error message when the estimated margin is higher than collateral', async () => {
    const invalidatedMockValue = {
      balance: new BigNumber(100),
      margin: new BigNumber(200),
      asset,
    };

    jest
      .spyOn(DealTicket, 'useOrderMarginValidation')
      .mockReturnValue(invalidatedMockValue);

    const { result } = setup({});

    expect(result.current.isDisabled).toBe(false);

    const testElement = (
      <DealTicket.MarginWarning
        margin={invalidatedMockValue.margin.toString()}
        balance={invalidatedMockValue.balance.toString()}
        asset={invalidatedMockValue.asset}
      />
    );
    expect((result.current.message as React.ReactElement)?.props).toEqual(
      testElement.props
    );
    expect((result.current.message as React.ReactElement)?.type).toEqual(
      testElement.type
    );
  });

  it.each`
    state
    ${Schema.MarketState.STATE_PENDING}
    ${Schema.MarketState.STATE_PROPOSED}
  `(
    'Returns error when market state is pending and size is wrong',
    ({ state }) => {
      const { result } = setup({
        fieldErrors: {
          size: { type: `validate`, message: DealTicket.ERROR_SIZE_DECIMAL },
        },
        market: {
          ...market,
          state,
        },
      });
      expect(result.current).toStrictEqual({
        isDisabled: true,
        message: ERROR.FIELD_PRICE_STEP_DECIMAL,
        section: 'sec-size',
      });
    }
  );
});
