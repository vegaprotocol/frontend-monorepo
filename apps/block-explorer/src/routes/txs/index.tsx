import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { Txs } from "./home";
import { Tx } from "./id";

const TxPage = () => {
  const match = useRouteMatch();
  console.log(match);
  return (
    <Switch>
      <Route path={match.path} exact={true}>
        <Txs />
      </Route>
      <Route path={`${match.path}/:txHash`}>
        <Tx />
      </Route>
    </Switch>
  );
};

export default TxPage;
