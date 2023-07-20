import { Popover, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { MarketSelector } from '../market-selector';
import { useMarket } from '@vegaprotocol/markets';
import { t } from '@vegaprotocol/i18n';
import { useParams } from 'react-router-dom';

/**
 * This is only rendered for the mobile navigation
 */
export const NavHeader = () => {
  const { marketId } = useParams();
  const { data } = useMarket(marketId);

  if (!marketId) return null;

  return (
    <Popover
      trigger={
        <h1 className="flex gap-4 items-center text-default text-lg whitespace-nowrap xl:pr-4 xl:border-r border-default">
          {data ? data.tradableInstrument.instrument.code : t('Select market')}
          <VegaIcon name={VegaIconNames.CHEVRON_DOWN} size={20} />
        </h1>
      }
    >
      <MarketSelector currentMarketId={marketId} />
    </Popover>
  );
};
