import groupBy from 'lodash/groupBy';
import { AccountType } from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import { type Asset } from '@vegaprotocol/assets';
import { type PartyRewardsConnection } from './rewards-history';
import { type RewardsHistoryQuery } from './__generated__/Rewards';

const REWARD_ACCOUNT_TYPES = [
  AccountType.ACCOUNT_TYPE_GLOBAL_REWARD,
  AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
  AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES,
  AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES,
  AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS,
  AccountType.ACCOUNT_TYPE_REWARD_AVERAGE_POSITION,
  AccountType.ACCOUNT_TYPE_REWARD_RELATIVE_RETURN,
  AccountType.ACCOUNT_TYPE_REWARD_RETURN_VOLATILITY,
  AccountType.ACCOUNT_TYPE_REWARD_VALIDATOR_RANKING,
];

const getRewards = (
  rewards: Array<{
    rewardType: AccountType;
    assetId: string;
    amount: string;
  }>,
  assets: Record<string, Asset> | null
) => {
  const assetMap = groupBy(
    rewards.filter((r) => REWARD_ACCOUNT_TYPES.includes(r.rewardType)),
    'assetId'
  );

  return Object.keys(assetMap).map((assetId) => {
    const r = assetMap[assetId];
    const asset = assets ? assets[assetId] : undefined;

    const totals = new Map<AccountType, number>();

    REWARD_ACCOUNT_TYPES.forEach((type) => {
      const amountsByType = r
        .filter((a) => a.rewardType === type)
        .map((a) => a.amount);
      const typeTotal = BigNumber.sum.apply(
        null,
        amountsByType.length ? amountsByType : [0]
      );

      totals.set(type, typeTotal.toNumber());
    });

    const total = BigNumber.sum.apply(
      null,
      Array.from(totals).map((entry) => entry[1])
    );

    return {
      asset,
      staking: totals.get(AccountType.ACCOUNT_TYPE_GLOBAL_REWARD),
      priceTaking: totals.get(AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES),
      priceMaking: totals.get(
        AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES
      ),
      liquidityProvision: totals.get(
        AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES
      ),
      marketCreation: totals.get(
        AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS
      ),
      averagePosition: totals.get(
        AccountType.ACCOUNT_TYPE_REWARD_AVERAGE_POSITION
      ),
      relativeReturns: totals.get(
        AccountType.ACCOUNT_TYPE_REWARD_RELATIVE_RETURN
      ),
      returnsVolatility: totals.get(
        AccountType.ACCOUNT_TYPE_REWARD_RETURN_VOLATILITY
      ),
      validatorRanking: totals.get(
        AccountType.ACCOUNT_TYPE_REWARD_VALIDATOR_RANKING
      ),
      total: total.toNumber(),
    };
  });
};

export const useRewardsRowData = ({
  partyRewards,
  epochRewardSummaries,
  assets,
  partyId,
}: {
  partyRewards: PartyRewardsConnection;
  epochRewardSummaries: RewardsHistoryQuery['epochRewardSummaries'];
  assets: Record<string, Asset> | null;
  partyId: string | null;
}) => {
  if (partyId) {
    const rewards = removePaginationWrapper(partyRewards?.edges).map((r) => ({
      rewardType: r.rewardType,
      assetId: r.asset.id,
      amount: r.amount,
    }));
    return getRewards(rewards, assets);
  }

  const rewards = removePaginationWrapper(epochRewardSummaries?.edges);
  return getRewards(rewards, assets);
};
