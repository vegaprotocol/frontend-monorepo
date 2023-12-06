import { useEffect } from 'react';
import { titlefy } from '@vegaprotocol/utils';
import { ErrorBoundary } from '../../components/error-boundary';
import { FeesContainer } from '../../components/fees-container';
import { useT } from '../../lib/use-t';
import { usePageTitleStore } from '../../stores';

export const Fees = () => {
  const t = useT();
  const title = t('Fees');
  const { updateTitle } = usePageTitleStore((store) => ({
    updateTitle: store.updateTitle,
  }));

  useEffect(() => {
    updateTitle(titlefy([title]));
  }, [updateTitle, title]);

  return (
    <ErrorBoundary feature="fees">
      <div className="container p-4 mx-auto">
        <h1 className="px-4 pb-4 text-2xl">{title}</h1>
        <FeesContainer />
      </div>
    </ErrorBoundary>
  );
};
