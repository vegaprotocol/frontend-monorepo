import { gql } from '@apollo/client';
import { Market, MarketVariables } from '@vegaprotocol/graphql';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import debounce from 'lodash.debounce';
import { PageQueryContainer } from '../../components/page-query-container';
import { TradeGrid, TradePanels } from './trade-grid';
import { Splash } from '../../components/splash';

// Top level page query
const MARKET_QUERY = gql`
  query Market($marketId: ID!) {
    market(id: $marketId) {
      id
      name
      decimalPlaces
      state
      tradingMode
      tradableInstrument {
        instrument {
          product {
            ... on Future {
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
      trades {
        id
        price
        size
        createdAt
      }
      depth {
        lastTrade {
          price
        }
      }
    }
  }
`;

const MarketPage = () => {
  const {
    query: { marketId },
  } = useRouter();
  const { w } = useWindowSize();

  console.log('id', marketId);
  return (
    <PageQueryContainer<Market, MarketVariables>
      query={MARKET_QUERY}
      options={{
        // Not sure exactly why marketId is string | string[] but just the first item in the array if
        // it is one
        variables: {
          marketId: Array.isArray(marketId) ? marketId[0] : marketId,
        },
        skip: !marketId,
        fetchPolicy: 'network-only',
      }}
    >
      {({ market }) => {
        if (!market) {
          return <Splash>Market not found</Splash>;
        }

        return w > 960 ? (
          <TradeGrid market={market} />
        ) : (
          <TradePanels market={market} />
        );
      }}
    </PageQueryContainer>
  );
};

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
