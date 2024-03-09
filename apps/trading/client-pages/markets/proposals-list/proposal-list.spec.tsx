import { render, screen, waitFor, within } from '@testing-library/react';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { ProposalsList } from './proposals-list';
import { MarketState } from '@vegaprotocol/types';
import { createMarketFragment } from '@vegaprotocol/mock';
import {
  type MarketsQuery,
  MarketsDocument,
  type MarketsQueryVariables,
} from '@vegaprotocol/markets';

const parentMarketName = 'Parent Market Name';
const ParentMarketCell = () => <span>{parentMarketName}</span>;

describe('ProposalsList', () => {
  const rowContainerSelector = '.ag-center-cols-container';
  const market = createMarketFragment({
    state: MarketState.STATE_PROPOSED,
  });

  it('should be properly rendered', async () => {
    const mock: MockedResponse<MarketsQuery, MarketsQueryVariables> = {
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

    render(
      <MockedProvider mocks={[mock]}>
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
      mock?.result?.data.marketsConnection.edges.length
    );

    expect(
      container.getAllByRole('gridcell', {
        name: (_, element) =>
          element.getAttribute('col-id') === 'parentMarketID',
      })[0]
    ).toHaveTextContent(parentMarketName);
  });

  it('empty response should causes no data message display', async () => {
    const mock: MockedResponse<MarketsQuery, MarketsQueryVariables> = {
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
    render(
      <MockedProvider mocks={[mock]}>
        <ProposalsList cellRenderers={{ ParentMarketCell }} />
      </MockedProvider>
    );
    expect(await screen.findByText('No proposed markets')).toBeInTheDocument();
  });
});
