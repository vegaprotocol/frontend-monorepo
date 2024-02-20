import { ActiveRewardCard } from '../rewards-container/active-rewards';
import { useT } from '../../lib/use-t';
import { type EnrichedRewardTransfer } from '../../lib/hooks/use-rewards';

export const GamesContainer = ({
  data,
  currentEpoch,
}: {
  data: EnrichedRewardTransfer[];
  currentEpoch: number;
}) => {
  const t = useT();

  if (!data || data.length === 0) {
    return (
      <p className="text-sm">
        {t('Currently no active games on the network.')}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          />
        );
      })}
    </div>
  );
};
