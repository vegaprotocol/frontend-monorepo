import React from 'react';
import { Outlet } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/use-document-title';
import type { RouteChildProps } from '..';

const StakingRouter = ({ name }: RouteChildProps) => {
  useDocumentTitle(name);

  return <Outlet />;
};

export default StakingRouter;
