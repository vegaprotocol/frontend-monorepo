import { Outlet } from 'react-router-dom';

import { useDocumentTitle } from '../../hooks/use-document-title';
import type { RouteChildProps } from '..';
import { ProposalContainer } from './proposal';
import { ProposalsContainer } from './proposals';

const GovernanceRouter = ({ name }: RouteChildProps) => {
  useDocumentTitle(name);

  return <Outlet />;
};

export default GovernanceRouter;
