import {
  TradingAnchorButton,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { HowItWorksTable } from './how-it-works-table';
import { LandingBanner } from './landing-banner';
import { TiersContainer } from './tiers';
import { RainbowTabLink } from './buttons';
import { Outlet } from 'react-router-dom';
import { Routes } from '../../lib/links';

export const Referrals = () => {
  return (
    <>
      <LandingBanner />
      <div>
        <div className="flex justify-center">
          <RainbowTabLink end to={Routes.REFERRALS}>
            Your referrals
          </RainbowTabLink>
          <RainbowTabLink to={Routes.REFERRALS_APPLY_CODE}>
            Apply a code
          </RainbowTabLink>
        </div>
        <div className="py-16 border-t border-b border-vega-cdark-500">
          <Outlet />
        </div>
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
            href="https://docs.vega.xyz/"
            target="_blank"
          >
            Read the terms <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} />
          </TradingAnchorButton>
        </div>
      </div>
    </>
  );
};
