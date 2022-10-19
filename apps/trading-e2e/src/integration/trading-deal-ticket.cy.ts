import {
  MarketState,
  MarketTradingMode,
  AuctionTrigger,
} from '@vegaprotocol/types';
import { mockTradingPage } from '../support/trading';
import { connectVegaWallet } from '../support/vega-wallet';

const orderSizeField = 'order-size';
const orderPriceField = 'order-price';
const orderTIFDropDown = 'order-tif';
const placeOrderBtn = 'place-order';
const dialogTitle = 'dialog-title';
const orderTransactionHash = 'tx-block-explorer';
const toggleShort = 'order-side-SIDE_SELL';
const toggleLong = 'order-side-SIDE_BUY';
const toggleLimit = 'order-type-TYPE_LIMIT';
const toggleMarket = 'order-type-TYPE_MARKET';
const errorMessage = 'dealticket-error-message';

const TIFlist = [
  {
    code: 'GTT',
    value: 'TIME_IN_FORCE_GTT',
    text: `Good 'til Time (GTT)`,
  },
  {
    code: 'GTC',
    value: 'TIME_IN_FORCE_GTC',
    text: `Good 'til Cancelled (GTC)`,
  },
  {
    code: 'IOC',
    value: 'TIME_IN_FORCE_IOC',
    text: `Immediate or Cancel (IOC)`,
  },
  {
    code: 'FOK',
    value: 'TIME_IN_FORCE_FOK',
    text: `Fill or Kill (FOK)`,
  },
  {
    code: 'GFN',
    value: 'TIME_IN_FORCE_GFN',
    text: `Good for Normal (GFN)`,
  },
  {
    code: 'GFA',
    value: 'TIME_IN_FORCE_GFA',
    text: `Good for Auction (GFA)`,
  },
];

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

const testOrder = (order: Order, expected?: Partial<Order>) => {
  const { type, side, size, price, timeInForce, expiresAt } = order;

  cy.getByTestId(`order-type-${type}`).click();
  cy.getByTestId(`order-side-${side}`).click();
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
    .should('include', `${Cypress.env('EXPLORER_URL')}/txs/0xtest-tx-hash`);
  cy.getByTestId('dialog-close').click();
};

describe('must submit order', { tags: '@smoke' }, () => {
  // 7002-SORD-039
  before(() => {
    cy.mockTradingPage();
    cy.mockGQLSubscription();
    cy.visit('/markets/market-0');
    cy.wait('@Market');
    connectVegaWallet();
  });

  it('successfully places market buy order', () => {
    //7002-SORD-010
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
    // 7002-SORD-017
    cy.mockVegaCommandSync(mockTx);
    const order: Order = {
      type: 'TYPE_LIMIT',
      side: 'SIDE_BUY',
      size: '100',
      price: '200',
      timeInForce: 'TIME_IN_FORCE_GTC',
    };
    testOrder(order, { price: '20000000' });
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
    testOrder(order, { price: '5000000000' });
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
      price: '100000',
      expiresAt:
        new Date(order.expiresAt as string).getTime().toString() + '000000',
    });
  });

  it.skip('must not allow to place an order if balance is 0 (no collateral)', function () {
    //7002-/SORD-/003
    // it will be covered in https://github.com/vegaprotocol/frontend-monorepo/issues/1660
  });
});

describe('deal ticket validation', { tags: '@smoke' }, () => {
  before(() => {
    cy.mockGQL((req) => {
      mockTradingPage(req, MarketState.STATE_ACTIVE);
    });
    cy.visit('/markets/market-0');
    cy.wait('@Market');
  });

  it('must not place an order if wallet is not connected', () => {
    cy.getByTestId('connect-vega-wallet'); // Not connected
    cy.getByTestId('order-connect-wallet').should('exist');
    cy.getByTestId(placeOrderBtn).should('not.exist');
    cy.getByTestId(errorMessage).should('not.exist');
    cy.getByTestId('order-get-vega-wallet').should(
      'have.attr',
      'href',
      'https://github.com/vegaprotocol/vega/releases'
    );
  });

  it('must be able to select order direction - long/short', function () {
    //7002-SORD-004
    cy.getByTestId(toggleShort).click().children('input').should('be.checked');
    cy.getByTestId(toggleLong).click().children('input').should('be.checked');
  });

  it('must be able to select order type - limit/market', function () {
    //7002-SORD-005
    //7002-SORD-006
    //7002-SORD-007
    cy.getByTestId(toggleLimit).click().children('input').should('be.checked');
    cy.getByTestId(toggleMarket).click().children('input').should('be.checked');
  });

  it('order connect vega wallet button should connect', () => {
    cy.getByTestId(toggleLimit).click();
    cy.getByTestId(orderPriceField).type('101');
    cy.getByTestId('order-connect-wallet').click();
    cy.getByTestId('dialog-content').should('be.visible');
    cy.getByTestId('connectors-list')
      .find('[data-testid="connector-gui"]')
      .click();
    const form = 'rest-connector-form';
    const walletName = Cypress.env('TRADING_TEST_VEGA_WALLET_NAME');
    const walletPassphrase = Cypress.env('TRADING_TEST_VEGA_WALLET_PASSPHRASE');
    cy.getByTestId(form).find('#wallet').click().type(walletName);
    cy.getByTestId(form).find('#passphrase').click().type(walletPassphrase);
    cy.getByTestId(form).find('button[type=submit]').click();
    cy.getByTestId(placeOrderBtn).should('be.visible');
    cy.getByTestId(toggleLimit).children('input').should('be.checked');
    cy.getByTestId(orderPriceField).should('have.value', '101');
  });
});

