import { MarketState } from '@vegaprotocol/types';
import { mockTradingPage } from '../support/trading';
import type { onMessage } from '@vegaprotocol/cypress';
import type {
  OrderSub as OrderSubData,
  OrderSubVariables,
} from '@vegaprotocol/orders';
import { connectVegaWallet } from '../support/vega-wallet';

const onOrderSub: onMessage<OrderSubData, OrderSubVariables> = function (send) {
  send({
    orders: [],
  });
};

const subscriptionMocks = { OrderSub: onOrderSub };

before(() => {
  cy.spy(subscriptionMocks, 'OrderSub');
  cy.mockGQL((req) => {
    mockTradingPage(req, MarketState.STATE_ACTIVE);
  });
  cy.mockGQLSubscription(subscriptionMocks);
  cy.visit('/markets/market-0');
  cy.getByTestId('Orders').click();
  cy.getByTestId('tab-orders').contains('Please connect Vega wallet');

  connectVegaWallet();
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
  const cancelOrderBtn = 'cancel';
  const editOrderBtn = 'edit';

  it('renders orders', () => {
    cy.getByTestId('tab-orders').should('be.visible');
    expect(subscriptionMocks.OrderSub).to.be.calledOnce;

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

      cy.getByTestId(cancelOrderBtn)
        .should('be.visible')
        .and('have.length.at.least', 1);

      cy.getByTestId(editOrderBtn)
        .should('be.visible')
        .and('have.length.at.least', 1);
    });
  });

  it('partially filled orders should not show close/edit buttons', () => {
    const partiallyFilledId =
      '94aead3ca92dc932efcb503631b03a410e2a5d4606cae6083e2406dc38e52f78';

    cy.getByTestId('tab-orders').should('be.visible');
    cy.get(`[row-id="${partiallyFilledId}"]`).within(() => {
      cy.get(`[col-id='${orderStatus}']`).should(
        'have.text',
        'PartiallyFilled'
      );
      cy.get(`[col-id='${orderRemaining}']`).should('have.text', '7/10');
      cy.getByTestId(cancelOrderBtn).should('not.exist');
      cy.getByTestId(editOrderBtn).should('not.exist');
    });
  });

  it('orders are sorted by most recent order', () => {
    const expectedOrderList = [
      'BTCUSD.MF21',
      'SOLUSD',
      'AAPL.MF21',
      'ETHBTC.QM21',
      'ETHBTC.QM21',
    ];

    cy.getByTestId('tab-orders')
      .get(`.ag-center-cols-container [col-id='${orderSymbol}']`)
      .should('have.length.at.least', 5)
      .then(($symbols) => {
        const symbolNames: string[] = [];
        cy.wrap($symbols)
          .each(($symbol) => {
            cy.wrap($symbol)
              .invoke('text')
              .then((text) => {
                symbolNames.push(text);
              });
          })
          .then(() => {
            expect(symbolNames).to.include.ordered.members(expectedOrderList);
          });
      });
  });
});
