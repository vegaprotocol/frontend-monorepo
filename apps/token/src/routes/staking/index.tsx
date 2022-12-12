import React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useMatch } from 'react-router-dom';

import { Heading } from '../../components/heading';
import { useDocumentTitle } from '../../hooks/use-document-title';
import type { RouteChildProps } from '..';

const StakingRouter = ({ name }: RouteChildProps) => {
  useDocumentTitle(name);
  const { t } = useTranslation();
  const associate = useMatch('/validators/associate');
  const disassociate = useMatch('/validators/disassociate');

  const title = React.useMemo(() => {
    if (associate) {
      return t('pageTitleAssociate');
    } else if (disassociate) {
      return t('pageTitleDisassociate');
    }
    return t('pageTitleValidators');
  }, [associate, disassociate, t]);

  return <Outlet />;
};

export default StakingRouter;
