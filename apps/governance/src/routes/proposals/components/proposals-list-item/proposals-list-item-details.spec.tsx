import { BrowserRouter as Router } from 'react-router-dom';
<<<<<<< HEAD
import { VegaWalletContext } from '@vegaprotocol/wallet';
=======
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import { type MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
>>>>>>> fea3a8f9f (fix: governance tests)
import { render, screen } from '@testing-library/react';
import { ProposalsListItemDetails } from './proposals-list-item-details';
<<<<<<< HEAD
import { mockWalletContext } from '../../test-helpers/mocks';
=======
import { DATE_FORMAT_DETAILED } from '../../../../lib/date-formats';
import {
  networkParamsQueryMock,
  fiveMinutes,
  fiveHours,
  fiveDays,
  lastWeek,
  nextWeek,
} from '../../test-helpers/mocks';
import { type Proposal } from '../../types';
>>>>>>> fea3a8f9f (fix: governance tests)

const renderComponent = (id: string) =>
  render(
    <Router>
<<<<<<< HEAD
      <VegaWalletContext.Provider value={mockWalletContext}>
        <ProposalsListItemDetails id={id} />
      </VegaWalletContext.Provider>
=======
      <MockedProvider mocks={mocks}>
        <AppStateProvider>
          <ProposalsListItemDetails proposal={proposal} />
        </AppStateProvider>
      </MockedProvider>
>>>>>>> fea3a8f9f (fix: governance tests)
    </Router>
  );

describe('Proposals list item details', () => {
  it('links to single proposal page', () => {
    const proposalId = 'proposal-id';
    renderComponent(proposalId);
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      expect.stringContaining(proposalId)
    );
  });
});
