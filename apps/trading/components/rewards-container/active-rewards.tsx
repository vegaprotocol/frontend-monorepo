import { useT } from '../../lib/use-t';
import {
  VegaIcon,
  VegaIconNames,
  TradingInput,
} from '@vegaprotocol/ui-toolkit';
import { useRewardsGrouped } from '../../lib/hooks/use-rewards';
import { useMyTeam } from '../../lib/hooks/use-my-team';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useStakeAvailable } from '../../lib/hooks/use-stake-available';
import { GroupRewardCard } from './reward-card';

export const ActiveRewards = ({ currentEpoch }: { currentEpoch: number }) => {
  const t = useT();
  const { data, setFilter, filter } = useRewardsGrouped({
    onlyActive: true,
  });

  const { pubKey } = useVegaWallet();
  const { team } = useMyTeam();
  const { stakeAvailable, isEligible, requiredStake } = useStakeAvailable();

  const requirements = pubKey
    ? {
        isEligible,
        stakeAvailable,
        requiredStake,
        team,
        pubKey,
      }
    : undefined;

  const groupedCards = Object.values(data || []);

  if (!groupedCards || !groupedCards.length) return null;

  return (
    <div className="flex flex-col gap-2">
      <header className="flex justify-between items-center gap-4">
        <h2 className="text-xl">{t('Active rewards')}</h2>

        {/** CARDS FILTER */}
        {groupedCards.length > 1 && (
          <div className="w-1/2 lg:w-1/3">
            <TradingInput
              onChange={(e) =>
                setFilter((curr) => ({ ...curr, searchTerm: e.target.value }))
              }
              value={filter.searchTerm}
              type="text"
              placeholder={t(
                'Search by reward dispatch metric, entity scope or asset name'
              )}
              data-testid="search-term"
              prependElement={<VegaIcon name={VegaIconNames.SEARCH} />}
            />
          </div>
        )}
      </header>
      {/** CARDS */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {groupedCards.map((group, i) => {
          if (group.length === 0) return;

          return (
            <GroupRewardCard
              key={i}
              transferNodes={group}
              currentEpoch={currentEpoch}
              requirements={requirements}
            />
          );
        })}
      </div>
    </div>
  );
};
