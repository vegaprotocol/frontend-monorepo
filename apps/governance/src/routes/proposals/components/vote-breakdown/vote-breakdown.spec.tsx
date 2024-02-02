import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import {
  lastWeek,
  mockWalletContext,
  networkParamsQueryMock,
  nextWeek,
} from '../../test-helpers/mocks';
import { CompactVotes, VoteBreakdown } from './vote-breakdown';
import { type MockedResponse } from '@apollo/client/testing';
import {
  generateNoVotes,
  generateProposal,
  generateYesVotes,
} from '../../test-helpers/generate-proposals';
import { ProposalState } from '@vegaprotocol/types';
import { BigNumber } from '../../../../lib/bignumber';
import { type AppState } from '../../../../contexts/app-state/app-state-context';
import { type Proposal } from '../../types';

const mockTotalSupply = new BigNumber(100);
// Note - giving a fixedTokenValue of 1 means a ratio of 1:1 votes to tokens, making sums easier :)
const fixedTokenValue = 1000000000000000000;

const mockAppState: AppState = {
  totalAssociated: new BigNumber('50063005'),
  decimals: 18,
  totalSupply: mockTotalSupply,
  vegaWalletManageOverlay: false,
  transactionOverlay: false,
  bannerMessage: '',
  disconnectNotice: false,
};

jest.mock('../../../../contexts/app-state/app-state-context', () => ({
  useAppState: () => ({
    appState: mockAppState,
  }),
}));

const renderComponent = (
  proposal: Proposal,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mocks: MockedResponse<any>[] = [networkParamsQueryMock]
) =>
  render(
    <Router>
      <MockedProvider mocks={mocks}>
        <VegaWalletContext.Provider value={mockWalletContext}>
          <VoteBreakdown proposal={proposal} />
        </VegaWalletContext.Provider>
      </MockedProvider>
    </Router>
  );

