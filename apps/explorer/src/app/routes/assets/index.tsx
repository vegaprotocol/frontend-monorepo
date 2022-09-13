import compact from 'lodash/compact';
import { gql, useQuery } from '@apollo/client';
import { t } from '@vegaprotocol/react-helpers';
import React from 'react';
import { RouteTitle } from '../../components/route-title';
import { SubHeading } from '../../components/sub-heading';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import type { AssetsQuery } from './__generated__/AssetsQuery';

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

  const assets = compact(data?.assetsConnection?.edges).map((e) => e.node);

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
