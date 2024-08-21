import { Links } from '../../lib/links';
import { Button } from '../../components/ui/button';
import { usePageTitle } from '../../lib/hooks/use-page-title';
import { t } from '../../lib/use-t';
import { Link } from 'react-router-dom';

export const Explore = () => {
  usePageTitle(t('Referrals'));
  return (
    <>
      <h1 className="text-3xl lg:text-6xl leading-[1em] font-alt calt mb-2 lg:mb-10">
        {t('EXPLORE_TITLE')}
      </h1>
      <p>{t('EXPLORE_DESCRIPTION')}</p>
      <p>
        <Link to={Links.AMM_POOLS()}>
          <Button variant="default">{t('POOLS_GOTO_POOLS')}</Button>
        </Link>
      </p>
    </>
  );
};
