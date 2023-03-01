import '@vegaprotocol/cypress';
import 'cypress-real-events/support';

import './common.functions.ts';
import './staking.functions.ts';
import './governance.functions.ts';
import './wallet-eth.functions.ts';
import './wallet-teardown.functions.ts';
import './wallet-vega.functions.ts';
import './proposal.functions.ts';
import registerCypressGrep from '@cypress/grep';
import { aliasGQLQuery } from '@vegaprotocol/cypress';
import { chainIdQuery, statisticsQuery } from '@vegaprotocol/mock';
registerCypressGrep();

// Hide fetch/XHR requests - They create a lot of noise in command log
const app = window.top;
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML =
    '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

before(() => {
  // Mock chainId fetch which happens on every page for wallet connection
  cy.mockGQL((req) => {
    aliasGQLQuery(req, 'ChainId', chainIdQuery());
    aliasGQLQuery(req, 'Statistics', statisticsQuery());
  });
});
