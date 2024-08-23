import {
  Button,
  Intent,
  Pill,
  Sparkline,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { HeaderPage } from 'apps/trading/components/header-page';
import { Links } from '../../lib/links';
import { useSuspenseAssets, useSuspenseMarkets } from '@vegaprotocol/rest';

export const Home = () => {
  useSuspenseAssets();
  const { data: markets } = useSuspenseMarkets();

  return (
    <>
      <header className="flex flex-col items-center gap-6 py-10">
        <HeaderPage>
          Explore the <span className="text-accent">Console</span>
        </HeaderPage>
        <p>Earn on the newest, most exciting markets on the Vega network.</p>
        <Button intent={Intent.Primary}>
          Get started <VegaIcon name={VegaIconNames.ARROW_RIGHT} />
        </Button>
      </header>
      <section className="py-10">
        <ul className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {new Array(3).fill(null).map((_, i) => {
            return (
              <li
                key={i}
                className="bg-white/50 dark:bg-black/40 flex flex-col items-start gap-4 p-8 rounded-lg"
              >
                <Pill intent={Intent.Primary}>Liquidity</Pill>
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
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {new Array(4).fill(null).map((_, i) => {
            return (
              <li key={i} className="flex flex-col gap-2 items-center">
                <VegaIcon name={VegaIconNames.GLOBE} size={20} />
                <p className="text-center flex flex-col text-surface-">
                  <span className="uppercase">Total markets</span>
                  <span className="text-4xl">23.5k</span>
                </p>
              </li>
            );
          })}
        </ul>
      </section>
      <section className="py-10">
        <ul className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from(markets.values()).map((market) => {
            return (
              <li
                key={market.id}
                className="bg-white/50 dark:bg-black/40 flex flex-col items-start gap-4 p-8 rounded-lg"
              >
                <header className="flex justify-between gap-1">
                  <div className="flex gap-2 items-start">
                    <div className="rounded-full w-12 h-12 bg-surface-0-fg" />
                    <div>
                      <h4 className="text-2xl">{market.code}</h4>
                      <p className="text-sm text-surface-0-fg-muted">
                        {market.name}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl">$72,123</p>
                    <p className="flex items-center gap-1">
                      <VegaIcon name={VegaIconNames.CHEVRON_UP} /> 16.2%
                    </p>
                  </div>
                </header>
                <div>
                  <Sparkline data={[]} />
                </div>
                <dl className="flex justify-between gap-2 w-full">
                  <div className="text-left">
                    <dt className="text-surface-0-fg-muted text-sm">
                      24h Volume
                    </dt>
                    <dd>$40,123</dd>
                  </div>
                  <div className="text-right">
                    <dt className="text-surface-0-fg-muted text-sm">
                      Open interest
                    </dt>
                    <dd>$5,682</dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
};
