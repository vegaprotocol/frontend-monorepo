import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import type { TerminateProposalsListQuery } from '@vegaprotocol/proposals';
import { TerminateProposalsListDocument } from '@vegaprotocol/proposals';
import { MarketTerminationBanner } from './market-termination-banner';

const proposalMock: MockedResponse<TerminateProposalsListQuery> = {
  request: {
    query: TerminateProposalsListDocument,
    variables: undefined,
  },
  result: {
    data: {
      proposalsConnection: {
        edges: [
          {
            node: {
              id: 'first-id',
              terms: {
                closingDatetime: '2023-09-27T11:48:18Z',
                enactmentDatetime: '2023-09-30T11:48:18',
                change: {
                  __typename: 'UpdateMarketState',
                  updateType: '',
                  price: '',
                  market: {
                    id: 'market-1',
                    tradableInstrument: {
                      instrument: {
                        name: 'Market one',
                      },
                    },
                  },
                },
              },
            },
          },
          {
            node: {
              id: 'second-id',
              terms: {
                closingDatetime: '2023-09-27T11:48:18Z',
                enactmentDatetime: '2023-10-01T11:48:18',
                change: {
                  __typename: 'UpdateMarketState',
                  updateType: '',
                  price: '',
                  market: {
                    id: 'market-2',
                    tradableInstrument: {
                      instrument: {
                        name: 'Market two',
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    } as unknown as TerminateProposalsListQuery,
  },
};
const mocks: MockedResponse[] = [proposalMock];

describe('MarketTerminationBanner', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2023-09-28T10:10:10.000Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should be properly rendered', async () => {
    const { container } = render(
      <MemoryRouter>
        <MockedProvider mocks={mocks}>
          <MarketTerminationBanner marketId="market-1" />
        </MockedProvider>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(container).not.toBeEmptyDOMElement();
    });
    expect(
      screen.getByTestId('termination-warning-banner-market-1')
    ).toBeInTheDocument();
  });
});
