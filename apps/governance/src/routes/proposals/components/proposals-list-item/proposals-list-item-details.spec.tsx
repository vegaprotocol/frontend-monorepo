import { BrowserRouter as Router } from 'react-router-dom';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';
import { format } from 'date-fns';
import { ProposalRejectionReason, ProposalState } from '@vegaprotocol/types';
import { generateProposal } from '../../test-helpers/generate-proposals';
import { ProposalsListItemDetails } from './proposals-list-item-details';
import { DATE_FORMAT_DETAILED } from '../../../../lib/date-formats';
import {
  mockWalletContext,
  networkParamsQueryMock,
  fiveMinutes,
  fiveHours,
  fiveDays,
  lastWeek,
  nextWeek,
} from '../../test-helpers/mocks';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';

const renderComponent = (
  proposal: ProposalQuery['proposal'],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mocks: MockedResponse<any>[] = [networkParamsQueryMock]
) =>
  render(
    <Router>
      <MockedProvider mocks={mocks}>
        <AppStateProvider>
          <VegaWalletContext.Provider value={mockWalletContext}>
            <ProposalsListItemDetails proposal={proposal} />
          </VegaWalletContext.Provider>
        </AppStateProvider>
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

describe('Proposals list item details', () => {
  it('Renders proposal state: Enacted', () => {
    renderComponent(
      generateProposal({
        state: ProposalState.STATE_ENACTED,
        terms: {
          enactmentDatetime: lastWeek.toString(),
        },
      })
    );
    expect(screen.getByTestId('vote-details')).toHaveTextContent(
      format(lastWeek, DATE_FORMAT_DETAILED)
    );
  });

  it('Renders proposal state: Passed', () => {
    renderComponent(
      generateProposal({
        state: ProposalState.STATE_PASSED,
        terms: {
          closingDatetime: lastWeek.toString(),
          enactmentDatetime: nextWeek.toString(),
        },
      })
    );
    expect(screen.getByTestId('vote-details')).toHaveTextContent(
      `Enacts on ${format(nextWeek, DATE_FORMAT_DETAILED)}`
    );
  });

  it('Renders proposal state: Waiting for node vote', () => {
    renderComponent(
      generateProposal({
        state: ProposalState.STATE_WAITING_FOR_NODE_VOTE,
        terms: {
          enactmentDatetime: nextWeek.toString(),
        },
      })
    );
    expect(screen.getByTestId('vote-details')).toHaveTextContent(
      `Enacts on ${format(nextWeek, DATE_FORMAT_DETAILED)}`
    );
  });

  it('Renders proposal state: Open - 5 minutes left to vote', () => {
    renderComponent(
      generateProposal({
        state: ProposalState.STATE_OPEN,
        terms: {
          closingDatetime: fiveMinutes.toString(),
        },
      })
    );
    expect(screen.getByTestId('vote-details')).toHaveTextContent(
      '5 minutes left to vote'
    );
  });

  it('Renders proposal state: Open - 5 hours left to vote', () => {
    renderComponent(
      generateProposal({
        state: ProposalState.STATE_OPEN,
        terms: {
          closingDatetime: fiveHours.toString(),
        },
      })
    );
    expect(screen.getByTestId('vote-details')).toHaveTextContent(
      '5 hours left to vote'
    );
  });

  it('Renders proposal state: Open - 5 days left to vote', () => {
    renderComponent(
      generateProposal({
        state: ProposalState.STATE_OPEN,
        terms: {
          closingDatetime: fiveDays.toString(),
        },
      })
    );
    expect(screen.getByTestId('vote-details')).toHaveTextContent(
      '5 days left to vote'
    );
  });

  it('Renders proposal state: Rejected', () => {
    renderComponent(
      generateProposal({
        state: ProposalState.STATE_REJECTED,
        terms: {
          enactmentDatetime: lastWeek.toString(),
        },
        rejectionReason:
          ProposalRejectionReason.PROPOSAL_ERROR_INVALID_FUTURE_PRODUCT,
      })
    );
    expect(screen.getByTestId('vote-status')).toHaveTextContent(
      'Invalid future product'
    );
  });
});
