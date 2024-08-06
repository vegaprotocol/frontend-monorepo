import { render, screen } from '@testing-library/react';

import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';

import { fairground } from '../../../../config/well-known-networks';
import { locators, VegaKey, VegaKeyProperties } from '.';

const mockPublicKey =
  '07248acbd899061ba9c5f3ab47791df2045c8e249f1805a04c2a943160533673';
const mockName = 'My Vega Key';

jest.mock('../vega-icon', () => ({
  KeyIcon: () => <div data-testid="key-icon" />,
}));

jest.mock('../../copy-with-check', () => ({
  CopyWithCheckmark: () => <div data-testid="copy-with-checkmark" />,
}));

const renderComponent = (properties: VegaKeyProperties) =>
  render(
    <MockNetworkProvider>
      <VegaKey {...properties} />
    </MockNetworkProvider>
  );

describe('VegaKey component', () => {
  it('renders the name and truncated publicKey with explorer link', () => {
    // 1115-EXPL-003 When I see a party id I can see a link to the party on the Vega block explorer
    // 1106-KEYS-005 There is a link from a key to the Block Explorer filtered transaction view
    // 1106-KEYS-015 From the main wallets screen I can click on a key to be shown the list of assets on that key
    // 1126-VKEY-001 Shows the name of the key
    // 1126-VKEY-002 Shows a truncated view of the key
    // 1126-VKEY-003 Shows a copy icon so I can copy the full key
    // 1126-VKEY-004 Shows an icon associated with the key
    renderComponent({
      publicKey: mockPublicKey,
      name: mockName,
    });

    const nameElement = screen.getByTestId(locators.keyName);
    const explorerLinkElement = screen.getByTestId(locators.explorerLink);

    expect(nameElement).toHaveTextContent(mockName);
    expect(explorerLinkElement.textContent).toBe('07248a…3673');
    expect(explorerLinkElement.getAttribute('href')).toBe(
      `${fairground.explorer}/parties/${mockPublicKey}`
    );
  });

  it('renders the KeyIcon & CopyWithCheckmark components', () => {
    renderComponent({
      publicKey: mockPublicKey,
      name: mockName,
    });

    expect(screen.getByTestId('key-icon')).toBeInTheDocument();

    expect(screen.getByTestId('copy-with-checkmark')).toBeInTheDocument();
  });

  it('does not render name if not passed in', () => {
    renderComponent({
      publicKey: mockPublicKey,
    });
    expect(screen.queryByTestId(locators.keyName)).not.toBeInTheDocument();
  });
});
