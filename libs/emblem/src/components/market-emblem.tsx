import { type HTMLProps } from 'react';
import { Fallback } from './fallback';
import { marketIcons } from './svgs/markets';
import { cn } from '@vegaprotocol/ui-toolkit';

export type EmblemByMarketProps = HTMLProps<HTMLSpanElement> & {
  market: string;
  size?: number;
  chain?: never;
  asset?: never;
};

/**
 * Given a Vega Market ID, displays the base asset logo slightly overlapping
 * the quote asset logo. If the logos are not found, it will display a black
 * circle instead.
 *
 * The optional marketLogos param restrict which logos are shown, in case only
 * the quote or base is required, when only the market ID is available.
 *
 * @param market string the market ID
 * @returns React.Node
 */
export function EmblemByMarket(p: EmblemByMarketProps) {
  const size = p.size || 32;
  const MarketSvg = marketIcons[p.market];

  return (
    <span {...p} className={cn('relative inline-block', p.className)}>
      {MarketSvg ? (
        <MarketSvg width={size} height={size} />
      ) : (
        <Fallback size={size} />
      )}
    </span>
  );
}
