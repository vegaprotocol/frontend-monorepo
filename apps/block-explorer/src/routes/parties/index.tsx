import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { Parties } from "./home";
import { Party } from "./id";

const PartiesPage = () => {
  const match = useRouteMatch();

  return (
    <Switch>
      <Route path={match.path} exact={true}>
        <Parties />
      </Route>
      <Route path={`${match.path}/:party`}>
        <Party />
      </Route>
    </Switch>
  );
};

export default PartiesPage;
