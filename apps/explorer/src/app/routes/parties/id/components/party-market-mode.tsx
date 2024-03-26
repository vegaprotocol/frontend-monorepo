import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useExplorerPartyMarginModeQuery } from './__generated__/Party-market-mode';
import { MarginMode } from '@vegaprotocol/types';

const MarginLabels: Record<MarginMode, string> = {
  [MarginMode.MARGIN_MODE_CROSS_MARGIN]: 'Cross Margin',
  [MarginMode.MARGIN_MODE_ISOLATED_MARGIN]: 'Isolated Margin',
  [MarginMode.MARGIN_MODE_UNSPECIFIED]: 'Unspecified Margin',
};

export interface PartyMarketMode {
  partyId: string;
  marketId: string;
}

/**
 * Renders and indicator showing if a party is using isolated, or cross margining for a given
 * market.
 *
 * @param param0
 * @returns React.Node
 */
export function PartyMarketMode({ partyId, marketId }: PartyMarketMode) {
  const { data, loading, error } = useExplorerPartyMarginModeQuery({
    variables: { partyId, marketId },
  });

  const type = data?.partyMarginModes?.edges?.[0]?.node?.marginMode || '-';
  const label = type !== '-' ? MarginLabels[type] : '-';

  return (
    <AsyncRenderer loading={loading} data={data} error={error}>
      <span>{label}</span>
    </AsyncRenderer>
  );
}
