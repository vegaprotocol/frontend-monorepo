import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { subDays } from 'date-fns';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { t } from '@vegaprotocol/react-helpers';
import { AsyncRenderer, Lozenge, Splash } from '@vegaprotocol/ui-toolkit';
import { Button } from '@vegaprotocol/ui-toolkit';
import type { MarketState } from '@vegaprotocol/types';
import SimpleMarketPercentChange from './simple-market-percent-change';
import SimpleMarketExpires from './simple-market-expires';
import DataProvider from './data-provider';
import { MARKET_STATUS } from './constants';

const SimpleMarketList = () => {
  const navigate = useNavigate();
  const statusesRef = useRef<Record<string, MarketState | ''>>({});
  const variables = useMemo(
    () => ({
      CandleSince: subDays(Date.now(), 1).toJSON(),
    }),
    []
  );
  const update = useCallback((delta) => {
    if (statusesRef.current[delta.market.id] !== delta.market.state) {
      return false;
    }
    return true;
  }, [statusesRef]);

  const { data, error, loading } = useDataProvider(
    DataProvider,
    update,
    variables
  );
  useEffect(() => {
    const statuses: Record<string, MarketState | ''> = {};
    data?.forEach((market) => {
      statuses[market.id] = market.data?.market.state || '';
    });
    statusesRef.current = statuses;
  }, [data]);

  const onClick = useCallback(
    (marketId) => {
      navigate(`/trading/${marketId}`);
    },
    [navigate]
  );

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
                <div className="w-full grid sm:auto-rows-auto">
                  <div className="font-extrabold py-2">{market.name}</div>
                  <SimpleMarketExpires
                    tags={market.tradableInstrument.instrument.metadata.tags}
                  />
                  <div className="py-2">{`${t('settled in')} ${
                    market.tradableInstrument.instrument.product.settlementAsset
                      .symbol
                  }`}</div>
                </div>
                <div className="w-full grid sm:grid-rows-2">
                  <div>
                    <SimpleMarketPercentChange
                      candles={market.candles}
                      marketId={market.id}
                    />
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
