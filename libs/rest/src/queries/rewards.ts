import { removePaginationWrapper } from '@vegaprotocol/utils';
import { restApiUrl } from '../paths';
import { type v2ListRewardsResponse } from '@vegaprotocol/rest-clients/dist/trading-data';
import axios from 'axios';
import { z } from 'zod';

export const rewardSchema = z.object({
  gameId: z.string(),
  marketId: z.string(),
  partyId: z.string(),
});
export type Reward = z.infer<typeof rewardSchema>;

const rewardsSchema = z.array(rewardSchema);

export const retrieveRewards = async () => {
  const endpoint = restApiUrl('/api/v2/rewards');
  const res = await axios.get<v2ListRewardsResponse>(endpoint);
  const rewards = removePaginationWrapper(res.data.rewards?.edges).map(
    (reward) => {
      return {
        gameId: reward.gameId,
        marketId: reward.marketId,
        partyId: reward.partyId,
      };
    }
  );

  return rewardsSchema.parse(rewards);
};

export const queryKeys = {
  all: ['rewards'],
  list: () => [...queryKeys.all, 'list'],
} as const;
