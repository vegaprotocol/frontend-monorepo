import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';

import { Heading } from '../../components/heading';
import { SplashLoader } from '../../components/splash-loader';
import { useDocumentTitle } from '../../hooks/use-document-title';
import { useTranches } from '../../hooks/use-tranches';
import type { RouteChildProps } from '..';
import { Splash } from '@vegaprotocol/ui-toolkit';

const TrancheRouter = ({ name }: RouteChildProps) => {
  useDocumentTitle(name);
  const { t } = useTranslation();
  const { tranches } = useTranches();

  if (!tranches) {
    return (
      <Splash>
        <SplashLoader />
      </Splash>
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
