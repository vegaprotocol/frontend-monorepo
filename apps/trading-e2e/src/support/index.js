import '@vegaprotocol/cypress';
import 'cypress-real-events/support';
import registerCypressGrep from 'cypress-grep';
import { aliasQuery } from '@vegaprotocol/cypress';
import { generateChainId } from './mocks/generate-chain-id';
registerCypressGrep();

before(() => {
  // Mock chainId fetch which happens on every page for wallet connection
  cy.mockGQL((req) => {
    aliasQuery(req, 'ChainId', generateChainId());
  });
});
