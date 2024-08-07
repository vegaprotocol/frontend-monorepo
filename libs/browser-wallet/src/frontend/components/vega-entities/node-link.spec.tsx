import { render, screen } from '@testing-library/react';

import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';

import { fairground } from '../../../config/well-known-networks';
import { locators, NodeLink } from './node-link';

const renderComponent = ({ nodeId, name }: { nodeId: string; name?: string }) =>
  render(
    <MockNetworkProvider>
      <NodeLink nodeId={nodeId} name={name} />
    </MockNetworkProvider>
  );

describe('NodeLink', () => {
  it('renders truncated id and link', () => {
    const id = '1'.repeat(64);
    renderComponent({ nodeId: id });
    expect(screen.getByTestId(locators.nodeLink)).toHaveTextContent(
      '111111…1111'
    );
    expect(screen.getByTestId(locators.nodeLink)).toHaveAttribute(
      'href',
      `${fairground.governance}/validators/${id}`
    );
  });
  it('renders name if passed in', () => {
    renderComponent({ nodeId: '1'.repeat(64), name: 'foo' });
    expect(screen.getByTestId(locators.nodeLink)).toHaveTextContent('foo');
  });
});
