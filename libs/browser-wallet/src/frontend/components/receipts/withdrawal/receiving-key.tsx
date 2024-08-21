import get from 'lodash/get';

import { ArbitrumKey } from '@/components/keys/arbitrum';
import { EthereumKey } from '@/components/keys/ethereum-key';
import { UnknownNetworkKey } from '@/components/keys/unknown-network-key';
import { useAsset } from '@/hooks/use-asset';
import { useEVMBridgeConfigs, useEthereumConfig } from '@vegaprotocol/web3';

export const ReceivingKey = ({
  assetId,
  address,
}: {
  address: string;
  assetId: string;
}) => {
  const asset = useAsset(assetId);
  const chainId = get(asset, 'details.erc20.chainId');
  const { config } = useEthereumConfig();
  const { configs } = useEVMBridgeConfigs();
  const ethereumChainId = config?.chain_id;
  const arbitrumChainId = configs?.find(
    (c) => c.chain_id === chainId
  )?.chain_id;

  if (!asset || !chainId) return <UnknownNetworkKey address={address} />;

  if (ethereumChainId === chainId) {
    return <EthereumKey address={address} chainId={chainId} />;
  }
  if (arbitrumChainId === chainId) {
    return <ArbitrumKey address={address} chainId={chainId} />;
  }
  return <UnknownNetworkKey address={address} />;
};
