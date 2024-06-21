import {
  type AssetERC20,
  type AssetFieldsFragment,
} from '@vegaprotocol/assets';
import { EmblemByAsset } from '@vegaprotocol/emblem';
import { truncateMiddle } from '@vegaprotocol/ui-toolkit';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { useWallet } from '@vegaprotocol/wallet-react';
import { erc20Abi } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

export const AssetOption = ({ asset }: { asset: AssetFieldsFragment }) => {
  const vegaChainId = useWallet((store) => store.chainId);

  return (
    <div className="w-full flex items-center gap-2">
      <EmblemByAsset asset={asset.id} vegaChain={vegaChainId} />
      <div className="text-xs text-left">
        <div>{asset.name}</div>
        <div>
          {asset.symbol}{' '}
          {asset.source.__typename === 'ERC20'
            ? truncateMiddle(asset.source.contractAddress)
            : asset.source.__typename}
        </div>
      </div>
      {asset.source.__typename === 'ERC20' && (
        <ERC20 asset={asset as AssetERC20} />
      )}
    </div>
  );
};

const ERC20 = ({ asset }: { asset: AssetERC20 }) => {
  const { address } = useAccount();

  const { data } = useReadContract({
    abi: erc20Abi,
    address: asset.source.contractAddress as `0x${string}`,
    functionName: 'balanceOf',
    args: address && [address],
    chainId: Number(asset.source.chainId),
  });

  return (
    <div className="ml-auto text-xs">
      {data ? addDecimalsFormatNumber(data.toString(), asset.decimals) : '0'}
    </div>
  );
};
