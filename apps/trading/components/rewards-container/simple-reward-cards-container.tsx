import { SimpleRewardCard } from './simple-reward-card';
import { Loader } from '@vegaprotocol/ui-toolkit';
import { useRewardCards } from '@vegaprotocol/rest';

export const SimpleRewardCardsContainer = () => {
  const { data, isLoading } = useRewardCards();

  if (isLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {data?.map((card) => {
        return <SimpleRewardCard key={card.rewardId} {...card} />;
      })}
    </div>
  );
};
