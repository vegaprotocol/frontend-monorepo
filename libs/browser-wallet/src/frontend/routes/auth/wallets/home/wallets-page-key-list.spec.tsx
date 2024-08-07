import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { locators as keyListLocators } from '@/components/key-list';
import { JsonRPCProvider } from '@/contexts/json-rpc/json-rpc-provider';
import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';
import { mockClient } from '@/test-helpers/mock-client';

import {
  locators,
  type WalletPageKeyListProperties,
  WalletsPageKeyList,
} from './wallets-page-key-list';
import { useWalletStore } from '@/stores/wallets';

jest.mock('@/stores/wallets', () => {
  const createKey = jest.fn();
  return {
  useWalletStore: (function_: any) => function_({
    createKey: createKey,
  })}
});

const renderComponent = (properties: WalletPageKeyListProperties) =>
  render(
    <MemoryRouter>
      <JsonRPCProvider>
        <MockNetworkProvider>
          <WalletsPageKeyList {...properties} />
        </MockNetworkProvider>
      </JsonRPCProvider>
    </MemoryRouter>
  );

describe('WalletsPageKeyList', () => {
  beforeEach(() => {
    mockClient();
  });

  it('renders key list component', () => {
    const wallet = {
      name: 'Test Wallet',
      keys: [
        {
          publicKey: 'publicKey1',
          name: 'Key 1',
          index: 1,
        },
      ],
    };
    renderComponent({ wallet, onSignMessage: jest.fn() });
    expect(
      screen.getByTestId(keyListLocators.viewDetails(wallet.keys[0].name))
    ).toBeInTheDocument();
  });

  it('calls onIconClick when icon button is clicked', () => {
    const wallet = {
      name: 'Test Wallet',
      keys: [
        {
          publicKey: 'publicKey1',
          name: 'Key 1',
          index: 1,
        },
      ],
    };
    const onIconClick = jest.fn();

    renderComponent({ wallet, onSignMessage: onIconClick });

    fireEvent.click(screen.getByTestId(locators.walletsSignMessageButton));

    expect(onIconClick).toHaveBeenCalledWith('publicKey1');
  });

  it('calls createNewKey when create key button is clicked', async () => {
    const wallet = {
      name: 'Test Wallet',
      keys: [],
    };

    const { createKey } = useWalletStore((state) => ({
      createKey: state.createKey,
    }))
    renderComponent({ wallet, onSignMessage: jest.fn() });
    fireEvent.click(screen.getByTestId(locators.walletsCreateKey));
    await waitFor(() => expect(createKey).toHaveBeenCalled());
  });
});
