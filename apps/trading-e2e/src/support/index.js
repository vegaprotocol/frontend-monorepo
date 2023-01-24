import '@vegaprotocol/cypress';
import 'cypress-real-events/support';
import registerCypressGrep from '@cypress/grep';
import { addMockTradingPage } from './trading';

registerCypressGrep();
addMockTradingPage();
