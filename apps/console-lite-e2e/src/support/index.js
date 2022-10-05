// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import '@vegaprotocol/cypress';
import 'cypress-real-events/support';
// Import commands.js using ES2015 syntax:
import './commands';
import registerCypressGrep from 'cypress-grep';
import { aliasQuery } from '@vegaprotocol/cypress';
registerCypressGrep();

before(() => {
  // Mock chainId fetch which happens on every page for wallet connection
  cy.mockGQL((req) => {
    aliasQuery(req, 'ChainId', {
      statistics: {
        __typename: 'Statistics',
        chainId: 'vega-fairground-202210041151',
      },
    });
  });
});
