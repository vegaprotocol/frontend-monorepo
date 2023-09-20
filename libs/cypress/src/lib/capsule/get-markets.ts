import { gql } from 'graphql-request';
import { requestGQL } from './request';

export async function getMarkets() {
  const query = gql`
    query {
      marketsConnection {
        edges {
          node {
            id
            decimalPlaces
            positionDecimalPlaces
            state
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
                    settlementAsset {
                      id
                      symbol
                      decimals
                    }
                    quoteName
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const res = await requestGQL<{
    marketsConnection: {
      edges: Array<{
        node: {
          id: string;
          decimalPlaces: number;
          positionDecimalPlaces: number;
          state: string;
          tradableInstrument: {
            instrument: {
              id: string;
              name: string;
              code: string;
              metadata: {
                tags: string[];
              };
              product: {
                settlementAsset: {
                  id: string;
                  symbol: string;
                  decimals: number;
                };
                quoteName: string;
              };
            };
          };
        };
      }>;
    };
  }>(query);

  return res.marketsConnection.edges.map((e) => e.node);
}
