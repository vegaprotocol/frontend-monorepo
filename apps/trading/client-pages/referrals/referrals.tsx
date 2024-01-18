import {
  Loader,
  TradingAnchorButton,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { LandingBanner } from './landing-banner';
import { TiersContainer } from './tiers';
import { TabLink } from './buttons';
import { Outlet, useMatch } from 'react-router-dom';
import { Routes } from '../../lib/links';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useReferral } from './hooks/use-referral';
import { REFERRAL_DOCS_LINK } from './constants';
import classNames from 'classnames';
import { useT } from '../../lib/use-t';
import { ErrorBoundary } from '../../components/error-boundary';
import { usePageTitle } from '../../lib/hooks/use-page-title';

const Nav = () => {
  const t = useT();
  const match = useMatch(Routes.REFERRALS_APPLY_CODE);
  return (
    <div className="flex justify-center border-b border-vega-cdark-500">
      <TabLink end to={match ? Routes.REFERRALS_APPLY_CODE : Routes.REFERRALS}>
        {t('Apply code')}
      </TabLink>
      <TabLink to={Routes.REFERRALS_CREATE_CODE}>{t('Create code')}</TabLink>
    </div>
  );
};

export const Referrals = () => {
  const t = useT();
  const { pubKey } = useVegaWallet();

  const {
    data: referee,
    loading: refereeLoading,
    error: refereeError,
  } = useReferral({
    pubKey,
    role: 'referee',
  });
  const {
    data: referrer,
    loading: referrerLoading,
    error: referrerError,
  } = useReferral({
    pubKey,
    role: 'referrer',
  });

  const error = refereeError || referrerError;
  const loading = refereeLoading || referrerLoading;
  const showNav = !loading && !error && !referrer && !referee;

  usePageTitle(t('Referrals'));

  return (
    <ErrorBoundary feature="referrals">
      <LandingBanner />

      {showNav && <Nav />}
      <div
        className={classNames({
          'py-8 lg:py-16': showNav,
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
      </div>

      <TiersContainer />

      <div className="mt-10 mb-5 text-center">
        <h2 className="text-2xl">{t('How it works')}</h2>
      </div>
      <div className="md:w-[60%] mx-auto">
        <div className="mt-5">
          <TradingAnchorButton
            className="mx-auto w-max"
            href={REFERRAL_DOCS_LINK}
            target="_blank"
          >
            {t('Read the docs')} <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} />
          </TradingAnchorButton>
        </div>
      </div>
    </ErrorBoundary>
  );
};
