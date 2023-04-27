import { gql } from '@apollo/client';
import { print } from 'graphql';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import { edgesToList } from '../utils';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      getAssets(): Chainable<Array<AssetFieldsFragment>>;
    }
  }
}

export function addGetAssets() {
  // @ts-ignore - ignoring Cypress type error which gets resolved when Cypress uses the command
  Cypress.Commands.add('getAssets', () => {
    // TODO: Investigate why importing here an actual AssetsDocument fails and
    // causes cypress's webpack to go bonkers
    const query = gql`
      query Assets {
        assetsConnection {
          edges {
            node {
              id
              name
              symbol
              decimals
              quantum
              source {
                __typename
                ... on ERC20 {
                  contractAddress
                  lifetimeLimit
                  withdrawThreshold
                }
                ... on BuiltinAsset {
                  maxFaucetAmountMint
                }
              }
              status
              infrastructureFeeAccount {
                balance
              }
              globalRewardPoolAccount {
                balance
              }
              takerFeeRewardAccount {
                balance
              }
              makerFeeRewardAccount {
                balance
              }
              lpFeeRewardAccount {
                balance
              }
              marketProposerRewardAccount {
                balance
              }
            }
          }
        }
      }
    `;

    cy.request({
      method: 'POST',
      url: 'http://localhost:3008/graphql',
      body: {
        query: print(query),
      },
      headers: { 'content-type': 'application/json' },
    })
      .its('body.data.assetsConnection.edges')
      .then(edgesToList);
  });
}
