import { useQuery, gql } from '@apollo/client';

//import { MarketTradingMode } from '@vegaprotocol/types';
//import { calcCandleVolume } from '@vegaprotocol/market-info';

import '../styles.scss';
import Header from './components/header';
import Intro from './components/intro';
import MarketList from './components/market-list';

const TWENTY_FOUR_H_AGO = Date.now() - 86400 * 1000;
console.log('TWENTY_FOUR_H_AGO: ', TWENTY_FOUR_H_AGO);
// "1663236997"
const GET_MARKETS = gql`
  query GetMarkets {
    marketsConnection {
      edges {
        node {
          id,
          tradingMode,
          
          tradableInstrument {
            instrument {
              name,
              product {
                ... on Future {
                  settlementAsset {
                    name,
                    id
                  }
                }
              }
            }
          },
          
          liquidityProvisionsConnection {
            edges {
              node {
                id
              }
            }
          },
          
          tradesConnection(dateRange: { start: "${TWENTY_FOUR_H_AGO}" }) {
            edges {
              node {
                id,
                price
              }
            }
          } 
        }
      }
    }
  }
`;

interface MarketQuery {
  marketsConnection: {
    edges: {
      node: {
        id: string;
        tradingMode: string;
        tradableInstrument: {
          instrument: {
            name: string;
            product: {
              settlementAsset: {
                name: string;
              };
            };
          };
        };
      };
    }[];
  };
}

const formatData = (data: MarketQuery) => {
  // console.log('calcCandleVolume: ', calcCandleVolume());
  return data.marketsConnection.edges.map((n) => {
    return {
      id: n.node.id,
      name: n.node.tradableInstrument.instrument.name,
      settlementAsset:
        n.node.tradableInstrument.instrument.product.settlementAsset.name,
      status: n.node.tradingMode,
      volume: 'calc this',
      liquidity: '250,000',
      health: 'health',
      apy: '7-11%',
    };
  });
};

export function App() {
  // console.log('MarketTradingMode: ', MarketTradingMode);
  const { loading, error, data } = useQuery(GET_MARKETS);

  console.log('data: ', data);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :( </p>;
  const TYPES = formatData(data);
  console.log('TYPES: ', TYPES);

  return (
    <div className="max-h-full min-h-full bg-white flex flex-col">
      <Header />
      <Intro />
      <MarketList data={TYPES} />
    </div>
  );
}

export default App;
