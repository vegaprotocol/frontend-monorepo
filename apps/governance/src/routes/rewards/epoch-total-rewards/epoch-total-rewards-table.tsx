import { formatNumber, toBigNum } from '@vegaprotocol/utils';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import {
  rowGridItemStyles,
  RewardsTable,
} from '../shared-rewards-table-assets/shared-rewards-table-assets';
import type { EpochTotalSummary } from './generate-epoch-total-rewards-list';

interface EpochTotalRewardsGridProps {
  data: EpochTotalSummary;
  marketCreationQuantumMultiple: string | null;
}

interface RewardItemProps {
  amount: string;
  decimals: number;
  dataTestId: string;
  last?: boolean;
}

const DisplayReward = ({
  reward,
  decimals,
}: {
  reward: string;
  decimals: number;
}) => {
  if (Number(reward) === 0) {
    return <span className="text-vega-dark-300">-</span>;
  }

  return (
    <Tooltip description={formatNumber(toBigNum(reward, decimals), decimals)}>
      <button>{formatNumber(toBigNum(reward, decimals))}</button>
    </Tooltip>
  );
};

const RewardItem = ({
  amount,
  decimals,
  dataTestId,
  last,
}: RewardItemProps) => (
  <div data-testid={dataTestId} className={rowGridItemStyles(last)}>
    <div className="h-full w-5 absolute right-0 top-0 bg-gradient-to-r from-transparent to-black pointer-events-none" />
    <div className="overflow-auto p-5">
      <DisplayReward reward={amount} decimals={decimals} />
    </div>
    <div className="h-full w-5 absolute left-0 top-0 bg-gradient-to-l from-transparent to-black pointer-events-none" />
  </div>
);

export const EpochTotalRewardsTable = ({
  data,
  marketCreationQuantumMultiple,
}: EpochTotalRewardsGridProps) => {
  return (
    <RewardsTable
      marketCreationQuantumMultiple={marketCreationQuantumMultiple}
      dataTestId="epoch-total-rewards-table"
      epoch={data.epoch}
    >
      {Array.from(data.assetRewards.values()).map(
        ({ name, rewards, totalAmount, decimals }, i) => (
          <div className="contents" key={i}>
            <div data-testid="asset" className={`${rowGridItemStyles()} p-5`}>
              {name}
            </div>
            {Array.from(rewards.values()).map(({ rewardType, amount }, i) => (
              <RewardItem
                key={i}
                dataTestId={rewardType}
                amount={amount}
                decimals={decimals}
              />
            ))}
            <RewardItem
              dataTestId="total"
              amount={totalAmount}
              decimals={decimals}
              last={true}
            />
          </div>
        )
      )}
    </RewardsTable>
  );
};
