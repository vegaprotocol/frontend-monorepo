import { render, screen } from '@testing-library/react';

import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';

import { testingNetwork } from '../../../config/well-known-networks';
import { locators, PageHeader } from './page-header';

jest.mock('../icons/vega-icon', () => ({
  VegaIcon: () => <div data-testid="vega-icon" />,
}));
jest.mock('./network-switcher', () => ({
  NetworkSwitcher: () => <div data-testid="network-switcher" />,
}));
jest.mock('./popout-button', () => ({
  PopoutButton: () => <div data-testid="popout-button" />,
}));

const renderComponent = () =>
  render(
    <MockNetworkProvider>
      <PageHeader />
    </MockNetworkProvider>
  );

describe('PageHeader', () => {
  it('renders the VegaIcon component', () => {
    renderComponent();
    const vegaIconElement = screen.getByTestId('vega-icon');
    expect(vegaIconElement).toBeVisible();
  });

  it('renders the PopoutButton', () => {
    renderComponent();
    const popout = screen.getByTestId('popout-button');
    expect(popout).toBeVisible();
  });

  it('renders the network indicator correctly', () => {
    renderComponent();

    expect(screen.getByTestId('network-switcher')).toBeVisible();
  });

  it('changes the color based on the network', () => {
    renderComponent();
    // 1142-NWSW-003 Renders header with network color when connecting
    // 1142-NWSW-006 Renders header with network color when transacting
    expect(screen.getByTestId(locators.pageHeader)).toHaveStyle(
      `backgroundColor: #${testingNetwork.color}`
    );
  });
});
