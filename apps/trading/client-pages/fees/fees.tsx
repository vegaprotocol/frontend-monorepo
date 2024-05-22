import { TinyScroll } from '@vegaprotocol/ui-toolkit';
import { ErrorBoundary } from '../../components/error-boundary';
import { FeesContainer } from '../../components/fees-container';
import { useT } from '../../lib/use-t';
import { usePageTitle } from '../../lib/hooks/use-page-title';

export const Fees = () => {
  const t = useT();
  const title = t('Fees');
  usePageTitle(title);

  return (
    <ErrorBoundary feature="fees">
      <TinyScroll className="p-4">
        <h1 className="md:px-4 pb-4 text-2xl">{title}</h1>
        <FeesContainer />
      </TinyScroll>
    </ErrorBoundary>
  );
};
