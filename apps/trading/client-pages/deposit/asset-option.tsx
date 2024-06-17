import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import { EmblemByAsset } from '@vegaprotocol/emblem';
import { truncateMiddle } from '@vegaprotocol/ui-toolkit';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { useWallet } from '@vegaprotocol/wallet-react';
import { erc20Abi } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

export const AssetOption = ({ asset }: { asset: AssetFieldsFragment }) => {
  const vegaChainId = useWallet((store) => store.chainId);

  return (
    <div className="w-full flex items-start gap-2">
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
        <ERC20
          contractAddress={asset.source.contractAddress}
          decimals={asset.decimals}
        />
      )}
    </div>
  );
};

const ERC20 = ({
  contractAddress,
  decimals,
}: {
  contractAddress: string;
  decimals: number;
}) => {
  const { address } = useAccount();
  const { data } = useReadContract({
    abi: erc20Abi,
    address: contractAddress as `0x${string}`,
    functionName: 'balanceOf',
    args: address && [address],
  });

  return (
    <div className="ml-auto self-end text-xs">
      {data ? addDecimalsFormatNumber(data.toString(), decimals) : '0'}
    </div>
  );
};
