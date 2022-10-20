import { t } from '@vegaprotocol/react-helpers';

import { Intro } from './intro';
import { MarketList } from './market-list';

export function Dashboard() {
  return (
    <div className="px-16 py-20">
      <h1 className="font-alpha uppercase text-5xl mb-8">
        {t('Top liquidity opportunities')}
      </h1>

      <Intro />
      <MarketList />
    </div>
  );
}
