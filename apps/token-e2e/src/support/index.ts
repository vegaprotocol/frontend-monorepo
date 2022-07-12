import '@vegaprotocol/cypress';

import './common.functions.js';
import './staking.functions.js';
import './wallet-eth.functions.js';
import './wallet-teardown.functions.js';
import './wallet-vega.functions.js';

// Hide fetch/XHR requests - They create a lot of noise in command log
const app = window.top;
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML =
    '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}
