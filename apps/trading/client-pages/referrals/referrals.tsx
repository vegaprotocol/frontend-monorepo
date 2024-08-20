import {
  Loader,
  AnchorButton,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { TiersContainer } from './tiers';
import { TabLink } from './buttons';
import { Outlet, useMatch } from 'react-router-dom';
import { Routes } from '../../lib/links';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { REFERRAL_DOCS_LINK } from './constants';
import { cn } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import { ErrorBoundary } from '../../components/error-boundary';
import { usePageTitle } from '../../lib/hooks/use-page-title';
import { useFindReferralSet } from './hooks/use-find-referral-set';
import { HeaderHero } from '../../components/header-hero';

const Nav = () => {
  const t = useT();
  const match = useMatch(Routes.REFERRALS_APPLY_CODE);
  return (
    <nav className="flex justify-center border-b border-gs-300 dark:border-gs-700">
      <TabLink end to={match ? Routes.REFERRALS_APPLY_CODE : Routes.REFERRALS}>
        {t('Apply code')}
      </TabLink>
      <TabLink to={Routes.REFERRALS_CREATE_CODE}>{t('Create code')}</TabLink>
    </nav>
  );
};

export const Referrals = () => {
  const t = useT();
  const { pubKey } = useVegaWallet();

  const { data, loading, error } = useFindReferralSet(pubKey);

  const showNav = !loading && !error && !data;

  usePageTitle(t('Referrals'));

  return (
    <ErrorBoundary feature="referrals">
      <HeaderHero title={t('Vega community referrals')}>
        <p>
          {t(
            'Referral programs can be proposed and created via community governance.'
          )}
        </p>
        <p>
          {t(
            'Once live, users can generate referral codes to share with their friends and earn commission on their trades, while referred traders can access fee discounts based on the running volume of the group.'
          )}
        </p>
      </HeaderHero>

      {showNav && <Nav />}

      <section
        className={cn({
          'py-4 lg:py-8': showNav,
          'h-[300px] relative': loading || error,
        })}
      >
        {loading ? (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Loader />
          </div>
        ) : error ? (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <p>{t('Something went wrong')}</p>
            <span className="text-xs">{error.message}</span>
          </div>
        ) : (
          <Outlet />
        )}
      </section>

      <section>
        <TiersContainer />
      </section>

      <section className="py-14 flex flex-col justify-center items-center gap-4">
        <h2 className="text-2xl">{t('How it works')}</h2>
        <AnchorButton href={REFERRAL_DOCS_LINK} target="_blank">
          {t('Read the docs')} <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} />
        </AnchorButton>
      </section>
    </ErrorBoundary>
  );
};
