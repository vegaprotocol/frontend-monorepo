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
    <div className="grid grid-cols-3 gap-4">
      {data?.map(({ title, description, tags, link }, i) => {
        return (
          <SimpleRewardCard
            key={`simple-reward-card-${i}`}
            title={title}
            description={description}
            tags={tags}
            link={link}
          />
        );
      })}
    </div>
  );
};

/**

MD:

This is a description that returns onto a maximum number of lines to be defined. It may also be truncated at 3 or 4 lines.

* **1,666.58 NEB**
* Distribution strategy: Pro rata 
* Reward pool amount and asset
* Another bullet point
* Another bullet point

 */
