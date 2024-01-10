import { useEffect } from 'react';
import { titlefy } from '@vegaprotocol/utils';
import { useT } from '../../lib/use-t';
import { RewardsContainer } from '../../components/rewards-container';
import { usePageTitleStore } from '../../stores';
import { ErrorBoundary } from '../../components/error-boundary';
import { TinyScroll } from '@vegaprotocol/ui-toolkit';

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
    <ErrorBoundary feature="rewards">
      <TinyScroll className="p-4 max-h-full overflow-auto">
        <h1 className="px-4 pb-4 text-2xl">{title}</h1>
        <RewardsContainer />
      </TinyScroll>
    </ErrorBoundary>
  );
};
