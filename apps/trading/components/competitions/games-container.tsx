import { type TransferNode } from '@vegaprotocol/types';
import {
  ActiveRewardCard,
  isActiveReward,
} from '../rewards-container/active-rewards';
import { useT } from '../../lib/use-t';
import { useAssetsMapProvider } from '@vegaprotocol/assets';
import { useMarketsMapProvider } from '@vegaprotocol/markets';

export const GamesContainer = ({
  data,
  currentEpoch,
}: {
  data: TransferNode[];
  currentEpoch: number;
}) => {
  const t = useT();
  // Re-load markets and assets in the games container to ensure that the
  // the cards are updated (not grayed out) when the user navigates to the games page
  const { data: assets } = useAssetsMapProvider();
  const { data: markets } = useMarketsMapProvider();

  const enrichedTransfers = data
    .filter((node) => isActiveReward(node, currentEpoch))
    .map((node) => {
      if (node.transfer.kind.__typename !== 'RecurringTransfer') {
        return node;
      }

      const asset =
        assets &&
        assets[
          node.transfer.kind.dispatchStrategy?.dispatchMetricAssetId || ''
        ];

      const marketsInScope =
        node.transfer.kind.dispatchStrategy?.marketIdsInScope?.map(
          (id) => markets && markets[id]
        );

      return { ...node, asset, markets: marketsInScope };
    });

  if (!enrichedTransfers || !enrichedTransfers.length) return null;

  if (!enrichedTransfers || enrichedTransfers.length === 0) {
    return (
      <p className="mb-6 text-muted">
        {t('There are currently no games available.')}
      </p>
    );
  }

  return (
    <div className="mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {enrichedTransfers.map((game, i) => {
        // TODO: Remove `kind` prop from ActiveRewardCard
        const { transfer } = game;
        if (
          transfer.kind.__typename !== 'RecurringTransfer' ||
          !transfer.kind.dispatchStrategy?.dispatchMetric
        ) {
          return null;
        }
        return (
          <ActiveRewardCard
            key={i}
            transferNode={game}
            currentEpoch={currentEpoch}
            kind={transfer.kind}
            allMarkets={markets || undefined}
          />
        );
      })}
    </div>
  );
};
