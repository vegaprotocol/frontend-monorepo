import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';

import { Heading } from '../../components/heading';
import { SplashLoader } from '../../components/splash-loader';
import { SplashScreen } from '../../components/splash-screen';
import { useDocumentTitle } from '../../hooks/use-document-title';
import { useTranches } from '../../hooks/use-tranches';
import type { RouteChildProps } from '..';
import { Tranche } from './tranche';
import { Tranches } from './tranches';

const TrancheRouter = ({ name }: RouteChildProps) => {
  useDocumentTitle(name);
  const { t } = useTranslation();
  const { tranches } = useTranches();

  if (!tranches) {
    return (
      <SplashScreen>
        <SplashLoader />
      </SplashScreen>
    );
  }

  return (
    <>
      <Heading title={t('pageTitleTranches')} />
      <Routes>
        <Route path=":trancheId">
          <Tranche tranches={tranches} />
        </Route>
        <Route path="/">
          <Tranches tranches={tranches} />
        </Route>
      </Routes>
    </>
  );
};

export default TrancheRouter;
