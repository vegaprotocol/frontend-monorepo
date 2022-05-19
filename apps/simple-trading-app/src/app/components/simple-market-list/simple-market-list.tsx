import React, { useCallback, useMemo } from 'react';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { t } from '@vegaprotocol/react-helpers';
import { AsyncRenderer, Lozenge, Splash } from '@vegaprotocol/ui-toolkit';
import { Button } from '@vegaprotocol/ui-toolkit';
import { format } from 'date-fns';
import SimpleMarketPercentChange from './simple-market-percent-change';
import DataProvider from './data-provider';
import { DATE_FORMAT } from '../../constants';
import { MARKET_STATUS } from './constants';

const SimpleMarketList = () => {
  const variables = useMemo(
    () => ({
      CandleInterval: 'I1H',
      CandleSince: new Date(Date.now() - 24 * 60 * 60 * 1000).toJSON(),
    }),
    []
  );
  const { data, error, loading } = useDataProvider(
    DataProvider,
    undefined, // @TODO - if we need a live update in the future
    variables
  );
  const onClick = useCallback((marketId) => {
    // @TODO - let's try to have navigation first
    console.log('trigger market', marketId);
  }, []);
  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      {data && data.length > 0 ? (
        <ul className="list-none relative pt-8 pb-8">
          {data?.map((market) => (
            <li
              className="w-full relative flex justify-start items-center no-underline box-border text-left pt-8 pb-8 pl-16 pr-16 mb-10"
              key={market.id}
            >
              <div className="w-full grid sm:grid-cols-2">
                <div className="w-full grid sm:grid-rows-3">
                  <div className="font-extrabold">{market.name}</div>
                  <div>
                    {market.data?.auctionEnd
                      ? `${t('expires')} ${format(
                          new Date(market.data.auctionEnd),
                          DATE_FORMAT
                        )}`
                      : '-'}
                  </div>
                  <div>{`${t('settled in')} ${
                    market.tradableInstrument.instrument.product.settlementAsset
                      .symbol
                  }`}</div>
                </div>
                <div className="w-full grid sm:grid-rows-2">
                  <div>
                    <SimpleMarketPercentChange candles={market.candles} />
                  </div>
                  <div>
                    <Lozenge
                      variant={MARKET_STATUS[market.data?.market.state || '']}
                    >
                      {market.data?.market.state}
                    </Lozenge>
                  </div>
                </div>
              </div>
              <div className="absolute right-16 top-1/2 -translate-y-1/2">
                <Button
                  onClick={() => onClick(market.id)}
                  variant="inline"
                  prependIconName="chevron-right"
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <Splash>{t('No data to display')}</Splash>
      )}
    </AsyncRenderer>
  );
};

export default SimpleMarketList;
