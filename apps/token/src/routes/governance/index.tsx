import { Route, Routes } from 'react-router-dom';

import { useDocumentTitle } from '../../hooks/use-document-title';
import type { RouteChildProps } from '..';
import { ProposalContainer } from './proposal';
import { ProposalsContainer } from './proposals';

const GovernanceRouter = ({ name }: RouteChildProps) => {
  useDocumentTitle(name);

  return (
    <Routes>
      <Route path=":proposalId">
        <ProposalContainer />
      </Route>
      <Route path="/">
        <ProposalsContainer />
      </Route>
    </Routes>
  );
};

export default GovernanceRouter;
