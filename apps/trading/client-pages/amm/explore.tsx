import { Links } from '../../lib/links';
import { usePageTitle } from '../../lib/hooks/use-page-title';
import { t } from '../../lib/use-t';
import { Link } from 'react-router-dom';
import { HeaderPage } from '../../components/header-page';
import { Button } from '@vegaprotocol/ui-toolkit';

export const Explore = () => {
  usePageTitle(t('Referrals'));
  return (
    <>
      <HeaderPage>{t('AMM_EXPLORE_TITLE')}</HeaderPage>
      <p>{t('AMM_EXPLORE_DESCRIPTION')}</p>
      <p>
        <Link to={Links.AMM_POOLS()}>
          <Button>{t('AMM_POOLS_GOTO_POOLS')}</Button>
        </Link>
      </p>
    </>
  );
};
