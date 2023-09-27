import { render, screen, waitFor } from '@testing-library/react';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { MarketTerminationBanner } from './market-termination-banner';
import type { TerminateProposalsListQuery } from '@vegaprotocol/proposals';
import { TerminateProposalsListDocument } from '@vegaprotocol/proposals';
import type { PositionsQuery } from '@vegaprotocol/positions';
import { PositionsDocument } from '@vegaprotocol/positions';

const walletMock = {
  pubKey: 'pubKey',
  pubKeys: [{ publicKey: 'pubKey' }, { publicKey: 'secondPubKey' }],
};
jest.mock('@vegaprotocol/wallet', () => ({
  ...jest.requireActual('@vegaprotocol/wallet'),
  useVegaWallet: jest.fn(() => walletMock),
}));

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
const positionsMock: MockedResponse<PositionsQuery> = {
  request: {
    query: PositionsDocument,
    variables: { partyIds: ['pubKey', 'secondPubKey'] },
  },
  result: {
    data: {
      positions: {
        edges: [
          {
            node: {
              market: {
                id: 'market-1',
              },
              party: {
                id: 'pubKey',
              },
            },
          },
          {
            node: {
              market: {
                id: 'market-2',
              },
              party: {
                id: 'secondPubKey',
              },
            },
          },
        ],
      },
    } as unknown as PositionsQuery,
  },
};
const mocks: MockedResponse[] = [proposalMock, positionsMock];

describe('MarketTerminationBanner', () => {
  it('should be properly rendered', async () => {
    render(
      <MockedProvider mocks={mocks}>
        <MarketTerminationBanner />
      </MockedProvider>
    );
    await waitFor(() => {
      expect(
        screen.getByTestId('termination-warning-banner-market-1')
      ).toBeInTheDocument();
    });
    expect(
      screen.getByTestId('termination-warning-banner-market-2')
    ).toBeInTheDocument();
  });
});
