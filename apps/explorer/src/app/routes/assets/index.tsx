import { gql, useQuery } from '@apollo/client';
import { t } from '@vegaprotocol/react-helpers';
import React from 'react';
import { RouteTitle } from '../../components/route-title';
import { SubHeading } from '../../components/sub-heading';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import type {
  AssetsQuery,
  AssetsQuery_assetsConnection_edges,
} from './__generated__/AssetsQuery';

export const ASSETS_QUERY = gql`
  query AssetsQuery {
    assetsConnection {
      edges {
        node {
          id
          name
          symbol
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
    }
  }
`;

const Assets = () => {
  const { data } = useQuery<AssetsQuery>(ASSETS_QUERY);

  const assets =
    (data?.assetsConnection?.edges?.filter(
      (e) => e != null && e.node != null
    ) as AssetsQuery_assetsConnection_edges[]) || [];
  if (assets.length === 0) return null;

  return (
    <section>
      <RouteTitle data-testid="assets-header">{t('Assets')}</RouteTitle>
      {assets.map((a) => (
        <React.Fragment key={a.node.id}>
          <SubHeading data-testid="asset-header">
            {a?.node.name} ({a.node.symbol})
          </SubHeading>
          <SyntaxHighlighter data={a.node} />
        </React.Fragment>
      ))}
    </section>
  );
};

export default Assets;
