import { useTranslation } from "react-i18next";
import { Route, Switch, useRouteMatch } from "react-router-dom";

import { Heading } from "../../components/heading";
import { SplashLoader } from "../../components/splash-loader";
import { SplashScreen } from "../../components/splash-screen";
import { useDocumentTitle } from "../../hooks/use-document-title";
import { useTranches } from "../../hooks/use-tranches";
import { RouteChildProps } from "..";
import { Tranche } from "./tranche";
import { Tranches } from "./tranches";

const TrancheRouter = ({ name }: RouteChildProps) => {
  useDocumentTitle(name);
  const { t } = useTranslation();
  const match = useRouteMatch();
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
      <Heading title={t("pageTitleTranches")} />
      <Switch>
        <Route path={match.path} exact>
          <Tranches tranches={tranches} />
        </Route>
        <Route path={`${match.path}/:trancheId`}>
          <Tranche tranches={tranches} />
        </Route>
      </Switch>
    </>
  );
};

export default TrancheRouter;
