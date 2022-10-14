import { useCallback, useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { formatNumber, t } from '@vegaprotocol/react-helpers';
import { Icon, AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { Market } from '@vegaprotocol/liquidity';
import {
  useMarketsLiquidity,
  useLiquidityProvision,
} from '@vegaprotocol/liquidity';
import {
  MarketTradingModeMapping,
  MarketTradingMode,
  AuctionTrigger,
  AuctionTriggerMapping,
} from '@vegaprotocol/types';

export const Detail = () => {
  const [details, setDetails] = useState({});
  const { marketId } = useParams<{ marketId: string }>();

  console.log('marketId: ', marketId);
  const {
    data: lpData,
    error,
    loading: lpLoading,
  } = useLiquidityProvision({ marketId });

  const localData = lpData;
  console.log('localData: ', localData);
  //   useEffect(() => {
  //     setDetails({ liquidityData: lpData });
  //   }, [lpData]);

  return (
    <AsyncRenderer loading={lpLoading} error={error} data={lpData}>
      <div className="px-16">
        <Link to="/">{t('Liquidity opportunities')} </Link>
        <h1 className="font-alpha text-5xl mb-8">{lpData.name}</h1>
        <p className="font-alpha text-4xl mb-12">{lpData.symbol}</p>
        Detail page
      </div>
    </AsyncRenderer>
  );
};
