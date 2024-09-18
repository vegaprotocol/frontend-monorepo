import { queryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';

const rewardCardSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  link: z.string(),
});

const rewardCardsSchema = z.array(rewardCardSchema);

type RewardCardsResponse = z.infer<typeof rewardCardsSchema>;

export const retrieveRewardCards = async () => {
  const endpoint = '/reward-cards.json';
  const res = await axios.get<RewardCardsResponse>(endpoint);

  return rewardCardsSchema.parse(res.data);
};

export const queryKeys = {
  all: ['reward-cards'],
  list: () => [...queryKeys.all, 'list'],
} as const;

export function rewardCardsOptions() {
  return queryOptions({
    queryKey: queryKeys.all,
    queryFn: () => retrieveRewardCards(),
    staleTime: 1,
    // staleTime: Time.DAY,
  });
}
