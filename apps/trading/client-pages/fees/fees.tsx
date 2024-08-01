import { ErrorBoundary } from '../../components/error-boundary';
import { FeesContainer } from '../../components/fees-container';
import { HeaderPage } from '../../components/header-page';
import { useT } from '../../lib/use-t';
import { usePageTitle } from '../../lib/hooks/use-page-title';

export const Fees = () => {
  const t = useT();
  const title = t('Fees');
  usePageTitle(title);

  return (
    <ErrorBoundary feature="fees">
      <HeaderPage>{title}</HeaderPage>
      <FeesContainer />
    </ErrorBoundary>
  );
};
