import '@vegaprotocol/cypress';
import 'cypress-real-events/support';
import registerCypressGrep from '@cypress/grep';
import { addMockTradingPage } from './trading';
import { registerCapsuleCommands } from './capsule';

registerCypressGrep();
addMockTradingPage();
registerCapsuleCommands();
