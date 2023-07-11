import { Option } from '@vegaprotocol/ui-toolkit';
import type { AssetFieldsFragment } from './__generated__/Asset';
import classNames from 'classnames';
import { t } from '@vegaprotocol/i18n';
import type { ReactNode } from 'react';

type AssetOptionProps = {
  asset: Pick<AssetFieldsFragment, 'id' | 'name' | 'symbol'>;
  balance?: ReactNode;
};

export const Balance = ({
  balance,
  symbol,
}: {
  balance?: string;
  symbol: string;
}) =>
  balance ? (
    <div className="mt-1 font-alpha" data-testid="asset-balance">
      {balance} {symbol}
    </div>
  ) : (
    <div className="text-vega-orange-500" data-testid="asset-balance">
      {t('Fetching balance…')}
    </div>
  );

export const AssetOption = ({ asset, balance }: AssetOptionProps) => {
  return (
    <Option key={asset.id} value={asset.id}>
      <div className="flex flex-col items-start">
        <div className="flex flex-row align-baseline gap-2">
          <span>{asset.name}</span>{' '}
          <span
            className={classNames(
              'bg-vega-light-200 dark:bg-vega-dark-200',
              'text-black dark:text-white text-xs',
              'py-[2px] px-[4px] rounded'
            )}
          >
            {asset.symbol}
          </span>
        </div>
        {balance}
        <div className="text-[12px] font-mono w-full text-left break-all">
          <span className="text-vega-light-300 dark:text-vega-dark-300">
            {asset.id}
          </span>
        </div>
      </div>
    </Option>
  );
};
