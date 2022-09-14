import { gql, useQuery } from '@apollo/client';
import { t } from '@vegaprotocol/react-helpers';
import React from 'react';
import { RouteTitle } from '../../components/route-title';
import { SubHeading } from '../../components/sub-heading';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import type {
  AssetsQuery,
  AssetsQuery_assetsConnection_edges_node,
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

  const assets = (data?.assetsConnection.edges || [])
    .filter((e) => !!e?.node)
    .map((e) => e?.node) as AssetsQuery_assetsConnection_edges_node[];

  return (
    <section>
      <RouteTitle data-testid="assets-header">{t('Assets')}</RouteTitle>
      {assets.map((a) => (
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