describe('VoteBreakdown', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(0);
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  it('Renders majority reached', () => {
    const yesVotes = 100;
    const noVotes = 0;

    renderComponent(
      generateProposal({
        state: ProposalState.STATE_PASSED,
        terms: {
          closingDatetime: lastWeek.toString(),
          enactmentDatetime: nextWeek.toString(),
        },
        votes: {
          __typename: 'ProposalVotes',
          yes: generateYesVotes(yesVotes, fixedTokenValue),
          no: generateNoVotes(noVotes, fixedTokenValue),
        },
      })
    );
    expect(screen.getByTestId('token-majority-met')).toBeInTheDocument();
  });

  it('Renders majority not reached', () => {
    const yesVotes = 20;
    const noVotes = 80;

    renderComponent(
      generateProposal({
        state: ProposalState.STATE_PASSED,
        terms: {
          closingDatetime: lastWeek.toString(),
          enactmentDatetime: nextWeek.toString(),
        },
        votes: {
          __typename: 'ProposalVotes',
          yes: generateYesVotes(yesVotes, fixedTokenValue),
          no: generateNoVotes(noVotes, fixedTokenValue),
        },
      })
    );
    expect(screen.getByTestId('token-majority-not-met')).toBeInTheDocument();
  });

  it('Renders participation reached', () => {
    const yesVotes = 1000;
    const noVotes = 0;

    renderComponent(
      generateProposal({
        state: ProposalState.STATE_PASSED,
        terms: {
          closingDatetime: lastWeek.toString(),
          enactmentDatetime: nextWeek.toString(),
        },
        votes: {
          __typename: 'ProposalVotes',
          yes: generateYesVotes(yesVotes, fixedTokenValue),
          no: generateNoVotes(noVotes, fixedTokenValue),
        },
      })
    );
    expect(screen.getByTestId('token-participation-met')).toBeInTheDocument();
  });

  it('Renders participation not reached', () => {
    const yesVotes = 0;
    const noVotes = 0;

    renderComponent(
      generateProposal({
        terms: {
          closingDatetime: lastWeek.toString(),
          enactmentDatetime: nextWeek.toString(),
        },
        votes: {
          __typename: 'ProposalVotes',
          yes: generateYesVotes(yesVotes, fixedTokenValue),
          no: generateNoVotes(noVotes, fixedTokenValue),
        },
      })
    );
    expect(
      screen.getByTestId('token-participation-not-met')
    ).toBeInTheDocument();
  });

  it('Renders proposal state: Update market proposal - Currently expected to pass by LP vote', () => {
    renderComponent(
      generateProposal({
        state: ProposalState.STATE_OPEN,
        terms: {
          change: {
            __typename: 'UpdateMarket',
          },
        },
        votes: {
          yes: {
            ...generateYesVotes(0),
            totalEquityLikeShareWeight: '1000',
          },
          no: {
            ...generateNoVotes(0),
            totalEquityLikeShareWeight: '0',
          },
        },
      })
    );
    expect(screen.getByTestId('vote-status')).toHaveTextContent(
      'Currently expected to pass by liquidity vote'
    );
  });

  it('Renders proposal state: Update market proposal - Currently expected to pass by token vote', () => {
    renderComponent(
      generateProposal({
        state: ProposalState.STATE_OPEN,
        terms: {
          change: {
            __typename: 'UpdateMarket',
          },
        },
        votes: {
          yes: {
            ...generateYesVotes(1000, fixedTokenValue),
            totalEquityLikeShareWeight: '0',
          },
          no: {
            ...generateNoVotes(0, fixedTokenValue),
            totalEquityLikeShareWeight: '0',
          },
        },
      })
    );
    expect(screen.getByTestId('vote-status')).toHaveTextContent(
      'Currently expected to pass by token vote'
    );
  });

  it('Renders proposal state: Update market proposal - Currently expected to fail', () => {
    renderComponent(
      generateProposal({
        state: ProposalState.STATE_OPEN,
        terms: {
          change: {
            __typename: 'UpdateMarket',
          },
        },
        votes: {
          yes: {
            ...generateYesVotes(0),
            totalEquityLikeShareWeight: '0',
          },
          no: {
            ...generateNoVotes(0),
            totalEquityLikeShareWeight: '0',
          },
        },
      })
    );
    expect(screen.getByTestId('vote-status')).toHaveTextContent(
      'Currently expected to fail'
    );
  });

  it('Progress bar displays status - token majority', () => {
    const yesVotes = 80;
    const noVotes = 20;

    renderComponent(
      generateProposal({
        state: ProposalState.STATE_PASSED,
        terms: {
          closingDatetime: lastWeek.toString(),
          enactmentDatetime: nextWeek.toString(),
        },
        votes: {
          __typename: 'ProposalVotes',
          yes: generateYesVotes(yesVotes, fixedTokenValue),
          no: generateNoVotes(noVotes, fixedTokenValue),
        },
      })
    );

    const element = screen.getByTestId('token-majority-progress');
    const style = window.getComputedStyle(element);

    expect(style.width).toBe(`${yesVotes}%`);
  });

  it('Progress bar displays status - token participation', () => {
    const yesVotes = 40;
    const noVotes = 20;
    const totalVotes = yesVotes + noVotes;
    const totalSupplyValue = mockTotalSupply.toNumber();
    const expectedProgress = (totalVotes / totalSupplyValue) * 100; // Here it should be 60%

    renderComponent(
      generateProposal({
        state: ProposalState.STATE_PASSED,
        terms: {
          closingDatetime: lastWeek.toString(),
          enactmentDatetime: nextWeek.toString(),
        },
        votes: {
          __typename: 'ProposalVotes',
          yes: generateYesVotes(yesVotes, fixedTokenValue),
          no: generateNoVotes(noVotes, fixedTokenValue),
        },
      })
    );

    const element = screen.getByTestId('token-participation-progress');
    const style = window.getComputedStyle(element);

    expect(style.width).toBe(`${expectedProgress}%`);
  });

  it('Progress bar displays status -  LP majority', () => {
    const yesVotesLP = 0.8;
    const noVotesLP = 0.2;
    const expectedProgress = (yesVotesLP / (yesVotesLP + noVotesLP)) * 100; // 80%

    renderComponent(
      generateProposal({
        state: ProposalState.STATE_PASSED,
        terms: {
          change: {
            __typename: 'UpdateMarket',
          },
        },
        votes: {
          __typename: 'ProposalVotes',
          yes: {
            ...generateYesVotes(0),
            totalEquityLikeShareWeight: `${yesVotesLP}`,
          },
          no: {
            ...generateNoVotes(0),
            totalEquityLikeShareWeight: `${noVotesLP}`,
          },
        },
      })
    );

    const element = screen.getByTestId('lp-majority-progress');
    const style = window.getComputedStyle(element);
    expect(style.width).toBe(`${expectedProgress}%`);
  });

  it('Progress bar displays status - LP participation', () => {
    const yesVotesLP = 400;
    const noVotesLP = 600;
    const totalVotesLP = yesVotesLP + noVotesLP;
    const totalLPSupply = 1000;
    const expectedProgress = (totalVotesLP / totalLPSupply) * 100; // 100%

    renderComponent(
      generateProposal({
        state: ProposalState.STATE_PASSED,
        terms: {
          change: {
            __typename: 'UpdateMarket',
          },
        },
        votes: {
          __typename: 'ProposalVotes',
          yes: {
            ...generateYesVotes(0),
            totalEquityLikeShareWeight: `${yesVotesLP}`,
          },
          no: {
            ...generateNoVotes(0),
            totalEquityLikeShareWeight: `${noVotesLP}`,
          },
        },
      })
    );

    const element = screen.getByTestId('lp-participation-progress');
    const style = window.getComputedStyle(element);
    expect(style.width).toBe(`${expectedProgress}%`);
  });
});

describe('CompactVotes', () => {
  it.each([
    [0, '0'],
    [1, '1'],
    [12, '12'],
    [123, '123'],
    [1234, '1.2K'],
    [12345, '12.3K'],
    [123456, '123.5K'],
    [1234567, '1.2M'],
    [12345678, '12.3M'],
    [123456789, '123.5M'],
    [1234567890, '1.2B'],
  ])('compacts %s to %s', (input, output) => {
    const { getByTestId } = render(<CompactVotes number={BigNumber(input)} />);
    expect(getByTestId('compact-number').textContent).toBe(output);
  });
});
