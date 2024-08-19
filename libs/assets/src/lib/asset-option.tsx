import {
  TradingRichSelectOption,
  truncateMiddle,
} from '@vegaprotocol/ui-toolkit';
import type { AssetFieldsFragment } from './__generated__/Asset';
import { cn } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';

type AssetOptionProps = {
  asset: AssetFieldsFragment;
  balance?: ReactNode;
};

export const Balance = ({
  balance,
  symbol,
}: {
  balance?: string;
  symbol: string;
}) => {
  return balance ? (
    <div className="text-xs" data-testid="asset-balance">
      {balance} {symbol}
    </div>
  ) : (
    <div className="text-muted text-xs" data-testid="asset-balance">
      -
    </div>
  );
};

const AssetLogo = ({ asset }: { asset: AssetFieldsFragment }) => {
  const chainId = asset.source.__typename === 'ERC20' && asset.source.chainId;
  const assetSource =
    asset.source.__typename === 'ERC20' && asset.source.contractAddress;

  let assetLogo = 'https://icon.vega.xyz/missing.svg';
  let chainLogo = 'https://icon.vega.xyz/missing.svg';
  if (chainId && assetSource) {
    assetLogo = `https://icon.vega.xyz/chain/${chainId}/asset/${assetSource}/logo.svg`;
    chainLogo = `https://icon.vega.xyz/chain/${chainId}/logo.svg`;
  }

  return (
    <div className="relative min-w-[40px]">
      <img className="w-10 h-10" src={assetLogo} alt={asset.symbol} />
      <img
        className="absolute -right-1 -bottom-1 w-4 h-4"
        src={chainLogo}
        alt={chainId || ''}
      />
    </div>
  );
};

export const AssetOption = ({ asset, balance }: AssetOptionProps) => {
  const assetSource =
    asset.source.__typename === 'ERC20' && asset.source.contractAddress;

  return (
    <TradingRichSelectOption key={asset.id} value={asset.id}>
      <div className="flex gap-2 items-center">
        <AssetLogo asset={asset} />
        <div className="flex flex-col items-start gap-1">
          <div className="">
            <span>{asset.name}</span>
          </div>

          {balance}

          {/* Chain and asset source pill */}
          <div
            className={cn(
              'bg-gs-500 ',
              'text-black dark:text-white',
              'p-0.5 rounded',
              'flex gap-[2px] items-start text-xs'
            )}
          >
            <span
              className={cn(
                'bg-surface-2 ',
                'text-black dark:text-white text-xs',
                'py-px px-0.5 rounded-sm'
              )}
            >
              {asset.symbol}
            </span>
            <span className={cn('py-px px-0.5')}>
              {truncateMiddle(assetSource || '')}
            </span>
          </div>
        </div>
      </div>
    </TradingRichSelectOption>
  );
};
