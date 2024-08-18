import { type AssetERC20 } from '@vegaprotocol/assets';
import { EmblemByAsset } from '@vegaprotocol/emblem';
import { truncateMiddle } from '@vegaprotocol/ui-toolkit';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { useWallet } from '@vegaprotocol/wallet-react';
import { getErc20Abi } from 'apps/trading/lib/utils/get-erc20-abi';
import { useAccount, useBalance, useReadContracts } from 'wagmi';

export const AssetOption = ({ asset }: { asset: AssetERC20 }) => {
  const vegaChainId = useWallet((store) => store.chainId);

  return (
    <div className="w-full flex items-center gap-2 h-10">
      <EmblemByAsset asset={asset.id} vegaChain={vegaChainId} />
      <div className="text-sm text-left leading-4">
        <div>
          {asset.name} | {asset.symbol}
        </div>
        <div className="text-surface-0-fg-muted text-xs">
          {asset.source.__typename === 'ERC20'
            ? truncateMiddle(asset.source.contractAddress)
            : asset.source.__typename}
        </div>
      </div>
    </div>
  );
};

type AssetBalanceProps = { chainId: string; address: string };

export const AssetBalance = (props: AssetBalanceProps) => {
  if (props.address.toLowerCase() === '0x' + 'e'.repeat(40)) {
    return <NativeTokenBalance {...props} />;
  }

  return <TokenBalance {...props} />;
};

const NativeTokenBalance = (props: AssetBalanceProps) => {
  const { address } = useAccount();

  const { data } = useBalance({
    address,
    chainId: Number(props.chainId),
  });

  if (!data) return null;

  return <>{addDecimalsFormatNumber(data.value.toString(), data.decimals)}</>;
};

const TokenBalance = (props: AssetBalanceProps) => {
  const { address } = useAccount();

  const tokenAddress = props.address as `0x${string}`;

  const { data } = useReadContracts({
    contracts: [
      {
        address: tokenAddress,
        abi: getErc20Abi({ address: tokenAddress }),
        functionName: 'balanceOf',
        args: address && [address],
        chainId: Number(props.chainId),
      },
      {
        address: tokenAddress,
        abi: getErc20Abi({ address: tokenAddress }),
        functionName: 'decimals',
        chainId: Number(props.chainId),
      },
    ],
  });

  if (!data) return null;

  const value = data[0].result;
  const decimals = data[1].result;

  if (!value || !decimals) return null;

  return <>{addDecimalsFormatNumber(value.toString(), decimals)}</>;
};
