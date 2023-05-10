import { formatNumber, toBigNum } from '@vegaprotocol/utils';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import { useAppState } from '../../../contexts/app-state/app-state-context';
import {
  rowGridItemStyles,
  RewardsTable,
} from '../shared-rewards-table-assets/shared-rewards-table-assets';
import type { EpochIndividualReward } from './generate-epoch-individual-rewards-list';
import { useTranslation } from 'react-i18next';

interface EpochIndividualRewardsGridProps {
  data: EpochIndividualReward;
  marketCreationQuantumMultiple: string | null;
}

interface RewardItemProps {
  value: string;
  percentageOfTotal?: string;
  dataTestId: string;
  last?: boolean;
}

const DisplayReward = ({
  reward,
  percentageOfTotal,
}: {
  reward: string;
  percentageOfTotal?: string;
}) => {
  const { t } = useTranslation();
  const {
    appState: { decimals },
  } = useAppState();

  if (Number(reward) === 0) {
    return <span className="text-vega-dark-300">-</span>;
  }

  return (
    <Tooltip
      description={
        <div className="flex flex-col items-start">
          <span>{formatNumber(toBigNum(reward, decimals), decimals)}</span>
          {percentageOfTotal && (
            <span className="text-vega-dark-300">
              ({percentageOfTotal}% {t('ofTotalDistributed')})
            </span>
          )}
        </div>
      }
    >
      <button>
        <div className="flex flex-col items-start">
          <span>{formatNumber(toBigNum(reward, decimals), 4)}</span>
          {percentageOfTotal && (
            <span className="text-vega-dark-300">
              ({formatNumber(percentageOfTotal, 4).toString()}
              %)
            </span>
          )}
        </div>
      </button>
    </Tooltip>
  );
};

const RewardItem = ({
  value,
  percentageOfTotal,
  dataTestId,
  last,
}: RewardItemProps) => (
  <div data-testid={dataTestId} className={rowGridItemStyles(last)}>
    <div className="h-full w-5 absolute right-0 top-0 bg-gradient-to-r from-transparent to-black pointer-events-none" />
    <div className="overflow-auto p-5">
      <DisplayReward reward={value} percentageOfTotal={percentageOfTotal} />
    </div>
    <div className="h-full w-5 absolute left-0 top-0 bg-gradient-to-l from-transparent to-black pointer-events-none" />
  </div>
);

export const EpochIndividualRewardsTable = ({
  data,
  marketCreationQuantumMultiple,
}: EpochIndividualRewardsGridProps) => {
  return (
    <RewardsTable
      marketCreationQuantumMultiple={marketCreationQuantumMultiple}
      dataTestId="epoch-individual-rewards-table"
      epoch={Number(data.epoch)}
    >
      {data.rewards.map(({ asset, rewardTypes, totalAmount }, i) => (
        <div className="contents" key={i}>
          <div
            data-testid="individual-rewards-asset"
            className={`${rowGridItemStyles()} p-5`}
          >
            {asset}
          </div>
          {Object.entries(rewardTypes).map(
            ([key, { amount, percentageOfTotal }]) => (
              <RewardItem
                key={key}
                value={amount}
                percentageOfTotal={percentageOfTotal}
                dataTestId={key}
              />
            )
          )}
          <RewardItem dataTestId="total" value={totalAmount} last={true} />
        </div>
      ))}
    </RewardsTable>
  );
};
