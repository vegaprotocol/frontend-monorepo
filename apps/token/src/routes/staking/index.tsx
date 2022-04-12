import React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';

import { Heading } from '../../components/heading';
import { useDocumentTitle } from '../../hooks/use-document-title';
import type { RouteChildProps } from '..';

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
      <Outlet />
    </>
  );
};

export default StakingRouter;
