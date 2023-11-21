import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import type { MockedResponse } from '@apollo/client/testing';
import { render } from '@testing-library/react';
import PriceInMarket from './price-in-market';
import type { DecimalSource } from './price-in-market';
import { ExplorerMarketDocument } from '../links/market-link/__generated__/Market';

function renderComponent(
  price: string,
  marketId: string,
  mocks: MockedResponse[],
  decimalSource: DecimalSource = 'MARKET'
) {
  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <PriceInMarket
          marketId={marketId}
          price={price}
          decimalSource={decimalSource}
        />
      </MemoryRouter>
    </MockedProvider>
  );
}

const fullMock = {
  request: {
    query: ExplorerMarketDocument,
    variables: {
      id: '123',
    },
  },
  result: {
    data: {
      market: {
        id: '123',
        decimalPlaces: 2,
        positionDecimalPlaces: 2,
        state: 'irrelevant-test-data',
        tradableInstrument: {
          instrument: {
            name: 'test dai',
            product: {
              __typename: 'Future',
              quoteName: 'dai',
              settlementAsset: {
                decimals: 18,
              },
            },
          },
        },
      },
    },
  },
};

describe('Price in Market component', () => {
  it('Renders the raw price when there is no market data', () => {
    const res = render(renderComponent('100', '123', []));
    expect(res.getByText('100')).toBeInTheDocument();
  });

  it('Renders the formatted price when market data is fetched, using market decimals by default', async () => {
    const res = render(renderComponent('100', '123', [fullMock]));
    expect(await res.findByText('1')).toBeInTheDocument();
    expect(await res.findByText('dai')).toBeInTheDocument();
  });

  it('Renders the formatted price when market data is fetched, using settlement decimals', async () => {
    const res = render(
      renderComponent('100', '123', [fullMock], 'SETTLEMENT_ASSET')
    );
    expect(await res.findByText('0.0000000000000001')).toBeInTheDocument();
    expect(await res.findByText('dai')).toBeInTheDocument();
  });

  it('Leaves the market id when the market is not found', async () => {
    const mock = {
      request: {
        query: ExplorerMarketDocument,
        variables: {
          id: '123',
        },
      },
      error: new Error('No such market'),
    };

    const res = render(renderComponent('100', '123', [mock]));
    expect(await res.findByText('100')).toBeInTheDocument();
  });

  it('Renders `Market` instead of a price for market orders: 0 price', () => {
    const res = render(renderComponent('0', '123', []));
    expect(res.getByText('Market')).toBeInTheDocument();
  });

  it('Renders `Market` instead of a price for market orders: undefined price', () => {
    const res = render(
      renderComponent(undefined as unknown as string, '123', [])
    );
    expect(res.getByText('Market')).toBeInTheDocument();
  });

  it('Renders `Market` instead of a price for market orders: empty price', () => {
    const res = render(renderComponent('', '123', []));
    expect(res.getByText('Market')).toBeInTheDocument();
  });
});
