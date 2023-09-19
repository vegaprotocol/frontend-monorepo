import {
  TradingAnchorButton,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import { HowItWorksTable } from './how-it-works-table';
import { LandingBanner } from './landing-banner';
import { TiersContainer } from './tiers-table';
import { BORDER_COLOR, GRADIENT } from './constants';

import { RainbowTabLink } from './buttons';
import { Outlet } from 'react-router-dom';
import { Tag } from './tag';
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
          <RainbowTabLink to={Routes.REFERRALS_CREATE_CODE}>
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
      <div className="flex flex-row items-baseline justify-between mt-10 mb-5">
        <h2 className="text-2xl">Referral tiers</h2>
        <span className="text-base">
          <span className="text-vega-clight-200 dark:text-vega-cdark-200">
            Program ends:
          </span>{' '}
          16 epochs
        </span>
      </div>
      <div className="mb-20">
        <TiersContainer />
      </div>

      <div className="flex flex-row items-baseline justify-between mb-5">
        <h2 className="text-2xl">Staking multipliers</h2>
      </div>
      <div className="flex flex-col mb-20 jjustify-items-stretch md:flex-row gap-5">
        <div
          className={classNames(
            'overflow-hidden',
            'border rounded-md w-full',
            BORDER_COLOR
          )}
        >
          <div aria-hidden>
            {/* eslint-disable-next-line  @next/next/no-img-element */}
            <img
              src="/1x.png"
              alt="1x multiplier"
              width={768}
              height={400}
              className="w-full"
            />
          </div>
          <div className={classNames('p-3', GRADIENT)}>
            <h3 className="mb-3 text-xl">Tradestarter</h3>
            <p className="text-base text-vega-clight-100 dark:text-vega-cdark-100">
              Stake a minimum of 100 $VEGA tokens
            </p>
            <Tag color="green">Reward multiplier 1x</Tag>
          </div>
        </div>

        <div
          className={classNames(
            'overflow-hidden',
            'border rounded-md w-full',
            BORDER_COLOR
          )}
        >
          <div aria-hidden>
            {/* eslint-disable-next-line  @next/next/no-img-element */}
            <img
              src="/2x.png"
              alt="2x multiplier"
              width={768}
              height={400}
              className="w-full"
            />
          </div>
          <div className={classNames('p-3', GRADIENT)}>
            <h3 className="mb-3 text-xl">Mid level degen</h3>
            <p className="text-base text-vega-clight-100 dark:text-vega-cdark-100">
              Stake a minimum of 1000 $VEGA tokens
            </p>
            <Tag color="blue">Reward multiplier 2x</Tag>
          </div>
        </div>
        <div
          className={classNames(
            'overflow-hidden',
            'border rounded-md w-full',
            BORDER_COLOR
          )}
        >
          <div aria-hidden>
            {/* eslint-disable-next-line  @next/next/no-img-element */}
            <img
              src="/3x.png"
              alt="3x multiplier"
              width={768}
              height={400}
              className="w-full"
            />
          </div>
          <div className={classNames('p-3', GRADIENT)}>
            <h3 className="mb-3 text-xl">Reward hoarder</h3>
            <p className="text-base text-vega-clight-100 dark:text-vega-cdark-100">
              Stake a minimum of 10,000 $VEGA tokens
            </p>
            <Tag color="pink">Reward multiplier 3x</Tag>
          </div>
        </div>
      </div>

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
