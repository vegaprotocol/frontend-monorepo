import { gql } from '@apollo/client';
import type { Node } from '@vegaprotocol/types';
import { print } from 'graphql';
import { edgesToList } from '../utils';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      getNodes(): Chainable<Array<Partial<Node>>>;
    }
  }
}

export function addGetNodes() {
  // @ts-ignore - ignoring Cypress type error which gets resolved when Cypress uses the command
  Cypress.Commands.add('getNodes', () => {
    const query = gql`
      query Nodes {
        nodesConnection {
          edges {
            node {
              __typename
              avatarUrl
              ethereumAddress
              id
              infoUrl
              location
              name
              pendingStake
              pubkey
              stakedByDelegates
              stakedByOperator
              stakedTotal
              status
              tmPubkey
            }
          }
        }
      }
    `;

    cy.request({
      method: 'POST',
      url: `http://localhost:3008/graphql`,
      body: {
        query: print(query),
      },
      headers: { 'content-type': 'application/json' },
    })
      .its(`body.data.nodesConnection.edges`)
      .then(edgesToList);
  });
}
