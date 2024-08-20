import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import type { Asset } from '@vegaprotocol/rest';
import { t } from '../../lib/use-t';
import { Badge } from '../ui/badge';

type AssetPillProps = {
  asset: Asset;
  className?: string;
};

export const AssetPill = ({ asset, className }: AssetPillProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={className}>
          <Badge variant="outline" className="cursor-help">
            {asset.symbol}
          </Badge>
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="center">
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
      </TooltipContent>
    </Tooltip>
  );
};
