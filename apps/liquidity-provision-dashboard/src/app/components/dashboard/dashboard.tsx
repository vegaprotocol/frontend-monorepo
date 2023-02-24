import { t } from '@vegaprotocol/utils';

import { Intro } from './intro';
import { MarketList } from './market-list';

export function Dashboard() {
  return (
    <>
      <div className="px-16 pt-20 pb-12 bg-greys-light-100">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="font-alpha calt uppercase text-5xl mb-8">
            {t('Top liquidity opportunities')}
          </h1>

          <Intro />
        </div>
      </div>
      <div className="px-16 py-6">
        <div className="max-w-screen-xl mx-auto">
          <MarketList />
        </div>
      </div>
    </>
  );
}
