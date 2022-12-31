import { createMarket } from '../support/capsule/create-market';
import * as Schema from '@vegaprotocol/types';
import {
  OrderStatusMapping,
  OrderTimeInForceMapping,
  OrderTypeMapping,
  Side,
} from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';
import { isBefore, isAfter, addSeconds, subSeconds } from 'date-fns';
import { createOrder } from '../support/create-order';
import type { SingleMarketFieldsFragment } from '@vegaprotocol/market-list';

const orderSize = 'size';
const orderType = 'type';
const orderStatus = 'status';
const orderRemaining = 'remaining';
const orderPrice = 'price';
const orderTimeInForce = 'timeInForce';
const orderCreatedAt = 'createdAt';

describe('capsule', { tags: '@smoke' }, () => {
  let market: SingleMarketFieldsFragment;
  before(() => {
    const vegaPubKey =
      '70d14a321e02e71992fd115563df765000ccc4775cbe71a0e2f9ff5a3b9dc680';
    const token =
      'iRjOdw8j4tKQEPBbQfpOtFQpDdGj1TAgRCWWKswCfROuKpWevHomU8NiiNKIOqdy';
    Cypress.env('VEGA_WALLET_API_TOKEN', token);

    Cypress.env('VEGA_PUBLIC_KEY', vegaPubKey);

    cy.wrap(createMarket(vegaPubKey, token), { timeout: 30000 }).as('markets');
    cy.get('@markets').should('not.equal', false);

    // store the vega wallet config so that we connect eagerly
    cy.window().then((win) => {
      win.localStorage.setItem(
        'vega_wallet_config',
        JSON.stringify({
          token: Cypress.env('VEGA_WALLET_API_TOKEN'),
          connector: 'jsonRpc',
          url: 'http://localhost:1789',
        })
      );
    });
  });

  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem(
        'vega_wallet_config',
        JSON.stringify({
          token: Cypress.env('VEGA_WALLET_API_TOKEN'),
          connector: 'jsonRpc',
          url: 'http://localhost:1789',
        })
      );
    });
  });

  it('can view market', () => {
    cy.visit('/#/markets/all');
    cy.get('@markets').then((markets) => {
      market = markets[0] as unknown as SingleMarketFieldsFragment;
      cy.getByTestId(`market-${market.id}`).click();
    });
  });

  it('can place and receive an order', () => {
    if (!market) {
      throw new Error('no marketId');
    }
    cy.log('marketId: ', market.id);

    const order = {
      marketId: market.id,
      type: Schema.OrderType.TYPE_LIMIT,
      side: Schema.Side.SIDE_BUY,
      size: '0.0005',
      price: '390',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
    };
    const rawPrice = removeDecimal(order.price, market.decimalPlaces);
    const rawSize = removeDecimal(order.size, market.positionDecimalPlaces);

    createOrder(order);

    cy.getByTestId('dialog-title').should(
      'contain.text',
      'Awaiting network confirmation'
    );
    cy.getByTestId('dialog-title').should('contain.text', 'Order submitted');
    cy.getByTestId('dialog-close').click();

    // orderbook cells are keyed by price level
    cy.getByTestId('tab-orderbook')
      .get(`[data-testid="price-${rawPrice}"]`)
      .should('contain.text', order.price)
      .get(`[data-testid="bid-vol-${rawPrice}"]`)
      .should('contain.text', rawSize);

    cy.getByTestId('Orders').click();
    cy.getByTestId('tab-orders').within(() => {
      cy.get('.ag-center-cols-container')
        .children()
        .first()
        .within(() => {
          cy.get(`[col-id='${orderSize}']`).should(
            'contain.text',
            order.side === Side.SIDE_BUY ? '+' : '-' + order.size
          );

          cy.get(`[col-id='${orderType}']`).should(
            'contain.text',
            OrderTypeMapping[order.type]
          );

          cy.get(`[col-id='${orderStatus}']`).should(
            'contain.text',
            OrderStatusMapping.STATUS_ACTIVE
          );

          cy.get(`[col-id='${orderRemaining}']`).should(
            'contain.text',
            `0.00/${order.size}`
          );

          cy.get(`[col-id='${orderPrice}']`).then(($price) => {
            expect(parseFloat($price.text())).to.equal(parseFloat(order.price));
          });

          cy.get(`[col-id='${orderTimeInForce}']`).should(
            'contain.text',
            OrderTimeInForceMapping[order.timeInForce]
          );

          cy.get(`[col-id='${orderCreatedAt}']`)
            .should('not.be.empty')
            .then(($dateTime) => {
              // allow a date 5 seconds either side to allow for
              // unexpected latency
              const minBefore = subSeconds(new Date(), 5);
              const maxAfter = addSeconds(new Date(), 5);
              const date = new Date($dateTime.text());
              expect(
                isAfter(date, minBefore) && isBefore(date, maxAfter)
              ).to.equal(true);
            });
        });
    });

    // TODO: We should edit an order here first, before cancellation

    cy.getByTestId('cancel').first().click();

    cy.getByTestId('dialog-title').should(
      'contain.text',
      'Awaiting network confirmation'
    );
    cy.getByTestId('dialog-title').should('contain.text', 'Order cancelled');
    cy.getByTestId('dialog-close').click();

    cy.getByTestId('tab-orders')
      .get('.ag-center-cols-container')
      .children()
      .first()
      .get(`[col-id='${orderStatus}']`)
      .should('contain.text', OrderStatusMapping.STATUS_CANCELLED);
  });
});

function removeDecimal(value: string, decimals: number): string {
  if (!decimals) return value;
  return new BigNumber(value || 0).times(Math.pow(10, decimals)).toFixed(0);
}
