import { render, screen, waitFor, within } from '@testing-library/react';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { ProposalsList } from './proposals-list';
import { MarketState } from '@vegaprotocol/types';
import {
  createMarketFragment,
  createMarketsDataFragment,
} from '@vegaprotocol/mock';
import {
  type MarketsQuery,
  MarketsDocument,
  type MarketsQueryVariables,
  type MarketsDataQuery,
  type MarketsDataQueryVariables,
  MarketsDataDocument,
} from '@vegaprotocol/markets';

const parentMarketName = 'Parent Market Name';
const ParentMarketCell = () => <span>{parentMarketName}</span>;

describe('ProposalsList', () => {
  const rowContainerSelector = '.ag-center-cols-container';
  const market = createMarketFragment();
  const marketData = createMarketsDataFragment({
    marketState: MarketState.STATE_PROPOSED,
  });

  it('should be properly rendered', async () => {
    const marketMock: MockedResponse<MarketsQuery, MarketsQueryVariables> = {
      request: {
        query: MarketsDocument,
      },
      result: {
        data: {
          marketsConnection: {
            edges: [
              {
                node: market,
              },
            ],
          },
        },
      },
    };

    const marketDataMock: MockedResponse<
      MarketsDataQuery,
      MarketsDataQueryVariables
    > = {
      request: {
        query: MarketsDataDocument,
      },
      result: {
        data: {
          marketsConnection: {
            edges: [
              {
                node: { data: marketData },
              },
            ],
          },
        },
      },
    };

    render(
      <MockedProvider mocks={[marketMock, marketDataMock]}>
        <ProposalsList cellRenderers={{ ParentMarketCell }} />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(document.querySelector(rowContainerSelector)).toBeInTheDocument();
    });

    const expectedHeaders = [
      'Market',
      'Settlement asset',
      'State',
      'Parent market',
      'Closing date',
      'Enactment date',
      '', // actions col
    ];

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(expectedHeaders.length);
    expect(
      headers.map((h) => h.querySelector('[ref="eText"]')?.textContent?.trim())
    ).toEqual(expectedHeaders);

    const container = within(
      document.querySelector(rowContainerSelector) as HTMLElement
    );

    expect(await container.findAllByRole('row')).toHaveLength(
      // @ts-ignore data is mocked
      marketMock?.result?.data.marketsConnection.edges.length
    );

    expect(
      container.getAllByRole('gridcell', {
        name: (_, element) =>
          element.getAttribute('col-id') === 'parentMarketID',
      })[0]
    ).toHaveTextContent(parentMarketName);
  });

  it('empty response should causes no data message display', async () => {
    const marketMock: MockedResponse<MarketsQuery, MarketsQueryVariables> = {
      request: {
        query: MarketsDocument,
      },
      result: {
        data: {
          marketsConnection: {
            edges: [],
          },
        },
      },
    };
    const marketDataMock: MockedResponse<
      MarketsDataQuery,
      MarketsDataQueryVariables
    > = {
      request: {
        query: MarketsDataDocument,
      },
      result: {
        data: {
          marketsConnection: {
            edges: [],
          },
        },
      },
    };
    render(
      <MockedProvider mocks={[marketMock, marketDataMock]}>
        <ProposalsList cellRenderers={{ ParentMarketCell }} />
      </MockedProvider>
    );
    expect(await screen.findByText('No proposed markets')).toBeInTheDocument();
  });
});
