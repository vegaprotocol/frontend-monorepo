import { gql } from 'graphql-request';
import { requestGQL } from './request';

export async function getVegaAsset() {
  const query = gql`
    {
      assetsConnection {
        edges {
          node {
            id
            symbol
            source {
              ... on ERC20 {
                contractAddress
              }
            }
          }
        }
      }
    }
  `;

  const res = await requestGQL<{
    assetsConnection: {
      edges: Array<{
        node: {
          id: string;
          symbol: string;
          source: {
            contractAddress: string;
          };
        };
      }>;
    };
  }>(query);
  return res.assetsConnection.edges
    .map((e) => e.node)
    .find((a) => a.symbol === 'VEGA');
}