describe('deal ticket size validation', { tags: '@smoke' }, function () {
  before(() => {
    cy.mockGQL((req) => {
      mockTradingPage(req, MarketState.STATE_ACTIVE);
    });
    cy.visit('/markets/market-0');
    cy.wait('@Market');
    connectVegaWallet();
  });
  it('must warn if order size input has too many digits after the decimal place', function () {
    //7002-SORD-016
    cy.getByTestId(orderSizeField).clear().type('1.234');
    cy.getByTestId(placeOrderBtn).should('be.disabled');
    cy.getByTestId(errorMessage).should(
      'have.text',
      'Order sizes must be in whole numbers for this market'
    );
  });

  it('must warn if order size is set to 0', function () {
    cy.getByTestId(orderSizeField).clear().type('0');
    cy.getByTestId(placeOrderBtn).should('be.disabled');
    cy.getByTestId(errorMessage).should(
      'have.text',
      'Size cannot be lower than "1"'
    );
  });
});

describe('limit order validations', { tags: '@smoke' }, () => {
  before(() => {
    cy.mockGQL((req) => {
      mockTradingPage(req, MarketState.STATE_ACTIVE);
    });
    cy.visit('/markets/market-0');
    cy.wait('@Market');
    cy.getByTestId(toggleLimit).click();
  });

  it('must see the price unit', function () {
    //7002-SORD-018
    cy.getByTestId(orderPriceField)
      .siblings('label')
      .should('have.text', 'Price (BTC)');
  });

  it.skip('must see warning when placing an order with expiry date in past', function () {
    // Test to be created after the bug below is fixed
    // https://github.com/vegaprotocol/frontend-monorepo/issues/1694
  });

  it.skip('must receive warning if price has too many digits after decimal place', function () {
    //7002/-SORD-/059
    // Skipped until https://github.com/vegaprotocol/frontend-monorepo/issues/1686 resolved
  });

  describe('time in force validations', function () {
    it('must have limit order set to GTC by default', function () {
      //7002-SORD-031
      cy.get(`[data-testid=${orderTIFDropDown}] option:selected`).should(
        'have.text',
        TIFlist.filter((item) => item.code === 'GTC')[0].text
      );
    });

    const validTIF = TIFlist;
    validTIF.forEach((tif) => {
      //7002-SORD-023
      //7002-SORD-024
      //7002-SORD-025
      //7002-SORD-026
      //7002-SORD-027
      //7002-SORD-028

      it(`must be able to select ${tif.code}`, function () {
        cy.getByTestId(orderTIFDropDown).select(tif.value);
        cy.get(`[data-testid=${orderTIFDropDown}] option:selected`).should(
          'have.text',
          tif.text
        );
      });
    });
  });
});

describe('market order validations', { tags: '@smoke' }, () => {
  before(() => {
    cy.mockGQL((req) => {
      mockTradingPage(req, MarketState.STATE_ACTIVE);
    });
    cy.visit('/markets/market-0');
    cy.wait('@Market');
    cy.getByTestId(toggleMarket).click();
  });
  it('must not see the price unit', function () {
    //7002-SORD-019
    cy.getByTestId(orderPriceField).should('not.exist');
  });

  describe('time in force validations', function () {
    it('must have market order set up to IOC by default', function () {
      //7002-SORD-031
      cy.get(`[data-testid=${orderTIFDropDown}] option:selected`).should(
        'have.text',
        TIFlist.filter((item) => item.code === 'IOC')[0].text
      );
    });

    const validTIF = TIFlist.filter((tif) => ['FOK', 'IOC'].includes(tif.code));
    const invalidTIF = TIFlist.filter(
      (tif) => !['FOK', 'IOC'].includes(tif.code)
    );

    validTIF.forEach((tif) => {
      //7002-SORD-025
      //7002-SORD-026

      it(`must be able to select ${tif.code}`, function () {
        cy.getByTestId(orderTIFDropDown).select(tif.value);
        cy.get(`[data-testid=${orderTIFDropDown}] option:selected`).should(
          'have.text',
          tif.text
        );
      });
    });

    invalidTIF.forEach((tif) => {
      //7002-SORD-023
      //7002-SORD-024
      //7002-SORD-027
      //7002-SORD-028
      it(`must not be able to select ${tif.code}`, function () {
        cy.getByTestId(orderTIFDropDown).should('not.contain', tif.text);
      });
    });
  });
});

describe('suspended market validation', { tags: '@regression' }, () => {
  before(() => {
    cy.mockGQL((req) => {
      mockTradingPage(
        req,
        MarketState.STATE_SUSPENDED,
        MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
        AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY
      );
    });
    cy.visit('/markets/market-0');
    cy.wait('@Market');
    connectVegaWallet();
  });

  it('should show warning for market order', function () {
    cy.getByTestId(toggleMarket).click();
    cy.getByTestId(placeOrderBtn).should('be.disabled');
    cy.getByTestId(errorMessage).should(
      'have.text',
      'This market is in auction until it reaches sufficient liquidity. Only limit orders are permitted when market is in auction'
    );
  });
  it('should show info for allowed TIF', function () {
    cy.getByTestId(toggleLimit).click();
    cy.getByTestId(placeOrderBtn).should('be.enabled');
    cy.getByTestId(errorMessage).should(
      'have.text',
      'Any orders placed now will not trade until the auction ends'
    );
  });

  it('should show warning for not allowed TIF', function () {
    cy.getByTestId(toggleLimit).click();
    cy.getByTestId(orderTIFDropDown).select(
      TIFlist.filter((item) => item.code === 'FOK')[0].value
    );
    cy.getByTestId(placeOrderBtn).should('be.disabled');
    cy.getByTestId(errorMessage).should(
      'have.text',
      'This market is in auction until it reaches sufficient liquidity. Until the auction ends, you can only place GFA, GTT, or GTC limit orders'
    );
  });
});
