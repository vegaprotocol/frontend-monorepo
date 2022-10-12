import { MarketState } from '@vegaprotocol/types';
import { mockTradingPage } from '../support/trading';
import { connectVegaWallet } from '../support/vega-wallet';
import { connectEthereumWallet } from '../support/ethereum-wallet';
import { generateNetworkParameters } from '../support/mocks/generate-network-parameters';
import { aliasQuery } from '@vegaprotocol/cypress';

beforeEach(() => {
  cy.mockGQL((req) => {
    mockTradingPage(req, MarketState.STATE_ACTIVE);
    aliasQuery(req, 'NetworkParamsQuery', generateNetworkParameters());
  });
  cy.mockWeb3Provider();
  cy.mockGQLSubscription();
  cy.visit('/markets/market-0');
});

describe('accounts', { tags: '@smoke' }, () => {
  it('renders accounts', () => {
    const tradingAccountRowId = '[row-id="asset-0"]';
    cy.getByTestId('Collateral').click();
    cy.getByTestId('tab-accounts').contains('Please connect Vega wallet');

    connectVegaWallet();
    connectEthereumWallet();

    cy.getByTestId('tab-accounts').should('be.visible');
    cy.getByTestId('tab-accounts')
      .get(tradingAccountRowId)
      .find('[col-id="asset.symbol"]')
      .should('have.text', 'AST0');

    cy.getByTestId('tab-accounts')
      .get(tradingAccountRowId)
      .find('[col-id="breakdown"]')
      .should('have.text', 'Breakdown');

    cy.getByTestId('tab-accounts')
      .get(tradingAccountRowId)
      .find('[col-id="deposited"]')
      .should('have.text', '1,000.00000');
  });
});
