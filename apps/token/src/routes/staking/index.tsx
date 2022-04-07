import React from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';

import { Heading } from '../../components/heading';
import { useDocumentTitle } from '../../hooks/use-document-title';
import type { RouteChildProps } from '..';
import { AssociateContainer } from './associate/associate-page-container';
import { DisassociateContainer } from './disassociate/disassociate-page-container';
import { Staking } from './staking';
import { StakingNodeContainer } from './staking-node';
import { StakingNodesContainer } from './staking-nodes-container';

const StakingRouter = ({ name }: RouteChildProps) => {
  useDocumentTitle(name);
  const { t } = useTranslation();
  const associate = 'associate';
  const disassociate = 'disassociate';

  const title = React.useMemo(() => {
    if (associate) {
      return t('pageTitleAssociate');
    } else if (disassociate) {
      return t('pageTitleDisassociate');
    }
    return t('pageTitleStaking');
  }, [associate, disassociate, t]);

  return (
    <>
      <Heading title={title} />
      <Routes>
        <Route path="associate">
          <AssociateContainer />
        </Route>
        <Route path="disassociate">
          <DisassociateContainer />
        </Route>
        <Route path=":node">
          <StakingNodeContainer />
        </Route>
        <Route path="/">
          <StakingNodesContainer>
            {({ data }) => <Staking data={data} />}
          </StakingNodesContainer>
        </Route>
      </Routes>
    </>
  );
};

export default StakingRouter;
