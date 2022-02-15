import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { Blocks } from "./home";
import { Block } from "./id";

const BlockPage = () => {
  const match = useRouteMatch();

  return (
    <Switch>
      <Route path={match.path} exact={true}>
        <Blocks />
      </Route>
      <Route path={`${match.path}/:block`}>
        <Block />
      </Route>
    </Switch>
  );
};

export default BlockPage;
