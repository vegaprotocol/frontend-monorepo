import { TinyScroll } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import { RewardsContainer } from '../../components/rewards-container';
import { ErrorBoundary } from '../../components/error-boundary';
import { usePageTitle } from '../../lib/hooks/use-page-title';

export const Rewards = () => {
  const t = useT();
  const title = t('Rewards');
  usePageTitle(title);

  return (
    <ErrorBoundary feature="rewards">
      <TinyScroll className="p-4 max-h-full overflow-auto">
        <h1 className="md:px-4 pb-4 text-2xl">{title}</h1>
        <RewardsContainer />
      </TinyScroll>
    </ErrorBoundary>
  );
};
