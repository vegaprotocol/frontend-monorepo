import { MockedProvider } from '@apollo/client/testing';
import type { MockedResponse } from '@apollo/client/testing';
import { render } from '@testing-library/react';
import { ExplorerSettlementAssetForMarketDocument } from '../__generated__/Explorer-settlement-asset';
import type { ExplorerSettlementAssetForMarketQuery } from '../__generated__/Explorer-settlement-asset';
import type { VegaSide } from './liquidity-provision-details-row';
import {
  getFormattedOffset,
  LiquidityProvisionOffset,
} from './liquidity-provision-offset';
const decimalsMock: ExplorerSettlementAssetForMarketQuery = {
  market: {
    id: '123',
    __typename: 'Market',
    decimalPlaces: 5,
    tradableInstrument: {
      instrument: {
        product: {
          settlementAsset: {
            decimals: 5,
          },
        },
      },
    },
  },
};

describe('LiquidityProvisionOffset component', () => {
  function renderComponent(
    offset: string,
    side: VegaSide,
    marketId: string,
    mocks: MockedResponse[]
  ) {
    return render(
      <MockedProvider mocks={mocks}>
        <LiquidityProvisionOffset
          offset={offset}
          side={side}
          marketId={marketId}
        />
      </MockedProvider>
    );
  }

  it('renders a simple row before market data comes in', () => {
    const res = renderComponent('1', 'SIDE_BUY', '123', []);
    expect(res.getByText('+1')).toBeInTheDocument();
  });

  it('replaces unformatted with formatted if the market data comes in', () => {
    const mock = {
      request: {
        query: ExplorerSettlementAssetForMarketDocument,
        variables: {
          id: '123',
        },
        result: {
          data: decimalsMock,
        },
      },
    };
    const res = renderComponent('1', 'SIDE_BUY', '123', [mock]);
    expect(res.getByText('+1')).toBeInTheDocument();
  });

  it('getFormattedOffset returns the unformatted offset if there is not enough data', () => {
    const res = getFormattedOffset('1', {});
    expect(res).toEqual('1');
  });

  it('getFormattedOffset decimal formats a number if it comes in with market data', () => {
    const res = getFormattedOffset('1', decimalsMock);
    expect(res).toEqual('0.00001');
  });
});
