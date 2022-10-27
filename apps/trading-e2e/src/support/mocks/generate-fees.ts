import { Schema as Types } from '@vegaprotocol/types';
import type {
  EstimateOrderQuery,
  MarketMarkPriceQuery,
  PartyBalanceQuery,
  PartyMarketDataQuery,
} from '@vegaprotocol/deal-ticket';

const estimateOrderMock: EstimateOrderQuery = {
  estimateOrder: {
    __typename: 'OrderEstimate',
    totalFeeAmount: '0.0006',
    fee: {
      __typename: 'TradeFee',
      makerFee: '0.0001',
      infrastructureFee: '0.0002',
      liquidityFee: '0.0003',
    },
    marginLevels: { __typename: 'MarginLevels', initialLevel: '1000' },
  },
};

export const generateEstimateOrder = () => {
  return estimateOrderMock;
};

const marketMarkPriceMock: MarketMarkPriceQuery = {
  market: {
    __typename: 'Market',
    decimalPlaces: 0,
    data: {
      __typename: 'MarketData',
      markPrice: '0.01',
      market: { __typename: 'Market', id: 'market-0' },
    },
  },
};

export const generateMarkPrice = () => {
  return marketMarkPriceMock;
};

const partyBalanceMock: PartyBalanceQuery = {
  party: {
    __typename: 'Party',
    accounts: [
      {
        __typename: 'AccountBalance',
        type: Types.AccountType.ACCOUNT_TYPE_GENERAL,
        balance: '100',
        asset: {
          __typename: 'Asset',
          id: '5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c',
          symbol: 'tBTC',
          name: 'BTC',
          decimals: 5,
        },
      },
    ],
  },
};

export const generatePartyBalance = () => {
  return partyBalanceMock;
};

export const generatePartyMarketData = (): PartyMarketDataQuery => {
  return {
    party: {
      id: Cypress.env('VEGA_PUBLIC_KEY'),
      accounts: [
        {
          type: Types.AccountType.ACCOUNT_TYPE_GENERAL,
          balance: '1200000',
          asset: { id: 'fBTC', decimals: 5, __typename: 'Asset' },
          market: null,
          __typename: 'AccountBalance',
        },
        {
          __typename: 'AccountBalance',
          type: Types.AccountType.ACCOUNT_TYPE_GENERAL,
          balance: '0.000000001',
          asset: {
            __typename: 'Asset',
            id: '5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c',
            decimals: 5,
          },
        },
      ],
      marginsConnection: { edges: null, __typename: 'MarginConnection' },
      __typename: 'Party',
    },
  };
};
