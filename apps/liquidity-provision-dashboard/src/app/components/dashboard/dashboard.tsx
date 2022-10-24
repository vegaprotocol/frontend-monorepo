import { t } from '@vegaprotocol/react-helpers';

import { Intro } from './intro';
import { MarketList } from './market-list';

export function Dashboard() {
  return (
    <>
      <div className="px-16 pt-20 pb-12 bg-[#F0F0F0]">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="font-alpha uppercase text-5xl mb-8">
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
