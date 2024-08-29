import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import {
  Button,
  Intent,
  Pill,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { vegaAccountType } from '@vegaprotocol/rest-clients/dist/trading-data';
import { useSuspenseAccounts, useSuspenseMarkets } from '@vegaprotocol/rest';

import { Links } from '../../lib/links';
import { useT } from '../../lib/use-t';

import { MarketCard } from '../../components/market-card';
import { HeaderPage } from '../../components/header-page';

export const Home = () => {
  const t = useT();
  const { data: markets } = useSuspenseMarkets();

  return (
    <>
      <header className="flex flex-col items-center gap-6 py-10 text-center">
        <HeaderPage>
          Explore the <span className="text-accent calt">Console</span>
        </HeaderPage>
        <p>Earn on the newest, most exciting markets on the Vega network.</p>
        <Button intent={Intent.Primary} size="lg">
          Get started <VegaIcon name={VegaIconNames.ARROW_RIGHT} />
        </Button>
      </header>

      <section className="py-10">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
          <li>
            <ActiveUsersStat />
          </li>
          {new Array(3).fill(null).map((_, i) => {
            return (
              <li key={i}>
                <Stat label="foo" value="bar" />
              </li>
            );
          })}
        </ul>
      </section>

      <section className="py-10">
        <ul className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {new Array(3).fill(null).map((reward, i) => {
            return (
              <li
                key={i}
                className="bg-black/5 dark:bg-black/40 grid grid-rows-[subgrid] row-span-4 gap-4 p-8 rounded-lg"
              >
                <div>
                  <Pill intent={Intent.Primary}>Liquidity</Pill>
                </div>
                <h4 className="text-2xl">Share of all fees</h4>
                <p>
                  Commit liquidity to an AMM and receive a share of all fees
                  paid on that market
                </p>
                <p>
                  <Link
                    to={Links.COMPETITIONS_GAME('TODO: game-id')}
                    className="underline underline-offset-4 flex items-center gap-1"
                  >
                    {t('View game')}
                    <VegaIcon name={VegaIconNames.ARROW_RIGHT} />
                  </Link>
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="flex flex-col items-center gap-6 py-10">
        <h3 className="text-4xl">Explore the Console</h3>
        <p>Find new and exciting games to earn rewards whilst trading.</p>
        <Button intent={Intent.Primary}>
          Sign up <VegaIcon name={VegaIconNames.ARROW_RIGHT} />
        </Button>
      </section>

      <section className="py-10">
        <ul className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from(markets.values()).map((market) => {
            return (
              <li key={market.id}>
                <MarketCard marketId={market.id} />
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
};

const Stat = (props: { label: ReactNode; value: ReactNode }) => {
  return (
    <div className="flex flex-col gap-4 items-center">
      <VegaIcon name={VegaIconNames.GLOBE} size={32} />
      <p className="text-center flex flex-col">
        <span className="text-sm uppercase text-surface-1-fg-muted">
          {props.label}
        </span>
        <span className="text-5xl">{props.value}</span>
      </p>
    </div>
  );
};

const ActiveUsersStat = () => {
  const { data } = useSuspenseAccounts({
    'filter.accountTypes': vegaAccountType.ACCOUNT_TYPE_GENERAL,
  });

  return <Stat label="Active users" value={data.length} />;
};
