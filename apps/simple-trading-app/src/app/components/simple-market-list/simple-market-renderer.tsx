import React from 'react';
import type { SimpleMarkets_markets } from './__generated__/SimpleMarkets';
import SimpleMarketExpires from './simple-market-expires';

interface Props {
  data: SimpleMarkets_markets;
}

const MarketNameRenderer = ({ data }: Props) => {
  return (
    <div className="flex h-full items-center grid grid-rows-2 grid-flow-col gap-x-8 gap-y-0 grid-cols-[min-content,1fr,1fr]">
      <div className="w-60 row-span-2 bg-pink rounded-full w-44 h-44 bg-gradient-to-br from-white-60 to--white-80 opacity-30" />
      <div className="col-span-2 uppercase justify-start text-black dark:text-white text-market self-end">
        {data.name}{' '}
        <SimpleMarketExpires
          tags={data.tradableInstrument.instrument.metadata.tags}
        />
      </div>
      <div className="col-span-2 ui-small text-deemphasise dark:text-midGrey self-start leading-3">
        {data.tradableInstrument.instrument.product.quoteName}
      </div>
    </div>
  );
};

export default MarketNameRenderer;
