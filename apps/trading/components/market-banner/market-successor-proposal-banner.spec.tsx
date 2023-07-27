import { render, screen, waitFor } from '@testing-library/react';
import type { MockedResponse } from '@apollo/react-testing';
import { MockedProvider } from '@apollo/react-testing';
import { MarketSuccessorProposalBanner } from './market-successor-proposal-banner';
import type { SuccessorProposalsListQuery } from '@vegaprotocol/proposals';
import { SuccessorProposalsListDocument } from '@vegaprotocol/proposals';

const marketProposalMock: MockedResponse<SuccessorProposalsListQuery> = {
  request: {
    query: SuccessorProposalsListDocument,
  },
  result: {
    data: {
      proposalsConnection: {
        edges: [
          {
            node: {
              __typename: 'Proposal',
              id: 'proposal-1',
              terms: {
                __typename: 'ProposalTerms',
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
  });
});
