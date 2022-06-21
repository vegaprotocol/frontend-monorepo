import { addGetTestIdcommand } from './lib/commands/get-by-test-id';
import { addMockGQLCommand } from './lib/commands/mock-gql';
import { addMockVegaWalletCommands } from './lib/commands/mock-vega-wallet';
import { addMockWeb3ProviderCommand } from './lib/commands/mock-web3-provider';
import { addSlackCommand } from './lib/commands/slack';

addGetTestIdcommand();
addSlackCommand();
addMockGQLCommand();
addMockVegaWalletCommands();
addMockWeb3ProviderCommand();

export * from './lib/graphql-test-utils';
