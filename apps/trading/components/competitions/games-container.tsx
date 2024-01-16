import { type TransferNode } from '@vegaprotocol/types';
import { ActiveRewardCard } from '../rewards-container/active-rewards';
import { useT } from '../../lib/use-t';
import { Splash } from '@vegaprotocol/ui-toolkit';

export const GamesContainer = ({
  data,
  currentEpoch,
}: {
  data: TransferNode[];
  currentEpoch: number;
}) => {
  const t = useT();
  if (!data || data.length === 0) {
    return <Splash>{t('There are currently no games available.')}</Splash>;
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
