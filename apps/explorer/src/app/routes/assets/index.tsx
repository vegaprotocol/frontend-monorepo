import { gql, useQuery } from '@apollo/client';
import React from 'react';
import { SyntaxHighlighter } from '../../components/syntax-highlighter';
import { AssetsQuery } from './__generated__/AssetsQuery';

export const ASSETS_QUERY = gql`
  query AssetsQuery {
    assets {
      id
      name
      symbol
      totalSupply
      decimals
      minLpStake
      source {
        ... on ERC20 {
          contractAddress
        }
        ... on BuiltinAsset {
          maxFaucetAmountMint
        }
      }
      infrastructureFeeAccount {
        type
        balance
        market {
          id
        }
      }
    }
  }
`;

const Assets = () => {
  const { data } = useQuery<AssetsQuery>(ASSETS_QUERY);
  if (!data || !data.assets) return null;
  return (
    <section>
      <h1>Assets</h1>
      {data?.assets.map((a) => (
        <React.Fragment key={a.id}>
          <h2 data-testid="asset-header">
            {a.name} ({a.symbol})
          </h2>
          <SyntaxHighlighter data={a} />
        </React.Fragment>
      ))}
    </section>
  );
};

export default Assets;
