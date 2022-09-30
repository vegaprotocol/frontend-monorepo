import { MarketState } from '@vegaprotocol/types';
import { mockTradingPage } from '../support/trading';
import { connectVegaWallet } from '../support/vega-wallet';

beforeEach(() => {
  cy.mockGQL((req) => {
    mockTradingPage(req, MarketState.STATE_ACTIVE);
  });
  cy.mockGQLSubscription();
  cy.visit('/markets/market-0');
});

describe('accounts', { tags: '@smoke' }, () => {
  it('renders accounts', () => {
    const tradingAccountRowId = '[row-id="asset-id"]';
    cy.getByTestId('Collateral').click();
    cy.getByTestId('tab-accounts').contains('Please connect Vega wallet');

    connectVegaWallet();

    cy.getByTestId('tab-accounts').should('be.visible');
    cy.getByTestId('tab-accounts')
      .should('be.visible')
      .get(tradingAccountRowId)
      .find('[col-id="asset.symbol"]')
      .should('have.text', 'tEURO');

    cy.getByTestId('tab-accounts')
      .should('be.visible')
      .get(tradingAccountRowId)
      .find('[col-id="breakdown"]')
      .should('have.text', 'Collateral breakdown');

    cy.getByTestId('tab-accounts')
      .should('be.visible')
      .get(tradingAccountRowId)
      .find('[col-id="deposited"]')
      .should('have.text', '1,000.01000');
  });
});
