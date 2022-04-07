import { Route, Switch, useRouteMatch } from "react-router-dom";

import { useDocumentTitle } from "../../hooks/use-document-title";
import { RouteChildProps } from "..";
import { ProposalContainer } from "./proposal";
import { ProposalsContainer } from "./proposals";

const GovernanceRouter = ({ name }: RouteChildProps) => {
  const match = useRouteMatch();
  useDocumentTitle(name);

  return (
    <Switch>
      <Route path={match.path} exact>
        <ProposalsContainer />
      </Route>
      <Route path={`${match.path}/:proposalId`}>
        <ProposalContainer />
      </Route>
    </Switch>
  );
};

export default GovernanceRouter;
