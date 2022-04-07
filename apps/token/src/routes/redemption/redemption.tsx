import { Callout } from "@vegaprotocol/ui-toolkit";
import { useWeb3React } from "@web3-react/core";
import React from "react";
import { useTranslation } from "react-i18next";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { Link } from "react-router-dom";

import { EthConnectPrompt } from "../../components/eth-connect-prompt";
import { SplashLoader } from "../../components/splash-loader";
import { SplashScreen } from "../../components/splash-screen";
import { useAppState } from "../../contexts/app-state/app-state-context";
import { useContracts } from "../../contexts/contracts/contracts-context";
import { useTranches } from "../../hooks/use-tranches";
import { Routes } from "../router-config";
import { RedemptionInformation } from "./home/redemption-information";
import {
  initialRedemptionState,
  RedemptionActionType,
  redemptionReducer,
} from "./redemption-reducer";
import { RedeemFromTranche } from "./tranche";

const RedemptionRouter = () => {
  const { t } = useTranslation();
  const match = useRouteMatch();
  const { vesting } = useContracts();
  const [state, dispatch] = React.useReducer(
    redemptionReducer,
    initialRedemptionState
  );
  const {
    appState: { trancheBalances },
  } = useAppState();
  const { account } = useWeb3React();
  const { tranches, error } = useTranches();

  React.useEffect(() => {
    const run = (address: string) => {
      const userTranches = tranches?.filter((t) =>
        t.users.some(
          ({ address: a }) => a.toLowerCase() === address.toLowerCase()
        )
      );

      if (userTranches) {
        dispatch({
          type: RedemptionActionType.SET_USER_TRANCHES,
          userTranches,
        });
      }
    };

    if (account) {
      run(account);
    }
  }, [account, tranches, vesting]);

  if (error) {
    return (
      <Callout intent="error" title={t("errorLoadingTranches")}>
        {error}
      </Callout>
    );
  }

  if (!tranches) {
    return (
      <SplashScreen>
        <SplashLoader />
      </SplashScreen>
    );
  }

  if (!account) {
    return (
      <EthConnectPrompt>
        <p data-testid="eth-connect-prompt">
          {t(
            "Use the Ethereum wallet you want to send your tokens to. You'll also need enough Ethereum to pay gas."
          )}
        </p>
      </EthConnectPrompt>
    );
  }

  if (!trancheBalances.length) {
    return (
      <>
        <Callout>
          <p>{t("You have no VEGA tokens currently vesting.")}</p>
        </Callout>
        <Link to={Routes.TRANCHES}>{t("viewAllTranches")}</Link>
      </>
    );
  }

  return (
    <Switch>
      <Route exact path={`${match.path}`}>
        <RedemptionInformation state={state} address={account} />
      </Route>
      <Route path={`${match.path}/:id`}>
        <RedeemFromTranche state={state} address={account} />
      </Route>
    </Switch>
  );
};

export default RedemptionRouter;
