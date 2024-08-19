import { formatNumber, toBigNum } from '@vegaprotocol/utils';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import {
  rowGridItemStyles,
  RewardsTable,
} from '../shared-rewards-table-assets/shared-rewards-table-assets';
import type { EpochIndividualReward } from './generate-epoch-individual-rewards-list';
import { useWallet } from '@vegaprotocol/wallet-react';
import { EmblemByAsset } from '@vegaprotocol/emblem';

interface EpochIndividualRewardsGridProps {
  data: EpochIndividualReward;
  marketCreationQuantumMultiple: string | null;
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
    return <span>-</span>;
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
  marketCreationQuantumMultiple,
}: EpochIndividualRewardsGridProps) => {
  const vegaChainId = useWallet((store) => store.chainId);
  return (
    <RewardsTable
      marketCreationQuantumMultiple={marketCreationQuantumMultiple}
      dataTestId="epoch-individual-rewards-table"
      epoch={Number(data.epoch)}
    >
      {data.rewards.map(
        ({ assetId, asset, rewardTypes, totalAmount, decimals }, i) => (
          <div className="contents" key={i}>
            <div className={`${rowGridItemStyles()} p-5`}>
              <div className="flex items-center gap-2">
                {assetId && (
                  <div className="w-6 h-6">
                    <EmblemByAsset asset={assetId} vegaChain={vegaChainId} />
                  </div>
                )}
                <span data-testid="individual-rewards-asset">{asset}</span>
              </div>
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
        )
      )}
    </RewardsTable>
  );
};
