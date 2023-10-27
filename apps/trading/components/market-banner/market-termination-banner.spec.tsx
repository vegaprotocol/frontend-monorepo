import { render, screen, waitFor } from '@testing-library/react';
import * as Types from '@vegaprotocol/types';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import type { MarketViewProposalsQuery } from '@vegaprotocol/proposals';
import { MarketViewProposalsDocument } from '@vegaprotocol/proposals';
import type { Market } from '@vegaprotocol/markets';
import { MarketTerminationBanner } from './market-termination-banner';

const marketMock = {
  id: 'market-1',
  decimalPlaces: 3,
  tradableInstrument: {
    instrument: {
      product: {
        __typename: 'Future',
        quoteName: 'tDAI',
      },
    },
  },
} as Market;

const passedProposalMock: MockedResponse<MarketViewProposalsQuery> = {
  request: {
    query: MarketViewProposalsDocument,
    variables: {
      inState: Types.ProposalState.STATE_PASSED,
      proposalType: Types.ProposalType.TYPE_UPDATE_MARKET_STATE,
    },
  },
  result: {
    data: {
      proposalsConnection: {
        edges: [
          {
            node: {
              id: '1',
              state: Types.ProposalState.STATE_PASSED,
              terms: {
                closingDatetime: '2023-09-27T11:48:18Z',
                enactmentDatetime: '2023-09-30T11:48:18',
                change: {
                  __typename: 'UpdateMarketState',
                  updateType:
                    Types.MarketUpdateType.MARKET_STATE_UPDATE_TYPE_TERMINATE,
                  price: '',
                  market: {
                    id: 'market-1',
                    tradableInstrument: {
                      instrument: {
                        name: 'Market one name',
                        code: 'Market one',
                      },
                    },
                  },
                },
              },
            },
          },
          {
            node: {
              id: '2',
              state: Types.ProposalState.STATE_PASSED,
              terms: {
                closingDatetime: '2023-09-27T11:48:18Z',
                enactmentDatetime: '2023-10-01T11:48:18',
                change: {
                  __typename: 'UpdateMarketState',
                  updateType:
                    Types.MarketUpdateType.MARKET_STATE_UPDATE_TYPE_TERMINATE,
                  price: '',
                  market: {
                    id: 'market-2',
                    tradableInstrument: {
                      instrument: {
                        name: 'Market two name',
                        code: 'Market two',
                      },
                    },
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
const openProposalMock: MockedResponse<MarketViewProposalsQuery> = {
  request: {
    query: MarketViewProposalsDocument,
    variables: {
      inState: Types.ProposalState.STATE_OPEN,
      proposalType: Types.ProposalType.TYPE_UPDATE_MARKET_STATE,
    },
  },
  result: {
    data: {
      proposalsConnection: {
        edges: [
          {
            node: {
              id: '3',
              state: Types.ProposalState.STATE_OPEN,
              terms: {
                closingDatetime: '2023-09-27T11:48:18Z',
                enactmentDatetime: '2023-10-01T11:48:18',
                change: {
                  __typename: 'UpdateMarketState',
                  updateType:
                    Types.MarketUpdateType.MARKET_STATE_UPDATE_TYPE_TERMINATE,
                  price: '',
                  market: {
                    id: 'market-3',
                    tradableInstrument: {
                      instrument: {
                        name: 'Market three name',
                        code: 'Market three',
                      },
                    },
                  },
                },
              },
            },
          },
          {
            node: {
              id: '4',
              state: Types.ProposalState.STATE_OPEN,
              terms: {
                closingDatetime: '2023-09-27T11:48:18Z',
                enactmentDatetime: '2023-10-11T11:48:18',
                change: {
                  __typename: 'UpdateMarketState',
                  updateType:
                    Types.MarketUpdateType.MARKET_STATE_UPDATE_TYPE_TERMINATE,
                  price: '',
                  market: {
                    id: 'market-3',
                    tradableInstrument: {
                      instrument: {
                        name: 'Market three name',
                        code: 'Market three',
                      },
                    },
                  },
                },
              },
            },
          },
          {
            node: {
              id: '5',
              state: Types.ProposalState.STATE_OPEN,
              terms: {
                closingDatetime: '2023-09-27T11:48:18Z',
                enactmentDatetime: '2023-10-01T11:48:18',
                change: {
                  __typename: 'UpdateMarketState',
                  updateType:
                    Types.MarketUpdateType.MARKET_STATE_UPDATE_TYPE_TERMINATE,
                  price: '',
                  market: {
                    id: 'market-4',
                    tradableInstrument: {
                      instrument: {
                        name: 'Market four name',
                        code: 'Market four',
                      },
                    },
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
const mocks: MockedResponse[] = [passedProposalMock, openProposalMock];

describe('MarketTerminationBanner', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2023-09-28T10:10:10.000Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should be properly rendered', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks}>
        <MarketTerminationBanner market={marketMock} />
      </MockedProvider>
    );
    await waitFor(() => {
      expect(container).not.toBeEmptyDOMElement();
    });
    expect(
      screen.getByTestId('termination-warning-banner-market-1')
    ).toBeInTheDocument();
  });

  it('should render link to proposals', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks}>
        <MarketTerminationBanner market={{ ...marketMock, id: 'market-3' }} />
      </MockedProvider>
    );
    await waitFor(() => {
      expect(container).not.toBeEmptyDOMElement();
    });
    expect(screen.getByText('View proposals')).toBeInTheDocument();
  });

  it('should render link to proposal', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks}>
        <MarketTerminationBanner market={{ ...marketMock, id: 'market-4' }} />
      </MockedProvider>
    );
    await waitFor(() => {
      expect(container).not.toBeEmptyDOMElement();
    });
    expect(screen.getByText('View proposal')).toBeInTheDocument();
  });
});
