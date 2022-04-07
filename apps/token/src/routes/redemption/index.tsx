import { useTranslation } from 'react-i18next';

import { Heading } from '../../components/heading';
import { useDocumentTitle } from '../../hooks/use-document-title';
import type { RouteChildProps } from '..';
import RedemptionRouter from './redemption';

const RedemptionIndex = ({ name }: RouteChildProps) => {
  useDocumentTitle(name);
  const { t } = useTranslation();
  const tranche = ':id';

  return (
    <>
      <Heading
        title={
          tranche ? t('pageTitleRedemptionTranche') : t('pageTitleRedemption')
        }
      />
      <RedemptionRouter />
    </>
  );
};

export default RedemptionIndex;
