import { type TransferNode } from '@vegaprotocol/types';
import { ActiveRewardCard } from '../rewards-container/active-rewards';
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
  useAssetsMapProvider();
  useMarketsMapProvider();

  if (!data || data.length === 0) {
    return (
      <p className="mb-6 text-muted">
        {t('There are currently no games available.')}
      </p>
    );
  }

  return (
    <div className="mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((game, i) => {
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
          />
        );
      })}
    </div>
  );
};
