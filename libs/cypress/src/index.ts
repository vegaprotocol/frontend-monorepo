import { addGetTestIdcommand } from './lib/commands/get-by-test-id';
import { addMockGQLCommand } from './lib/commands/mock-gql';
import { addMockVegaWalletCommands } from './lib/commands/mock-vega-wallet';
import { addSlackCommand } from './lib/commands/slack';
import { addMatchImageSnapshotCommand } from '@pkerschbaum/cypress-image-snapshot/lib/command';

addGetTestIdcommand();
addSlackCommand();
addMockGQLCommand();
addMockVegaWalletCommands();
addMatchImageSnapshotCommand(Option);
