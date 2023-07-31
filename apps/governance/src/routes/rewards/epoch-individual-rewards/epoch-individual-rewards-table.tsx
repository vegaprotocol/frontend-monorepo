import { formatNumber, toBigNum } from '@vegaprotocol/utils';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import {
  rowGridItemStyles,
  RewardsTable,
} from '../shared-rewards-table-assets/shared-rewards-table-assets';
import type { EpochIndividualReward } from './generate-epoch-individual-rewards-list';

interface EpochIndividualRewardsGridProps {
  data: EpochIndividualReward;
}

interface RewardItemProps {
  amount: string;
  decimals: number;
  percentageOfTotal?: string;
  dataTestId: string;
  last?: boolean;
}

const DisplayReward = ({
  reward,
  decimals,
}: {
  reward: string;
  decimals: number;
  percentageOfTotal?: string;
}) => {
  if (Number(reward) === 0) {
    return <span className="text-vega-dark-300">-</span>;
  }

  return (
    <Tooltip
      description={
        <div className="flex flex-col items-start">
          <span>{formatNumber(toBigNum(reward, decimals), decimals)}</span>
        </div>
      }
    >
      <button>
        <div className="flex flex-col items-start">
          <span>{formatNumber(toBigNum(reward, decimals), 4)}</span>
        </div>
      </button>
    </Tooltip>
  );
};

const RewardItem = ({
  amount,
  decimals,
  percentageOfTotal,
  dataTestId,
  last,
}: RewardItemProps) => (
  <div data-testid={dataTestId} className={rowGridItemStyles(last)}>
    <div className="h-full w-5 absolute right-0 top-0 bg-gradient-to-r from-transparent to-black pointer-events-none" />
    <div className="overflow-auto p-5">
      <DisplayReward
        reward={amount}
        decimals={decimals}
        percentageOfTotal={percentageOfTotal}
      />
    </div>
    <div className="h-full w-5 absolute left-0 top-0 bg-gradient-to-l from-transparent to-black pointer-events-none" />
  </div>
);

export const EpochIndividualRewardsTable = ({
  data,
}: EpochIndividualRewardsGridProps) => {
  return (
    <RewardsTable
      dataTestId="epoch-individual-rewards-table"
      epoch={Number(data.epoch)}
    >
      {data.rewards.map(({ asset, rewardTypes, totalAmount, decimals }, i) => (
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
                amount={amount}
                decimals={decimals}
                percentageOfTotal={percentageOfTotal}
                dataTestId={key}
              />
            )
          )}
          <RewardItem
            dataTestId="total"
            amount={totalAmount}
            decimals={decimals}
            last={true}
          />
        </div>
      ))}
    </RewardsTable>
  );
};
