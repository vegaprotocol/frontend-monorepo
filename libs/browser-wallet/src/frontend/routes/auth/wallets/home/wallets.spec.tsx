import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { locators as headerLocators } from '@/components/header';
import { locators as keyLocators } from '@/components/key-list';
import { locators as vegaKeyLocators } from '@/components/keys/vega-key';
import locators from '@/components/locators';
import { locators as signMessageLocators } from '@/components/sign-message-dialog/sign-message';
import { locators as signedMessageLocators } from '@/components/sign-message-dialog/signed-message';
import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { JsonRPCProvider } from '@/contexts/json-rpc/json-rpc-provider';
import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';
import { useWalletStore } from '@/stores/wallets';
import { mockClient } from '@/test-helpers/mock-client';

import { Wallets } from '.';
import { locators as depositAssetsCalloutLocators } from './deposit-assets-callout';
import { locators as walletPageKeyListLocators } from './wallets-page-key-list';

// This mimics the loading of and loading state both of which are handled higher up the component tree
const WrappedComponent = () => {
  const { loading, loadWallets } = useWalletStore((store) => ({
    loading: store.loading,
    loadWallets: store.loadWallets,
  }));
  const { request } = useJsonRpcClient();
  useEffect(() => {
    loadWallets(request);
  }, [loadWallets, request]);
  if (loading) return null;
  return <Wallets />;
};

const renderComponent = () => {
  mockClient();

  render(
    <MemoryRouter>
      <JsonRPCProvider>
        <MockNetworkProvider>
          <WrappedComponent />
        </MockNetworkProvider>
      </JsonRPCProvider>
    </MemoryRouter>
  );
};

describe('Wallets', () => {
  const informationText =
    'Choose a market on Vega Console, connect your wallet and follow the prompts to deposit the funds needed to trade';

  it('renders the wallet page', async () => {
    // 1106-KEYS-005 There is a link from a key to the Block Explorer filtered transaction view
    renderComponent();
    // Wait for list to load
    await screen.findByTestId(locators.listItem);
    expect(screen.getByTestId(headerLocators.header)).toHaveTextContent(
      'wallet 1'
    );
    expect(screen.getByTestId(vegaKeyLocators.explorerLink)).toBeVisible();
    expect(screen.getByTestId(vegaKeyLocators.explorerLink)).toHaveTextContent(
      '07248a…3673'
    );
    expect(screen.getByTestId(vegaKeyLocators.explorerLink)).toHaveAttribute(
      'href',
      'https://explorer.fairground.wtf/parties/07248acbd899061ba9c5f3ab47791df2045c8e249f1805a04c2a943160533673'
    );
    expect(screen.getByTestId(locators.copyWithCheck)).toBeInTheDocument();
    expect(screen.getByTestId(vegaKeyLocators.keyName)).toHaveTextContent(
      'Key 1'
    );
    expect(
      screen.getByTestId(walletPageKeyListLocators.walletsCreateKey)
    ).toHaveTextContent('Create new key/pair');
    expect(
      screen.getByTestId(depositAssetsCalloutLocators.walletsAssetHeader)
    ).toHaveTextContent('Connect to console to deposit funds');
    expect(
      screen.getByTestId(depositAssetsCalloutLocators.walletAssetDescription)
    ).toHaveTextContent(informationText);
    expect(
      screen.getByTestId(depositAssetsCalloutLocators.walletsDepositLink)
    ).toHaveTextContent('Vega Console dapp');
    expect(
      screen.getByTestId(depositAssetsCalloutLocators.walletsDepositLink)
    ).toHaveAttribute('href', 'https://console.fairground.wtf');
  });

  it('allows you to create another key', async () => {
    renderComponent();

    // Wait for list to load
    await screen.findByTestId(locators.listItem);
    fireEvent.click(
      screen.getByTestId(walletPageKeyListLocators.walletsCreateKey)
    );
    await waitFor(() =>
      expect(screen.queryAllByTestId(locators.listItem)).toHaveLength(2)
    );
    const [key1, key2] = screen.queryAllByTestId(locators.listItem);
    expect(key1).toHaveTextContent('Key 1');
    expect(key2).toHaveTextContent('Key 2');
  });

  it('allows you to sign a message with a key', async () => {
    renderComponent();

    // Wait for list to load
    await screen.findByTestId(locators.listItem);
    fireEvent.click(screen.getByTestId(keyLocators.walletsSignMessageButton));
    await waitFor(() =>
      expect(
        screen.getByTestId(signMessageLocators.signMessageHeader)
      ).toBeVisible()
    );
    fireEvent.change(screen.getByTestId(signMessageLocators.messageInput), {
      target: { value: 'Test message' },
    });
    fireEvent.click(screen.getByTestId(signMessageLocators.signButton));
    await screen.findByTestId(signedMessageLocators.signedMessageHeader);
    expect(screen.getByText('signature')).toBeInTheDocument();
    fireEvent.click(
      screen.getByTestId(signedMessageLocators.signedMessageDoneButton)
    );
    await waitFor(() =>
      expect(
        screen.queryByTestId(signedMessageLocators.signedMessageHeader)
      ).not.toBeInTheDocument()
    );
  });
});
