import { MarketState } from '@vegaprotocol/types';
import { mockTradingPage } from '../support/trading';
import { connectVegaWallet } from '../support/vega-wallet';

beforeEach(() => {
  cy.mockGQL((req) => {
    mockTradingPage(req, MarketState.Active);
  });
  cy.visit('/markets/market-0');
});

describe('orders', () => {
  const orderSymbol = 'market.tradableInstrument.instrument.code';
  const orderSize = 'size';
  const orderType = 'type';
  const orderStatus = 'status';
  const orderRemaining = 'remaining';
  const orderPrice = 'price';
  const orderTimeInForce = 'timeInForce';
  const orderCreatedAt = 'createdAt';

  beforeEach(() => {
    cy.getByTestId('Orders').click();
    cy.getByTestId('tab-orders').contains('Please connect Vega wallet');

    connectVegaWallet();
  });

  it('renders orders', () => {
    cy.getByTestId('tab-orders').should('be.visible');

    cy.getByTestId('tab-orders').within(() => {
      cy.get(`[col-id='${orderSymbol}']`).each(($symbol) => {
        cy.wrap($symbol).invoke('text').should('not.be.empty');
      });

      cy.get(`[col-id='${orderSize}']`).each(($size) => {
        cy.wrap($size).invoke('text').should('not.be.empty');
      });

      cy.get(`[col-id='${orderType}']`).each(($type) => {
        cy.wrap($type).invoke('text').should('not.be.empty');
      });

      cy.get(`[col-id='${orderStatus}']`).each(($status) => {
        cy.wrap($status).invoke('text').should('not.be.empty');
      });

      cy.get(`[col-id='${orderRemaining}']`).each(($remaining) => {
        cy.wrap($remaining).invoke('text').should('not.be.empty');
      });

      cy.get(`[col-id='${orderPrice}']`).each(($price) => {
        cy.wrap($price).invoke('text').should('not.be.empty');
      });

      cy.get(`[col-id='${orderTimeInForce}']`).each(($timeInForce) => {
        cy.wrap($timeInForce).invoke('text').should('not.be.empty');
      });

      cy.get(`[col-id='${orderCreatedAt}']`).each(($dateTime) => {
        cy.wrap($dateTime).invoke('text').should('not.be.empty');
      });

      cy.getByTestId('cancel')
        .should('be.visible')
        .and('have.length.at.least', 1);
    });
  });

  it('orders are sorted by most recent order', () => {
    const expectedOrderList = [
      'UNIDAI.MF21',
      'TSLA.QM21',
      'BTCUSD.MF21',
      'AAVEDAI.MF21',
    ];

    cy.getByTestId('tab-orders')
      .get(`[col-id='${orderSymbol}']`)
      .should('have.length.at.least', 3)
      .each(($symbol, index) => {
        if (index != 0) {
          cy.wrap($symbol).should('have.text', expectedOrderList[index - 1]);
        }
      });
  });
});
