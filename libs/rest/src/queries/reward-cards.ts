import { queryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';
import { Time } from '../utils';

const rewardCardSchema = z.object({
  rewardId: z.string(),
  title: z.string(),
  img: z.string(),
  description: z.string(),
  tags: z.array(
    z.object({
      text: z.string(),
      variant: z.enum(['primary', 'secondary', 'tertiary']),
    })
  ),
});

const rewardCardsSchema = z.array(rewardCardSchema);

export type RewardCard = z.infer<typeof rewardCardSchema>;
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
    staleTime: Time.HOUR,
  });
}
