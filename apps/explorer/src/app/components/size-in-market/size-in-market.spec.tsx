import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import type { MockedResponse } from '@apollo/client/testing';
import { render } from '@testing-library/react';
import SizeInMarket from './size-in-market';
import type { DecimalSource } from './size-in-market';
import { ExplorerMarketDocument } from '../links/market-link/__generated__/Market';

function renderComponent(
  size: string | undefined,
  marketId: string,
  mocks: MockedResponse[],
  decimalSource: DecimalSource = 'MARKET'
) {
  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <SizeInMarket
          marketId={marketId}
          size={size}
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

describe('Size in Market component', () => {
  it('Renders a dash size when there is no size', () => {
    const res = render(renderComponent(undefined, '123', []));
    expect(res.getByText('-')).toBeInTheDocument();
  });

  it('Renders the raw size when there is no market data', () => {
    const res = render(renderComponent('100', '123', []));
    expect(res.getByText('100')).toBeInTheDocument();
  });

  it('Renders the formatted size when market data is fetched', async () => {
    const res = render(renderComponent('100', '123', [fullMock]));
    expect(await res.findByText('1')).toBeInTheDocument();
  });
});
