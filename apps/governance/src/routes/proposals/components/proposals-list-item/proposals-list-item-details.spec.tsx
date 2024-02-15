import { BrowserRouter as Router } from 'react-router-dom';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { render, screen } from '@testing-library/react';
import { ProposalsListItemDetails } from './proposals-list-item-details';
import { mockWalletContext } from '../../test-helpers/mocks';

const renderComponent = (id: string) =>
  render(
    <Router>
      <VegaWalletContext.Provider value={mockWalletContext}>
        <ProposalsListItemDetails id={id} />
      </VegaWalletContext.Provider>
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
