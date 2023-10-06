import {
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
  const { data: referee } = useReferral(pubKey, 'referee');
  const { data: referrer } = useReferral(pubKey, 'referrer');

  const showNav = !referrer && !referee;

  return (
    <>
      <LandingBanner />

      {showNav && <Nav />}
      <div className={classNames({ 'py-16': showNav })}>
        <Outlet />
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
