import '@vegaprotocol/cypress';
import 'cypress-real-events/support';

import './common.functions.ts';
import './staking.functions.ts';
import './governance.functions.ts';
import './wallet-eth.functions.ts';
import './wallet-functions.ts';
import './proposal.functions.ts';
import 'cypress-mochawesome-reporter/register';
import registerCypressGrep from '@cypress/grep';
import { turnTelemetryOff } from './common.functions.ts';
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
  cy.clearLocalStorage();
  // // Ensuring the telemetry modal doesn't disrupt the tests
  turnTelemetryOff();
  // Mock chainId fetch which happens on every page for wallet connection
  cy.mockChainId();
  // Self stake validators so they are displayed
  cy.validatorsSelfDelegate();
});
