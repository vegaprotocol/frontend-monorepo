import { render, screen } from '@testing-library/react';

import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';

import { fairground } from '../../../config/well-known-networks';
import { locators, ProposalLink } from './proposal-link';

const renderComponent = ({ id, name }: { id: string; name?: string }) =>
  render(
    <MockNetworkProvider>
      <ProposalLink proposalId={id} name={name} />
    </MockNetworkProvider>
  );

describe('ProposalLink', () => {
  it('renders truncated id and link', () => {
    // 1115-EXPL-002 When I can see the market id I can see a link to the Vega block explorer for the market
    const id = '1'.repeat(64);
    renderComponent({ id });
    expect(screen.getByTestId(locators.proposalLink)).toHaveTextContent(
      '111111…1111'
    );
    expect(screen.getByTestId(locators.proposalLink)).toHaveAttribute(
      'href',
      `${fairground.governance}/proposals/${id}`
    );
  });
  it('renders name if passed in', () => {
    const id = '1'.repeat(64);
    renderComponent({ id, name: 'foo' });
    expect(screen.getByTestId(locators.proposalLink)).toHaveTextContent('foo');
  });
});
