import { formatNumber, toBigNum } from '@vegaprotocol/utils';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import { useAppState } from '../../../contexts/app-state/app-state-context';
import {
  rowGridItemStyles,
  RewardsTable,
} from '../shared-rewards-table-assets/shared-rewards-table-assets';
import type { EpochTotalSummary } from './generate-epoch-total-rewards-list';

interface EpochTotalRewardsGridProps {
  data: EpochTotalSummary;
}

interface RewardItemProps {
  value: string;
  dataTestId: string;
  last?: boolean;
}

const DisplayReward = ({ reward }: { reward: string }) => {
  const {
    appState: { decimals },
  } = useAppState();

  if (Number(reward) === 0) {
    return <span className="text-vega-dark-300">-</span>;
  }

  return (
    <Tooltip description={formatNumber(toBigNum(reward, decimals), decimals)}>
      <button>{formatNumber(toBigNum(reward, decimals))}</button>
    </Tooltip>
  );
};

const RewardItem = ({ value, dataTestId, last }: RewardItemProps) => (
  <div data-testid={dataTestId} className={rowGridItemStyles(last)}>
    <div className="h-full w-5 absolute right-0 top-0 bg-gradient-to-r from-transparent to-black pointer-events-none" />
    <div className="overflow-auto p-5">
      <DisplayReward reward={value} />
    </div>
    <div className="h-full w-5 absolute left-0 top-0 bg-gradient-to-l from-transparent to-black pointer-events-none" />
  </div>
);

export const EpochTotalRewardsTable = ({
  data,
}: EpochTotalRewardsGridProps) => {
  return (
    <RewardsTable dataTestId="epoch-total-rewards-table" epoch={data.epoch}>
      {Array.from(data.assetRewards.values()).map(
        ({ name, rewards, totalAmount }, i) => (
          <div className="contents" key={i}>
            <div data-testid="asset" className={`${rowGridItemStyles()} p-5`}>
              {name}
            </div>
            {Array.from(rewards.values()).map(({ rewardType, amount }, i) => (
              <RewardItem key={i} dataTestId={rewardType} value={amount} />
            ))}
            <RewardItem dataTestId="total" value={totalAmount} last={true} />
          </div>
        )
      )}
    </RewardsTable>
  );
};
