import { type AssetERC20 } from '@vegaprotocol/assets';
import { EmblemByAsset } from '@vegaprotocol/emblem';
import { truncateMiddle } from '@vegaprotocol/ui-toolkit';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { useWallet } from '@vegaprotocol/wallet-react';

export const AssetOption = ({
  asset,
}: {
  asset: AssetERC20 & { balance: string };
}) => {
  const vegaChainId = useWallet((store) => store.chainId);

  return (
    <div className="w-full flex items-center gap-2 h-10">
      <EmblemByAsset asset={asset.id} vegaChain={vegaChainId} />
      <div className="text-sm text-left leading-4">
        <div>
          {asset.name} | {asset.symbol}
        </div>
        <div className="text-secondary text-xs">
          {asset.source.__typename === 'ERC20'
            ? truncateMiddle(asset.source.contractAddress)
            : asset.source.__typename}
        </div>
      </div>
      <div className="ml-auto text-sm">
        {addDecimalsFormatNumber(asset.balance, asset.decimals)}
      </div>
    </div>
  );
};
