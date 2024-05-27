import { TradingOption, truncateMiddle } from '@vegaprotocol/ui-toolkit';
import type { AssetFieldsFragment } from './__generated__/Asset';
import classNames from 'classnames';
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
    <div className="font-alpha text-xs" data-testid="asset-balance">
      {balance} {symbol}
    </div>
  ) : (
    <div className="text-muted text-xs" data-testid="asset-balance">
      -
    </div>
  );
};

export const AssetOption = ({ asset, balance }: AssetOptionProps) => {
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
    <TradingOption key={asset.id} value={asset.id}>
      <div className="flex gap-2 items-center">
        <div className="relative">
          <img className="w-10 h-10" src={assetLogo} alt={asset.symbol} />
          <img
            className="absolute -right-1 -bottom-1 w-4 h-4"
            src={chainLogo}
            alt={chainId || ''}
          />
        </div>
        <div className="flex flex-col items-start gap-1">
          <div className="">
            <span>{asset.name}</span>
          </div>

          {balance}

          {/* Chain and asset source pill */}
          <div
            className={classNames(
              'bg-vega-clight-500 dark:bg-vega-cdark-500',
              'text-black dark:text-white',
              'py-[2px] px-[2px] rounded',
              'flex gap-[2px] items-start text-xs'
            )}
          >
            <span
              className={classNames(
                'bg-vega-clight-900 dark:bg-vega-cdark-900',
                'text-black dark:text-white text-xs',
                'py-[1px] px-[2px] rounded-sm'
              )}
            >
              {asset.symbol}
            </span>
            <span className={classNames('py-[1px] px-[2px]')}>
              {truncateMiddle(assetSource || '')}
            </span>
          </div>

          {/* <div className="text-[12px] font-mono w-full text-left break-all">
          <span className="text-vega-light-300 dark:text-vega-dark-300">
            {truncateMiddle(assetSource || '')}
          </span>
        </div> */}
        </div>
      </div>
    </TradingOption>
  );
};
