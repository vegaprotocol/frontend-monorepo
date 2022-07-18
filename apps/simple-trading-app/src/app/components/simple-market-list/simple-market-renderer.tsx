import React from 'react';
import classNames from 'classnames';
import type { MarketNames_markets } from '@vegaprotocol/deal-ticket';
import SimpleMarketExpires from './simple-market-expires';

interface Props {
  market: MarketNames_markets;
  isMobile?: boolean;
}

const MarketNameRenderer = ({ market, isMobile }: Props) => {
  return (
    <div className="flex h-full items-center grid grid-rows-2 grid-flow-col gap-x-4 md:gap-x-8 gap-y-0 grid-cols-[min-content,1fr,1fr] md:pl-8">
      <div
        className={classNames(
          'row-span-2 bg-pink rounded-full bg-gradient-to-br from-white-60 to--white-80 opacity-30 w-20 h-20 md:w-44 md:h-44'
        )}
      />
      <div className="col-span-2 uppercase justify-start text-black dark:text-white text-ui-small md:text-market self-end">
        {isMobile ? market.tradableInstrument.instrument.code : market.name}{' '}
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
