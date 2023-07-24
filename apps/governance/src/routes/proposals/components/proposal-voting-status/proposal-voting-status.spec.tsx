import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import {
  lastWeek,
  mockWalletContext,
  networkParamsQueryMock,
  nextWeek,
  mockNetworkParams,
} from '../../test-helpers/mocks';
import { ProposalVotingStatus } from './proposal-voting-status';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';
import type { MockedResponse } from '@apollo/client/testing';
import {
  generateNoVotes,
  generateProposal,
  generateYesVotes,
} from '../../test-helpers/generate-proposals';
import { ProposalState } from '@vegaprotocol/types';
import { BigNumber } from '../../../../lib/bignumber';
import type { AppState } from '../../../../contexts/app-state/app-state-context';

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
  proposal: ProposalQuery['proposal'],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mocks: MockedResponse<any>[] = [networkParamsQueryMock]
) =>
  render(
    <Router>
      <MockedProvider mocks={mocks}>
        <VegaWalletContext.Provider value={mockWalletContext}>
          <ProposalVotingStatus
            proposal={proposal}
            networkParams={mockNetworkParams}
          />
        </VegaWalletContext.Provider>
      </MockedProvider>
    </Router>
  );

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(0);
});
afterAll(() => {
  jest.useRealTimers();
});

describe('ProposalVotingStatus', () => {
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
    expect(screen.getByTestId('majority-reached')).toBeInTheDocument();
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
    expect(screen.getByTestId('majority-not-reached')).toBeInTheDocument();
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
    expect(screen.getByTestId('participation-reached')).toBeInTheDocument();
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
    expect(screen.getByTestId('participation-not-reached')).toBeInTheDocument();
  });
});
