import { render, screen } from '@testing-library/react';

import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';

import { fairground } from '../../../config/well-known-networks';
import { locators, PartyLink } from './party-link';

const renderComponent = ({ id, name }: { id: string; name?: string }) =>
  render(
    <MockNetworkProvider>
      <PartyLink publicKey={id} text={name} />
    </MockNetworkProvider>
  );

describe('PartyLink', () => {
  it('renders truncated id and link', () => {
    const id = '1'.repeat(64);
    renderComponent({ id });
    expect(screen.getByTestId(locators.partyLink)).toHaveTextContent(
      '111111…1111'
    );
    expect(screen.getByTestId(locators.partyLink)).toHaveAttribute(
      'href',
      `${fairground.explorer}/parties/${id}`
    );
  });
  it('renders text if passed in', () => {
    const id = '1'.repeat(64);
    renderComponent({ id, name: 'foo' });
    expect(screen.getByTestId(locators.partyLink)).toHaveTextContent('foo');
  });
});
