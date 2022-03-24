import { gql, useQuery } from '@apollo/client';
import React from 'react';
import { RouteTitle } from '../../components/route-title';
import { SubHeading } from '../../components/sub-heading';
import { SyntaxHighlighter } from '../../components/syntax-highlighter';
import { AssetsQuery } from '@vegaprotocol/graphql';

export const ASSETS_QUERY = gql`
  query AssetsQuery {
    assets {
      id
      name
      symbol
      totalSupply
      decimals
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
      <RouteTitle data-testid="assets-header">Assets</RouteTitle>
      {data?.assets.map((a) => (
        <React.Fragment key={a.id}>
          <SubHeading data-testid="asset-header">
            {a.name} ({a.symbol})
          </SubHeading>
          <SyntaxHighlighter data={a} />
        </React.Fragment>
      ))}
    </section>
  );
};

export default Assets;
