import { useT } from '../../lib/use-t';
import {
  VegaIcon,
  VegaIconNames,
  TradingInput,
} from '@vegaprotocol/ui-toolkit';
import {
  type TransferNode,
  DispatchMetricLabels,
  EntityScopeLabelMapping,
  AccountType,
  type DispatchStrategy,
  type StakingDispatchStrategy,
} from '@vegaprotocol/types';
import { useState } from 'react';
import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import { type MarketFieldsFragment } from '@vegaprotocol/markets';
import {
  type EnrichedRewardTransfer,
  useRewards,
  isScopedToTeams,
} from '../../lib/hooks/use-rewards';
import { useMyTeam } from '../../lib/hooks/use-my-team';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useStakeAvailable } from '../../lib/hooks/use-stake-available';
import { GroupRewardCard, areAllMarketsSettled } from './reward-card';
import { groupBy } from 'lodash';

export type Filter = {
  searchTerm: string;
};

export const applyFilter = (
  node: TransferNode & {
    asset?: AssetFieldsFragment | null;
    markets?: (MarketFieldsFragment | null)[];
  },
  filter: Filter
) => {
  const { transfer } = node;

  // if the transfer is a staking reward then it should be displayed
  if (transfer.toAccountType === AccountType.ACCOUNT_TYPE_GLOBAL_REWARD) {
    return true;
  }

  if (
    transfer.kind.__typename !== 'RecurringTransfer' &&
    transfer.kind.__typename !== 'RecurringGovernanceTransfer'
  ) {
    return false;
  }

  if (
    (transfer.kind.dispatchStrategy?.dispatchMetric &&
      DispatchMetricLabels[transfer.kind.dispatchStrategy.dispatchMetric]
        .toLowerCase()
        .includes(filter.searchTerm.toLowerCase())) ||
    transfer.asset?.symbol
      .toLowerCase()
      .includes(filter.searchTerm.toLowerCase()) ||
    (
      (transfer.kind.dispatchStrategy &&
        EntityScopeLabelMapping[transfer.kind.dispatchStrategy.entityScope]) ||
      'Unspecified'
    )
      .toLowerCase()
      .includes(filter.searchTerm.toLowerCase()) ||
    node.asset?.name
      .toLocaleLowerCase()
      .includes(filter.searchTerm.toLowerCase()) ||
    node.markets?.some((m) =>
      m?.tradableInstrument?.instrument?.name
        .toLocaleLowerCase()
        .includes(filter.searchTerm.toLowerCase())
    )
  ) {
    return true;
  }

  return false;
};

export const ActiveRewards = ({ currentEpoch }: { currentEpoch: number }) => {
  const t = useT();
  const { data: allRewards } = useRewards({
    onlyActive: true,
  });
  // filter out the rewards that are scoped to teams on this page
  // we display those on the `Competitions` page
  const data = allRewards.filter((r) => !isScopedToTeams(r));

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

  const [filter, setFilter] = useState<Filter>({
    searchTerm: '',
  });

  if (!data || !data.length) return null;

  const cards = data
    .filter((n) => applyFilter(n, filter))
    // filter out the cards (rewards) for which all of the markets
    // are settled
    .filter((n) => !areAllMarketsSettled(n));

  const groupedCards = Object.values(groupBy(cards, determineCardGroup));

  return (
    <div className="flex flex-col gap-2" data-testid="active-rewards-card">
      <header className="flex justify-between items-center gap-4">
        <h2 className="text-xl">{t('Active rewards')}</h2>

        {/** CARDS FILTER */}
        {data.length > 1 && (
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

const determineCardGroup = (
  reward: EnrichedRewardTransfer<DispatchStrategy | StakingDispatchStrategy>
) =>
  [
    // groups by:
    // reward asset (usually VEGA)
    reward.transfer.asset?.symbol,
    // reward for (dispatch metric)
    reward.transfer.kind.dispatchStrategy.dispatchMetric,
    // reward scope (teams vs individuals)
    reward.transfer.kind.dispatchStrategy.entityScope,
    // reward distribution strategy
    reward.transfer.kind.dispatchStrategy.distributionStrategy,
  ].join('-');
