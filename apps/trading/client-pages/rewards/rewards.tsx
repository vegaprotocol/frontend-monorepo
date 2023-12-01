import { useT } from '../../lib/use-t';
import { RewardsContainer } from '../../components/rewards-container';
import { usePageTitleStore } from '../../stores';
import { titlefy } from '@vegaprotocol/utils';
import { useEffect } from 'react';

export const Rewards = () => {
  const t = useT();
  const title = t('Rewards');
  const { updateTitle } = usePageTitleStore((store) => ({
    updateTitle: store.updateTitle,
  }));
  useEffect(() => {
    updateTitle(titlefy([title]));
  }, [updateTitle, title]);
  return (
    <div className="container mx-auto p-4">
      <h1 className="px-4 pb-4 text-2xl">{title}</h1>
      <RewardsContainer />
    </div>
  );
};
