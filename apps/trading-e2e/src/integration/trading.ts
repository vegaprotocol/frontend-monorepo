import { MarketState } from '@vegaprotocol/types';
import { mockTradingPage } from '../support/trading';
import { connectVegaWallet } from '../support/vega-wallet';

interface Order {
  type: 'TYPE_MARKET' | 'TYPE_LIMIT';
  side: 'SIDE_BUY' | 'SIDE_SELL';
  size: string;
  price?: string;
  timeInForce:
    | 'TIME_IN_FORCE_GTT'
    | 'TIME_IN_FORCE_GTC'
    | 'TIME_IN_FORCE_IOC'
    | 'TIME_IN_FORCE_FOK'
    | 'TIME_IN_FORCE_GFN'
    | 'TIME_IN_FORCE_GFA';
  expiresAt?: string;
}

describe('trading', () => {
  beforeEach(() => {
    mockTradingPage(MarketState.Active);
    cy.visit('/markets/market-0');
  });

  describe('deal ticket orders', () => {
    const orderSizeField = 'order-size';
    const orderPriceField = 'order-price';
    const orderTIFDropDown = 'order-tif';
    const placeOrderBtn = 'place-order';
    const orderStatusHeader = 'order-status-header';
    const orderTransactionHash = 'tx-hash';

    beforeEach(() => {
      cy.mockVegaCommandSync({
        txHash: 'test-tx-hash',
        tx: {
          signature: {
            value:
              'd86138bba739bbc1069b3dc975d20b3a1517c2b9bdd401c70eeb1a0ecbc502ec268cf3129824841178b8b506b0b7d650c76644dbd96f524a6cb2158fb7121800',
          },
        },
      });
      connectVegaWallet();
    });

    it('successfully places market buy order', () => {
      const order: Order = {
        type: 'TYPE_MARKET',
        side: 'SIDE_BUY',
        size: '100',
        timeInForce: 'TIME_IN_FORCE_FOK',
      };
      testOrder(order);
    });

    it('successfully places market sell order', () => {
      const order: Order = {
        type: 'TYPE_MARKET',
        side: 'SIDE_SELL',
        size: '100',
        timeInForce: 'TIME_IN_FORCE_IOC',
      };
      testOrder(order);
    });

    it('successfully places limit buy order', () => {
      const order: Order = {
        type: 'TYPE_LIMIT',
        side: 'SIDE_BUY',
        size: '100',
        price: '200',
        timeInForce: 'TIME_IN_FORCE_GTC',
      };
      testOrder(order, { price: '20000' });
    });

    it('successfully places limit sell order', () => {
      const order: Order = {
        type: 'TYPE_LIMIT',
        side: 'SIDE_SELL',
        size: '100',
        price: '50000',
        timeInForce: 'TIME_IN_FORCE_GFN',
      };
      testOrder(order, { price: '5000000' });
    });

    it('successfully places GTT limit buy order', () => {
      const order: Order = {
        type: 'TYPE_LIMIT',
        side: 'SIDE_SELL',
        size: '100',
        price: '1.00',
        timeInForce: 'TIME_IN_FORCE_GTT',
        expiresAt: '2022-01-01T00:00',
      };
      testOrder(order, {
        price: '100',
        expiresAt:
          new Date(order.expiresAt as string).getTime().toString() + '000000',
      });
    });

    const testOrder = (order: Order, expected?: Partial<Order>) => {
      const { type, side, size, price, timeInForce, expiresAt } = order;
      cy.get(`[name="order-type"][value="${type}"`).click({ force: true }); // force as input is hidden and displayed as a button
      cy.get(`[name="order-side"][value="${side}"`).click({ force: true });
      cy.getByTestId(orderSizeField).clear().type(size);
      if (price) {
        cy.getByTestId(orderPriceField).clear().type(price);
      }
      cy.getByTestId(orderTIFDropDown).select(timeInForce);
      if (timeInForce === 'TIME_IN_FORCE_GTT') {
        if (!expiresAt) {
          throw new Error('Specify expiresAt if using GTT');
        }
        // select expiry
        cy.getByTestId('date-picker-field').type(expiresAt);
      }
      cy.getByTestId(placeOrderBtn).click();

      const expectedOrder = {
        ...order,
        ...expected,
      };

      cy.wait('@VegaCommandSync')
        .its('request.body')
        .should('deep.equal', {
          pubKey: Cypress.env('VEGA_PUBLIC_KEY'),
          propagate: true,
          orderSubmission: {
            marketId: 'market-0',
            ...expectedOrder,
          },
        });
      cy.getByTestId(orderStatusHeader).should(
        'have.text',
        'Awaiting network confirmation'
      );
      cy.getByTestId(orderTransactionHash)
        .invoke('text')
        .should('contain', 'Tx hash: test-tx-hash');
    };

    it.skip('cannot place an order if market is suspended');
    it.skip('cannot place an order if size is 0');
    it.skip('cannot place an order expiry date is invalid');
    it.skip('unsuccessfull order due to no collateral');
  });

  describe('deal ticket validation', () => {
    it('cannot place an order if wallet is not connected', () => {
      cy.getByTestId('connect-vega-wallet'); // Not connected
      cy.getByTestId('place-order').should('be.disabled');
      cy.getByTestId('dealticket-error-message').contains(
        'No public key selected'
      );
    });
  });

  describe('trades', () => {
    const colIdPrice = 'price';
    const colIdSize = 'size';
    const colIdCreatedAt = 'createdAt';

    it('renders trades', () => {
      cy.getByTestId('Trades').click();
      cy.getByTestId('tab-trades').should('be.visible');

      cy.get(`[col-id=${colIdPrice}]`).each(($tradePrice) => {
        cy.wrap($tradePrice).invoke('text').should('not.be.empty');
      });
      cy.get(`[col-id=${colIdSize}]`).each(($tradeSize) => {
        cy.wrap($tradeSize).invoke('text').should('not.be.empty');
      });

      const dateTimeRegex =
        /(\d{1,2})\/(\d{1,2})\/(\d{4}), (\d{1,2}):(\d{1,2}):(\d{1,2})/gm;
      cy.get(`[col-id=${colIdCreatedAt}]`).each(($tradeDateTime, index) => {
        if (index != 0) {
          //ignore header
          cy.wrap($tradeDateTime).invoke('text').should('match', dateTimeRegex);
        }
      });
    });
  });

  describe('positions', () => {
    it('renders positions', () => {
      cy.getByTestId('Positions').click();
      cy.getByTestId('tab-positions').contains('Please connect Vega wallet');

      connectVegaWallet();

      cy.getByTestId('tab-positions').should('be.visible');
      cy.getByTestId('tab-positions')
        .get('[col-id="market.tradableInstrument.instrument.code"]')
        .each(($marketSymbol) => {
          cy.wrap($marketSymbol).invoke('text').should('not.be.empty');
        });
      cy.getByTestId('tab-positions')
        .get('[col-id="openVolume"]')
        .each(($openVolume) => {
          cy.wrap($openVolume).invoke('text').should('not.be.empty');
        });
      // includes average entry price, mark price & realised PNL
      cy.getByTestId('tab-positions')
        .getByTestId('flash-cell')
        .each(($prices) => {
          cy.wrap($prices).invoke('text').should('not.be.empty');
        });
    });
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

    it('renders orders', () => {
      cy.getByTestId('Orders').click();
      cy.getByTestId('tab-orders').contains('Please connect Vega wallet');

      connectVegaWallet();

      cy.getByTestId('tab-orders').should('be.visible');

      cy.getByTestId('tab-orders')
        .get(`[col-id='${orderSymbol}']`)
        .each(($symbol) => {
          cy.wrap($symbol).invoke('text').should('not.be.empty');
        });
      cy.getByTestId('tab-orders')
        .get(`[col-id='${orderSize}']`)
        .each(($size) => {
          cy.wrap($size).invoke('text').should('not.be.empty');
        });
      cy.getByTestId('tab-orders')
        .get(`[col-id='${orderType}']`)
        .each(($type) => {
          cy.wrap($type).invoke('text').should('not.be.empty');
        });
      cy.getByTestId('tab-orders')
        .get(`[col-id='${orderStatus}']`)
        .each(($status) => {
          cy.wrap($status).invoke('text').should('not.be.empty');
        });
      cy.getByTestId('tab-orders')
        .get(`[col-id='${orderRemaining}']`)
        .each(($remaining) => {
          cy.wrap($remaining).invoke('text').should('not.be.empty');
        });
      cy.getByTestId('tab-orders')
        .get(`[col-id='${orderPrice}']`)
        .each(($price) => {
          cy.wrap($price).invoke('text').should('not.be.empty');
        });
      cy.getByTestId('tab-orders')
        .get(`[col-id='${orderTimeInForce}']`)
        .each(($timeInForce) => {
          cy.wrap($timeInForce).invoke('text').should('not.be.empty');
        });
      cy.getByTestId('tab-orders')
        .get(`[col-id='${orderCreatedAt}']`)
        .each(($dateTime) => {
          cy.wrap($dateTime).invoke('text').should('not.be.empty');
        });
    });
  });

  describe('accounts', () => {
    it('renders accounts', () => {
      cy.getByTestId('Accounts').click();
      cy.getByTestId('tab-accounts').contains('Please connect Vega wallet');

      connectVegaWallet();

      cy.getByTestId('tab-accounts').should('be.visible');
      cy.getByTestId('tab-accounts')
        .get(`[row-id='General-tEURO-null']`)
        .find('[col-id="asset.symbol"]')
        .should('have.text', 'tEURO');

      cy.getByTestId('tab-accounts')
        .get(`[row-id='General-tEURO-null']`)
        .find('[col-id="type"]')
        .should('have.text', 'General');

      cy.getByTestId('tab-accounts')
        .get(`[row-id='General-tEURO-null']`)
        .find('[col-id="market.name"]')
        .should('have.text', '—');

      cy.getByTestId('tab-accounts')
        .get(`[row-id='General-tEURO-null']`)
        .find('[col-id="balance"]')
        .should('have.text', '1,000.00000');
    });
  });
});
