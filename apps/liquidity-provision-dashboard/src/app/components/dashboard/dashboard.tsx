import { t } from '@vegaprotocol/react-helpers';

import { Intro } from './intro';
import { MarketList } from './market-list';

export function Dashboard() {
  return (
    <>
      <div className="flex items-stretch px-6 py-6">
        <h1 className="text-3xl">{t('Top liquidity opportunities')}</h1>
      </div>
      <Intro />
      <MarketList />
    </>
  );
}
