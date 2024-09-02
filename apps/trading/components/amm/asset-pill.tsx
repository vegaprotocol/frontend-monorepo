import type { Asset } from '@vegaprotocol/rest';
import { useT } from '../../lib/use-t';
import { cn, Intent, Pill, Tooltip } from '@vegaprotocol/ui-toolkit';

type AssetPillProps = {
  asset: Asset;
  className?: string;
};

export const AssetPill = ({ asset, className }: AssetPillProps) => {
  const t = useT();
  return (
    <Tooltip
      description={
        <dl className="flex flex-col gap-1 text-xs">
          <dt>{t('ASSET_PROPERTY_NAME')}</dt>
          <dd className="ml-2 font-mono">{asset.name}</dd>

          <dt>{t('ASSET_PROPERTY_SYMBOL')}</dt>
          <dd className="ml-2 font-mono">{asset.symbol}</dd>

          <dt>{t('ASSET_PROPERTY_ADDRESS')}</dt>
          <dd className="ml-2 font-mono">{asset.contractAddress}</dd>

          <dt>{t('ASSET_PROPERTY_CHAIN')}</dt>
          <dd className="ml-2 font-mono">{asset.chainId}</dd>
        </dl>
      }
    >
      <div className={cn('flex p-0', className)}>
        <Pill intent={Intent.None} size="xs" className="cursor-help">
          {asset.symbol}
        </Pill>
      </div>
    </Tooltip>
  );
};
