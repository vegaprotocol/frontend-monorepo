import { type AssetERC20 } from '@vegaprotocol/assets';
import { getExternalChainShortLabel } from '@vegaprotocol/environment';
import { cn } from '@vegaprotocol/ui-toolkit';

export function Receives(props: {
  label: string;
  amount: string | undefined;
  toAsset: AssetERC20;
  className?: string;
}) {
  return (
    <div className={cn('grid grid-cols-2 text-xs', props.className)}>
      <dt className="text-surface-1-fg-muted">{props.label}</dt>
      <dd className="text-right">
        <div>
          {props.amount} {props.toAsset.symbol} (
          {getExternalChainShortLabel(props.toAsset.source.chainId)})
        </div>
      </dd>
    </div>
  );
}
