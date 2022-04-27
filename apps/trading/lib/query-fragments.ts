import { gql } from '@apollo/client';

export const ASSET_FRAGMENT = gql`
  fragment AssetFields on Asset {
    id
    symbol
    name
    decimals
    source {
      ... on ERC20 {
        contractAddress
      }
    }
  }
`;
