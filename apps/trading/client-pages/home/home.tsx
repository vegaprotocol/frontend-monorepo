import {
  Button,
  Intent,
  Pill,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { HeaderPage } from 'apps/trading/components/header-page';
import { Links } from '../../lib/links';
import { useSuspenseAssets, useSuspenseMarkets } from '@vegaprotocol/rest';
import { MarketCard } from 'apps/trading/components/market-card';

export const Home = () => {
  useSuspenseAssets();
  const { data: markets } = useSuspenseMarkets();

  return (
    <>
      <header className="flex flex-col items-center gap-6 py-10 text-center">
        <HeaderPage>
          Explore the <span className="text-accent">Console</span>
        </HeaderPage>
        <p>Earn on the newest, most exciting markets on the Vega network.</p>
        <Button intent={Intent.Primary} size="lg">
          Get started <VegaIcon name={VegaIconNames.ARROW_RIGHT} />
        </Button>
      </header>
      <section className="py-10">
        <ul className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {new Array(3).fill(null).map((_, i) => {
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
                  <a
                    href={Links.MARKETS()}
                    className="underline underline-offset-4 flex items-center gap-1"
                  >
                    Link to somewhere{' '}
                    <VegaIcon name={VegaIconNames.ARROW_RIGHT} />
                  </a>
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
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
          {new Array(4).fill(null).map((_, i) => {
            return (
              <li key={i}>
                <Stat />
              </li>
            );
          })}
        </ul>
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

const Stat = () => {
  return (
    <div className="flex flex-col gap-4 items-center">
      <VegaIcon name={VegaIconNames.GLOBE} size={32} />
      <p className="text-center flex flex-col">
        <span className="text-sm uppercase text-surface-1-fg-muted">
          Total markets
        </span>
        <span className="text-5xl">23.5k</span>
      </p>
    </div>
  );
};
