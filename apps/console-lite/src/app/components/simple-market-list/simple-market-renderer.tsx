import classNames from 'classnames';
import type { Market } from '@vegaprotocol/market-list';
import { SimpleMarketExpires } from '@vegaprotocol/market-info';

interface Props {
  market: Market;
  isMobile?: boolean;
}

const MarketNameRenderer = ({ market, isMobile }: Props) => {
  return (
    <div className="flex h-full items-center grid grid-rows-2 grid-flow-col gap-x-2 md:gap-x-4 gap-y-0 grid-cols-[min-content,1fr,1fr] md:pl-4">
      <div
        className={classNames(
          'row-span-2 bg-pink rounded-full bg-gradient-to-br from-white/40 to-white/80 opacity-30 w-6 h-6 md:w-10 md:h-10'
        )}
      />
      <div className="col-span-2 uppercase justify-start text-black dark:text-white text-ui-small md:text-market self-end">
        {isMobile
          ? market.tradableInstrument.instrument.code
          : market.tradableInstrument.instrument.name}{' '}
        <SimpleMarketExpires
          tags={market.tradableInstrument.instrument.metadata.tags}
        />
      </div>
      <div className="col-span-2 text-ui-tiny md:text-ui-small text-deemphasise dark:text-midGrey self-start leading-3">
        {market.tradableInstrument.instrument.product.quoteName}
      </div>
    </div>
  );
};

export default MarketNameRenderer;
