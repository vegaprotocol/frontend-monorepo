import * as Schema from '@vegaprotocol/types';
import { mockConnectWallet } from '@vegaprotocol/cypress';
import {
  orderPriceField,
  placeOrderBtn,
  toggleLimit,
  toggleLong,
  toggleMarket,
  toggleShort,
} from '../support/deal-ticket';

describe('deal ticket basics', { tags: '@smoke' }, () => {
  before(() => {
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.clearAllLocalStorage();
    cy.visit('/#/markets/market-0');
    cy.wait('@Markets');
  });

  it('must show place order button and connect wallet if wallet is not connected', () => {
    // 0003-WTXN-001
    cy.getByTestId('connect-vega-wallet'); // Not connected
    cy.getByTestId('order-connect-wallet').should('exist');
    cy.getByTestId(placeOrderBtn).should('exist');
    cy.getByTestId('deal-ticket-connect-wallet').should('exist');
  });

  it('must be able to select order direction - long/short', function () {
    // 7002-SORD-004
    cy.getByTestId(toggleShort).click().children('input').should('be.checked');
    cy.getByTestId(toggleLong).click().children('input').should('be.checked');
  });

  it('must be able to select order type - limit/market', function () {
    // 7002-SORD-005
    // 7002-SORD-006
    // 7002-SORD-007
    cy.getByTestId(toggleLimit).click().children('input').should('be.checked');
    cy.getByTestId(toggleMarket).click().children('input').should('be.checked');
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
    cy.getByTestId(toggleLimit).children('input').should('be.checked');
    cy.getByTestId(orderPriceField).should('have.value', '101');
  });
});

describe(
  'market states not accepting orders',
  { tags: '@smoke', testIsolation: true },
  function () {
    //7002-SORD-062
    //7002-SORD-063
    //7002-SORD-066

    const states = [
      Schema.MarketState.STATE_REJECTED,
      Schema.MarketState.STATE_CANCELLED,
      Schema.MarketState.STATE_CLOSED,
      Schema.MarketState.STATE_SETTLED,
      Schema.MarketState.STATE_TRADING_TERMINATED,
    ];

    states.forEach((marketState) => {
      describe(marketState, function () {
        beforeEach(function () {
          cy.mockTradingPage(marketState);
          cy.mockSubscription();
          cy.setVegaWallet();
          cy.visit('/#/markets/market-0');
        });
        it('must display that market is not accepting orders', function () {
          cy.getByTestId('deal-ticket-error-message-summary').should(
            'have.text',
            `This market is ${marketState
              .split('_')
              .pop()
              ?.toLowerCase()} and not accepting orders`
          );
          // 7002-SORD-060
          cy.getByTestId('place-order').should('be.enabled');
        });
      });
    });
  }
);
