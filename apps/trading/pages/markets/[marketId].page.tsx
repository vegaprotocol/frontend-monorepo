import { gql } from '@apollo/client';
import { SelectMarketDialog } from '@vegaprotocol/market-list';
import { t } from '@vegaprotocol/react-helpers';
import { Interval } from '@vegaprotocol/types';
import { Splash } from '@vegaprotocol/ui-toolkit';
import debounce from 'lodash/debounce';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { PageQueryContainer } from '../../components/page-query-container';
import { useGlobalStore } from '../../stores';
import { TradeGrid, TradePanels } from './trade-grid';
import type { Market, MarketVariables } from './__generated__/Market';

// Top level page query
const MARKET_QUERY = gql`
  query Market($marketId: ID!, $interval: Interval!, $since: String!) {
    market(id: $marketId) {
      id
      name
      tradingMode
      state
      decimalPlaces
      positionDecimalPlaces
      data {
        market {
          id
        }
        auctionStart
        auctionEnd
        markPrice
        indicativeVolume
        indicativePrice
        suppliedStake
        targetStake
        bestBidVolume
        bestOfferVolume
        bestStaticBidVolume
        bestStaticOfferVolume
        trigger
      }
      tradableInstrument {
        instrument {
          id
          name
          code
          metadata {
            tags
          }
          product {
            ... on Future {
              oracleSpecForTradingTermination {
                id
              }
              quoteName
              settlementAsset {
                id
                symbol
                name
              }
            }
          }
        }
      }
      marketTimestamps {
        open
        close
      }
      candles(interval: $interval, since: $since) {
        open
        close
        volume
      }
    }
  }
`;

const MarketPage = ({ id }: { id?: string }) => {
  const { query } = useRouter();
  const { w } = useWindowSize();
  const { landingDialog, riskNoticeDialog, update } = useGlobalStore(
    (store) => ({
      landingDialog: store.landingDialog,
      riskNoticeDialog: store.riskNoticeDialog,
      update: store.update,
    })
  );
  const { update: updateStore } = useGlobalStore((store) => ({
    update: store.update,
  }));

  // Default to first marketId query item if found
  const marketId =
    id || (Array.isArray(query.marketId) ? query.marketId[0] : query.marketId);

  const onSelect = (id: string) => {
    if (id && id !== marketId) {
      updateStore({ marketId: id });
    }
  };

  // Cache timestamp for yesterday to prevent full unmount of market page when
  // a rerender occurs
  const yTimestamp = useMemo(() => {
    const yesterday = Math.round(new Date().getTime() / 1000) - 24 * 3600;
    return new Date(yesterday * 1000).toISOString();
  }, []);

  const variables = useMemo(
    () => ({
      marketId: marketId || '',
      interval: Interval.INTERVAL_I1H,
      since: yTimestamp,
    }),
    [marketId, yTimestamp]
  );

  if (!marketId) {
    return (
      <Splash>
        <p>{t('Not found')}</p>
      </Splash>
    );
  }

  return (
    <PageQueryContainer<Market, MarketVariables>
      query={MARKET_QUERY}
      data-testid="market"
      options={{
        variables,
        fetchPolicy: 'network-only',
      }}
      render={({ market }) => {
        if (!market) {
          return <Splash>{t('Market not found')}</Splash>;
        }

        return (
          <>
            {w > 960 ? (
              <TradeGrid market={market} onSelect={onSelect} />
            ) : (
              <TradePanels market={market} onSelect={onSelect} />
            )}
            <SelectMarketDialog
              dialogOpen={landingDialog && !riskNoticeDialog}
              setDialogOpen={(isOpen: boolean) =>
                update({ landingDialog: isOpen })
              }
              onSelect={onSelect}
            />
          </>
        );
      }}
    />
  );
};

MarketPage.getInitialProps = () => ({
  page: 'market',
});

export default MarketPage;

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState(() => {
    if (typeof window !== 'undefined') {
      return {
        w: window.innerWidth,
        h: window.innerHeight,
      };
    }

    // Something sensible for server rendered page
    return {
      w: 1200,
      h: 900,
    };
  });

  useEffect(() => {
    const handleResize = debounce(({ target }) => {
      setWindowSize({
        w: target.innerWidth,
        h: target.innerHeight,
      });
    }, 300);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowSize;
};
