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

const mockTx = {
  txHash: 'test-tx-hash',
  tx: {
    signature: {
      value:
        'd86138bba739bbc1069b3dc975d20b3a1517c2b9bdd401c70eeb1a0ecbc502ec268cf3129824841178b8b506b0b7d650c76644dbd96f524a6cb2158fb7121800',
    },
  },
};

describe('deal ticket orders', () => {
  before(() => {
    cy.mockGQL((req) => {
      mockTradingPage(req, MarketState.STATE_ACTIVE);
    });
    cy.visit('/markets/market-0');
    connectVegaWallet();
  });

  it('successfully places market buy order', () => {
    cy.mockVegaCommandSync(mockTx);
    const order: Order = {
      type: 'TYPE_MARKET',
      side: 'SIDE_BUY',
      size: '100',
      timeInForce: 'TIME_IN_FORCE_FOK',
    };
    testOrder(order);
  });

  it('successfully places market sell order', () => {
    cy.mockVegaCommandSync(mockTx);
    const order: Order = {
      type: 'TYPE_MARKET',
      side: 'SIDE_SELL',
      size: '100',
      timeInForce: 'TIME_IN_FORCE_IOC',
    };
    testOrder(order);
  });

  it('successfully places limit buy order', () => {
    cy.mockVegaCommandSync(mockTx);
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
    cy.mockVegaCommandSync(mockTx);
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
    cy.mockVegaCommandSync(mockTx);
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
    const orderSizeField = 'order-size';
    const orderPriceField = 'order-price';
    const orderTIFDropDown = 'order-tif';
    const placeOrderBtn = 'place-order';
    const dialogTitle = 'dialog-title';
    const orderTransactionHash = 'tx-block-explorer';

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
    cy.getByTestId(dialogTitle).should(
      'have.text',
      'Awaiting network confirmation'
    );
    cy.getByTestId(orderTransactionHash)
      .invoke('attr', 'href')
      .should('include', 'https://explorer.fairground.wtf/txs/0xtest-tx-hash');
    cy.getByTestId('dialog-close').click();
  };

  it.skip('cannot place an order if market is suspended');
  it.skip('cannot place an order if size is 0');
  it.skip('cannot place an order expiry date is invalid');
  it.skip('unsuccessful order due to no collateral');
});

describe('deal ticket validation', () => {
  before(() => {
    cy.mockGQL((req) => {
      mockTradingPage(req, MarketState.STATE_ACTIVE);
    });
    cy.visit('/markets/market-0');
  });

  it('cannot place an order if wallet is not connected', () => {
    cy.getByTestId('connect-vega-wallet'); // Not connected
    cy.getByTestId('place-order').should('be.disabled');
    cy.getByTestId('dealticket-error-message').contains(
      'No public key selected'
    );
  });
});
