import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';

import { Heading } from '../../components/heading';
import { SplashLoader } from '../../components/splash-loader';
import { useDocumentTitle } from '../../hooks/use-document-title';
import type { RouteChildProps } from '..';
import { Callout, Intent, Splash } from '@vegaprotocol/ui-toolkit';
import { useTranches } from '../../lib/tranches/tranches-store';

const TrancheRouter = ({ name }: RouteChildProps) => {
  useDocumentTitle(name);
  const { t } = useTranslation();
  const { tranches, error, loading } = useTranches((state) => ({
    loading: state.loading,
    error: state.error,
    tranches: state.tranches,
  }));

  if (!tranches || loading) {
    return (
      <Splash>
        <SplashLoader />
      </Splash>
    );
  }

  if (error) {
    return (
      <Callout intent={Intent.Danger} title={t('errorLoadingTranches')}>
        {error.message}
      </Callout>
    );
  }

  return (
    <>
      <Heading title={t('pageTitleTranches')} />
      <Outlet context={tranches} />
    </>
  );
};

export default TrancheRouter;
