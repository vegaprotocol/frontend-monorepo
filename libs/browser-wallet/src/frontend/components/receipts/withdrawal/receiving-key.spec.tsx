import { render, screen } from '@testing-library/react';

import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';
import { useAssetsStore } from '@/stores/assets-store';
import { mockStore } from '@/test-helpers/mock-store';

import { ReceivingKey } from './receiving-key';
import { useEthereumConfig, useEVMBridgeConfigs } from '@vegaprotocol/web3';

jest.mock('@/stores/assets-store');

jest.mock('@/components/keys/unknown-network-key', () => ({
  UnknownNetworkKey: () => <div data-testid="unknown-network-key" />,
}));

jest.mock('@vegaprotocol/web3', () => ({
  useEthereumConfig: jest.fn(),
  useEVMBridgeConfigs: jest.fn(),
}));

const renderComponent = (address: string, assetId: string) => {
  return render(
    <MockNetworkProvider>
      <ReceivingKey address={address} assetId={assetId} />
    </MockNetworkProvider>
  );
};

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('ReceivingKey', () => {
  it('Should render unknown key address when asset cannot be found', () => {
    mockStore(useAssetsStore, { assets: [] });
    (useEthereumConfig as jest.Mock).mockReturnValue({
      config: {
        chain_id: '11155111',
      },
    });
    (useEVMBridgeConfigs as jest.Mock).mockReturnValue({ configs: [] });

    renderComponent('0x1234567890abcdef', '');
    expect(screen.getByTestId('unknown-network-key')).toBeInTheDocument();
  });
  it('Should render unknown key address when chainId cannot be found', () => {
    mockStore(useAssetsStore, {
      getAssetById: () => ({ id: '0'.repeat(64), details: { erc20: {} } }),
    });
    (useEthereumConfig as jest.Mock).mockReturnValue({
      config: {
        chain_id: '11155111',
      },
    });
    (useEVMBridgeConfigs as jest.Mock).mockReturnValue({ configs: [] });
    renderComponent('0x1234567890abcdef', '0'.repeat(64));
    expect(screen.getByTestId('unknown-network-key')).toBeInTheDocument();
  });
  it('Should render Ethereum key address when network.ethereumChainId is equal to chainId', () => {
    mockStore(useAssetsStore, {
      getAssetById: () => ({
        id: '0'.repeat(64),
        details: { erc20: { chainId: '11155111' } },
      }),
    });
    (useEthereumConfig as jest.Mock).mockReturnValue({
      config: {
        chain_id: '11155111',
      },
    });
    (useEVMBridgeConfigs as jest.Mock).mockReturnValue({ configs: [] });
    renderComponent('0x1234567890abcdef', '0'.repeat(64));
    expect(screen.getByTestId('ethereum-key')).toBeInTheDocument();
  });
  it('Should render Arbitrum key address when network.arbitrumChainId is equal to chainId', () => {
    mockStore(useAssetsStore, {
      getAssetById: () => ({
        id: '0'.repeat(64),
        details: { erc20: { chainId: '421614' } },
      }),
    });
    (useEthereumConfig as jest.Mock).mockReturnValue({
      config: {
        chain_id: '11155111',
      },
    });
    (useEVMBridgeConfigs as jest.Mock).mockReturnValue({
      configs: [
        {
          chain_id: '421614',
        },
      ],
    });
    renderComponent('0x1234567890abcdef', '0'.repeat(64));
    expect(screen.getByTestId('arbitrum-key')).toBeInTheDocument();
  });
  it('Should render unknown key address when network.ethereumChainId and network.arbitrumChainId are not equal to chainId', () => {
    mockStore(useAssetsStore, {
      getAssetById: () => ({
        id: '0'.repeat(64),
        details: { erc20: { chainId: 'foo' } },
      }),
    });
    (useEthereumConfig as jest.Mock).mockReturnValue({
      config: {
        chain_id: '11155111',
      },
    });
    (useEVMBridgeConfigs as jest.Mock).mockReturnValue({ configs: [] });
    renderComponent('0x1234567890abcdef', '0'.repeat(64));
    expect(screen.getByTestId('unknown-network-key')).toBeInTheDocument();
  });
});
