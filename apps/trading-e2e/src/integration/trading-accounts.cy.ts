import { MarketState } from '@vegaprotocol/types';
import { mockTradingPage } from '../support/trading';
import { connectVegaWallet } from '../support/vega-wallet';

beforeEach(() => {
  cy.mockGQL((req) => {
    mockTradingPage(req, MarketState.STATE_ACTIVE);
  });
  cy.visit('/markets/market-0');
});

describe('accounts', () => {
  it('renders accounts', () => {
    const tradingAccountRowId = '[row-id="ACCOUNT_TYPE_GENERAL-tEURO-null"]';
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
      .find('[col-id="type"]')
      .should('have.text', 'ACCOUNT_TYPE_GENERAL');

    cy.getByTestId('tab-accounts')
      .should('be.visible')
      .get(tradingAccountRowId)
      .find('[col-id="market.name"]')
      .should('have.text', '—');

    cy.getByTestId('tab-accounts')
      .should('be.visible')
      .get(tradingAccountRowId)
      .find('[col-id="balance"]')
      .should('have.text', '1,000.00000');
  });
});
