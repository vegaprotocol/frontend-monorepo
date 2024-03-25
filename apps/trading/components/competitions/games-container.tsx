import { useT } from '../../lib/use-t';
import { type EnrichedRewardTransfer } from '../../lib/hooks/use-rewards';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useStakeAvailable } from '../../lib/hooks/use-stake-available';
import { useMyTeam } from '../../lib/hooks/use-my-team';
import {
  ActiveRewardCard,
  areAllMarketsSettled,
} from '../rewards-container/reward-card';
import {
  VegaIcon,
  VegaIconNames,
  TradingInput,
} from '@vegaprotocol/ui-toolkit';
import { useState } from 'react';
import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import { type MarketFieldsFragment } from '@vegaprotocol/markets';
import {
  type TransferNode,
  DispatchMetricLabels,
  EntityScopeLabelMapping,
  AccountType,
} from '@vegaprotocol/types';

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

  if (transfer.kind.__typename !== 'RecurringTransfer') {
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

export const GamesContainer = ({
  data,
  currentEpoch,
}: {
  data: EnrichedRewardTransfer[];
  currentEpoch: number;
}) => {
  const t = useT();
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

  if (!data || data.length === 0) {
    return (
      <p className="text-sm">
        {t('Currently no active games on the network.')}
      </p>
    );
  }

  return (
    <div>
      {/** CARDS FILTER */}
      {data.length > 1 && (
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
          className="mb-4 w-20 mr-2 max-w-xl"
          prependElement={<VegaIcon name={VegaIconNames.SEARCH} />}
        />
      )}
      {/** CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data
          .filter((n) => applyFilter(n, filter))
          // filter out the cards (rewards) for which all of the markets
          // are settled
          .filter((n) => !areAllMarketsSettled(n))
          .map((game, i) => {
            // TODO: Remove `kind` prop from ActiveRewardCard
            const { transfer } = game;
            if (!transfer.kind.dispatchStrategy?.dispatchMetric) {
              return null;
            }
            return (
              <ActiveRewardCard
                key={i}
                transferNode={game}
                currentEpoch={currentEpoch}
                requirements={requirements}
              />
            );
          })}
      </div>
    </div>
  );
};
