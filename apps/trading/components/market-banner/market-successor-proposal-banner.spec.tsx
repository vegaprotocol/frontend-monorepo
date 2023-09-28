import { act, render, screen, waitFor } from '@testing-library/react';
import type { SingleExecutionResult } from '@apollo/client';
import type { MockedResponse } from '@apollo/react-testing';
import { MockedProvider } from '@apollo/react-testing';
import { MarketSuccessorProposalBanner } from './market-successor-proposal-banner';
import type { MarketViewProposalsQuery } from '@vegaprotocol/proposals';
import { MarketViewProposalsDocument } from '@vegaprotocol/proposals';
import * as Types from '@vegaprotocol/types';

const marketProposalMock: MockedResponse<MarketViewProposalsQuery> = {
  request: {
    query: MarketViewProposalsDocument,
    variables: {
      inState: Types.ProposalState.STATE_OPEN,
      proposalType: Types.ProposalType.TYPE_NEW_MARKET,
    },
  },
  result: {
    data: {
      proposalsConnection: {
        edges: [
          {
            node: {
              __typename: 'Proposal',
              id: 'proposal-1',
              state: Types.ProposalState.STATE_OPEN,
              terms: {
                __typename: 'ProposalTerms',
                closingDatetime: '2023-09-27',
                enactmentDatetime: '2023-09-28',
                change: {
                  __typename: 'NewMarket',
                  instrument: {
                    name: 'New proposal of the market successor',
                  },
                  successorConfiguration: {
                    parentMarketId: 'marketId',
                  },
                },
              },
            },
          },
        ],
      },
    },
  },
};

describe('MarketSuccessorProposalBanner', () => {
  it('should display single proposal', async () => {
    render(
      <MockedProvider mocks={[marketProposalMock]}>
        <MarketSuccessorProposalBanner marketId="marketId" />
      </MockedProvider>
    );
    await waitFor(() => {
      expect(
        screen.getByText('A successors to this market has been proposed')
      ).toBeInTheDocument();
    });
    expect(
      screen
        .getByRole('link')
        .getAttribute('href')
        ?.endsWith('/proposals/proposal-1') ?? false
    ).toBe(true);
  });
  it('should display plural proposals', async () => {
    const dualProposalMock = {
      ...marketProposalMock,
      result: {
        ...marketProposalMock.result,
        data: {
          proposalsConnection: {
            edges: [
              ...((
                marketProposalMock?.result as SingleExecutionResult<MarketViewProposalsQuery>
              )?.data?.proposalsConnection?.edges ?? []),
              {
                node: {
                  __typename: 'Proposal',
                  id: 'proposal-2',
                  terms: {
                    __typename: 'ProposalTerms',
                    change: {
                      __typename: 'NewMarket',
                      instrument: {
                        name: 'New second proposal of the market successor',
                      },
                      successorConfiguration: {
                        parentMarketId: 'marketId',
                      },
                    },
                  },
                },
              },
            ],
          },
        },
      },
    };

    render(
      <MockedProvider mocks={[dualProposalMock]}>
        <MarketSuccessorProposalBanner marketId="marketId" />
      </MockedProvider>
    );
    await waitFor(() => {
      expect(
        screen.getByText('Successors to this market have been proposed')
      ).toBeInTheDocument();
    });
    expect(
      screen
        .getAllByRole('link')[0]
        .getAttribute('href')
        ?.endsWith('/proposals/proposal-1') ?? false
    ).toBe(true);
    expect(
      screen
        .getAllByRole('link')[1]
        .getAttribute('href')
        ?.endsWith('/proposals/proposal-2') ?? false
    ).toBe(true);
  });

  it('banner should be hidden because no proposals', () => {
    const { container } = render(
      <MockedProvider>
        <MarketSuccessorProposalBanner marketId="marketId" />
      </MockedProvider>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('banner should be hidden because no proposals for the market', () => {
    const { container } = render(
      <MockedProvider mocks={[marketProposalMock]}>
        <MarketSuccessorProposalBanner marketId="otherMarketId" />
      </MockedProvider>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('banner should be hidden after user close click', async () => {
    const { container } = render(
      <MockedProvider mocks={[marketProposalMock]}>
        <MarketSuccessorProposalBanner marketId="marketId" />
      </MockedProvider>
    );
    await waitFor(() => {
      expect(
        screen.getByText('A successors to this market has been proposed')
      ).toBeInTheDocument();
    });
    await act(() => {
      screen.getByTestId('notification-banner-close').click();
    });
    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });
});
