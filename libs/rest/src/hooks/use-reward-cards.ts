import { useQuery } from '@tanstack/react-query';
import { rewardCardsOptions } from '../queries/reward-cards';

export function useRewardCards() {
  const queryResult = useQuery(rewardCardsOptions());
  return queryResult;
}
