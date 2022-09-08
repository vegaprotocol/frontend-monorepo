import { gql } from '@apollo/client';

export const ASSET_FRAGMENT = gql`
  fragment AssetFields on Asset {
    id
    symbol
    name
    decimals
    status
    source {
      ... on ERC20 {
        contractAddress
      }
    }
  }
`;
