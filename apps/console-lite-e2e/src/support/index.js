import '@vegaprotocol/cypress';
import 'cypress-real-events/support';
import registerCypressGrep from '@cypress/grep';
import { addMockConsole } from './console-mock';

registerCypressGrep();
addMockConsole();
