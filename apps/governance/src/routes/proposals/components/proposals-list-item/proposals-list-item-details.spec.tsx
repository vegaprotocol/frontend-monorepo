import { BrowserRouter as Router } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import { ProposalsListItemDetails } from './proposals-list-item-details';

const renderComponent = (id: string) =>
  render(
    <Router>
      <AppStateProvider>
        <ProposalsListItemDetails id={id} />
      </AppStateProvider>
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
