import { addGetTestIdcommand } from './lib/commands/get-by-test-id';
import { addMockGQLCommand } from './lib/commands/mock-gql';
import { addMockVegaWalletCommands } from './lib/commands/mock-vega-wallet';
import { addMockWeb3ProviderCommand } from './lib/commands/mock-web3-provider';
import { addSlackCommand } from './lib/commands/slack';
import { addHighlightLog } from './lib/commands/highlight-log';

addGetTestIdcommand();
addSlackCommand();
addMockGQLCommand();
addMockVegaWalletCommands();
addMockWeb3ProviderCommand();
addHighlightLog();

export * from './lib/graphql-test-utils';

Cypress.on(
  'uncaught:exception',
  (err) => !err.message.includes('ResizeObserver loop limit exceeded')
);
