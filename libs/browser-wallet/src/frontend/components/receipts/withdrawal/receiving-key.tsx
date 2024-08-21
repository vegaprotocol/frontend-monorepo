import get from 'lodash/get';

import { ArbitrumKey } from '@/components/keys/arbitrum';
import { EthereumKey } from '@/components/keys/ethereum-key';
import { UnknownNetworkKey } from '@/components/keys/unknown-network-key';
import { useNetwork } from '@/contexts/network/network-context';
import { useAsset } from '@/hooks/use-asset';

export const ReceivingKey = ({
  assetId,
  address,
}: {
  address: string;
  assetId: string;
}) => {
  // TODO: this needs to be fixed
  const { network } = useNetwork();
  const asset = useAsset(assetId);
  const chainId = get(asset, 'details.erc20.chainId');
  if (!asset || !chainId) return <UnknownNetworkKey address={address} />;

  if (network.ethereumChainId === chainId) {
    return <EthereumKey address={address} />;
  }
  if (network.arbitrumChainId === chainId) {
    return <ArbitrumKey address={address} />;
  }
  return <UnknownNetworkKey address={address} />;
};
