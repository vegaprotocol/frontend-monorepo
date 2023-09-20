import { mockConnectWallet } from '@vegaprotocol/cypress';
import {
  orderPriceField,
  placeOrderBtn,
  toggleLimit,
} from '../support/deal-ticket';

describe('deal ticket basics', { tags: '@smoke' }, () => {
  before(() => {
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.clearAllLocalStorage();
    cy.setOnBoardingViewed();
    cy.visit('/#/markets/market-0');
    cy.wait('@Markets');
  });

  it('must show place order button and connect wallet if wallet is not connected', () => {
    // 0003-WTXN-001
    cy.getByTestId('connect-vega-wallet'); // Not connected
    cy.getByTestId(placeOrderBtn).should('exist');
    cy.getByTestId('order-connect-wallet').should('exist');
  });

  it('order connect vega wallet button should connect', () => {
    mockConnectWallet();
    cy.getByTestId(toggleLimit).click();
    cy.getByTestId(orderPriceField).clear().type('101');
    cy.getByTestId('order-connect-wallet').click();
    cy.getByTestId('dialog-content').should('be.visible');
    cy.getByTestId('connectors-list')
      .find('[data-testid="connector-jsonRpc"]')
      .click();
    cy.wait('@walletReq');
    cy.getByTestId(placeOrderBtn).should('be.visible');
    cy.getByTestId(toggleLimit).next('input').should('be.checked');
    cy.getByTestId(orderPriceField).should('have.value', '101');
  });

  it('sidebar should be open after reload', () => {
    cy.mockTradingPage();
    cy.getByTestId('deal-ticket-form').should('be.visible');
    cy.getByTestId('Order').click();
    cy.getByTestId('deal-ticket-form').should('not.exist');
    cy.reload();
    cy.getByTestId('deal-ticket-form').should('be.visible');
  });
});
