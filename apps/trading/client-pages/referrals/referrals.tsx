import {
  Loader,
  TradingAnchorButton,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { HowItWorksTable } from './how-it-works-table';
import { LandingBanner } from './landing-banner';
import { TiersContainer } from './tiers';
import { TabLink } from './buttons';
import { Outlet } from 'react-router-dom';
import { Routes } from '../../lib/links';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useReferral } from './hooks/use-referral';
import { REFERRAL_DOCS_LINK } from './constants';
import classNames from 'classnames';
import { usePageTitleStore } from '../../stores';
import { useEffect } from 'react';
import { titlefy } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';

const Nav = () => (
  <div className="flex justify-center border-b border-vega-cdark-500">
    <TabLink end to={Routes.REFERRALS}>
      I want a code
    </TabLink>
    <TabLink to={Routes.REFERRALS_APPLY_CODE}>I have a code</TabLink>
  </div>
);

export const Referrals = () => {
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

  const { updateTitle } = usePageTitleStore((store) => ({
    updateTitle: store.updateTitle,
  }));

  useEffect(() => {
    updateTitle(titlefy([t('Referrals')]));
  }, [updateTitle]);

  return (
    <>
      <LandingBanner />

      {showNav && <Nav />}
      <div
        className={classNames({
          'py-16': showNav,
          'h-[300px] relative': loading || error,
        })}
      >
        {loading ? (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Loader />
          </div>
        ) : error ? (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <p>Something went wrong</p>
            <span className="text-xs">{error.message}</span>
          </div>
        ) : (
          <Outlet />
        )}
      </div>

      <TiersContainer />

      <div className="mt-10 mb-5 text-center">
        <h2 className="text-2xl">How it works</h2>
      </div>
      <div className="md:w-[60%] mx-auto">
        <HowItWorksTable />
        <div className="mt-5">
          <TradingAnchorButton
            className="mx-auto w-max"
            href={REFERRAL_DOCS_LINK}
            target="_blank"
          >
            Read the terms <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} />
          </TradingAnchorButton>
        </div>
      </div>
    </>
  );
};
