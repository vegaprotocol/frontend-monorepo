import * as Schema from '@vegaprotocol/types';
import { generateEstimateOrder } from '../support/mocks/generate-fees';
import { aliasQuery, mockConnectWallet } from '@vegaprotocol/cypress';
import { testOrder } from '../support/deal-ticket-transaction';
import type { OrderSubmission } from '@vegaprotocol/wallet';
import { generateAccounts } from '../support/mocks/generate-accounts';

const orderSizeField = 'order-size';
const orderPriceField = 'order-price';
const orderTIFDropDown = 'order-tif';
const placeOrderBtn = 'place-order';
const toggleShort = 'order-side-SIDE_SELL';
const toggleLong = 'order-side-SIDE_BUY';
const toggleLimit = 'order-type-TYPE_LIMIT';
const toggleMarket = 'order-type-TYPE_MARKET';
const errorMessage = 'dealticket-error-message';

const TIFlist = Object.values(Schema.OrderTimeInForce).map((value) => {
  return {
    code: Schema.OrderTimeInForceCode[value],
    value,
    text: Schema.OrderTimeInForceMapping[value],
  };
});

const displayTomorrow = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().substring(0, 16);
};

describe('time in force default values', () => {
  before(() => {
    cy.mockTradingPage();
    cy.mockGQLSubscription();
    cy.visit('/#/markets/market-0');
    cy.wait('@Market');
    cy.connectVegaWallet();
  });

  it('must have market order set up to IOC by default', function () {
    //7002-SORD-031
    cy.getByTestId(toggleMarket).click();
    cy.get(`[data-testid=${orderTIFDropDown}] option:selected`).should(
      'have.text',
      TIFlist.filter((item) => item.code === 'IOC')[0].text
    );
  });

  it('must have time in force set to GTC for limit order', function () {
    //7002-SORD-031
    cy.getByTestId(toggleLimit).click();
    cy.get(`[data-testid=${orderTIFDropDown}] option:selected`).should(
      'have.text',
      TIFlist.filter((item) => item.code === 'GTC')[0].text
    );
  });
});

describe('must submit order', { tags: '@smoke' }, () => {
  // 7002-SORD-039
  before(() => {
    cy.mockTradingPage();
    cy.mockGQLSubscription();
    cy.visit('/#/markets/market-0');
    cy.wait('@Market');
    cy.connectVegaWallet();
    cy.window().then(function (window) {
      cy.wrap(window.localStorage.getItem('vega_wallet_config')).as('cfg');
    });
  });

  beforeEach(() => {
    cy.window().then(function (window) {
      window.localStorage.setItem('vega_wallet_config', this.cfg);
    });
  });

  it('successfully places market buy order', () => {
    //7002-SORD-010
    cy.mockVegaWalletTransaction();
    const order: OrderSubmission = {
      marketId: 'market-0',
      type: Schema.OrderType.TYPE_MARKET,
      side: Schema.Side.SIDE_BUY,
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
      size: '100',
    };
    testOrder(order);
  });

  it('successfully places market sell order', () => {
    cy.mockVegaWalletTransaction();
    const order: OrderSubmission = {
      marketId: 'market-0',
      type: Schema.OrderType.TYPE_MARKET,
      side: Schema.Side.SIDE_SELL,
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
      size: '100',
    };
    testOrder(order);
  });

  it('successfully places limit buy order', () => {
    // 7002-SORD-017
    cy.mockVegaWalletTransaction();
    const order: OrderSubmission = {
      marketId: 'market-0',
      type: Schema.OrderType.TYPE_LIMIT,
      side: Schema.Side.SIDE_BUY,
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
      size: '100',
      price: '200',
    };
    testOrder(order, { price: '20000000' });
  });

  it('successfully places limit sell order', () => {
    cy.mockVegaWalletTransaction();
    const order: OrderSubmission = {
      marketId: 'market-0',
      type: Schema.OrderType.TYPE_LIMIT,
      side: Schema.Side.SIDE_SELL,
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GFN,
      size: '100',
      price: '50000',
    };
    testOrder(order, { price: '5000000000' });
  });

  it('successfully places GTT limit buy order', () => {
    cy.mockVegaWalletTransaction();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const order: OrderSubmission = {
      marketId: 'market-0',
      type: Schema.OrderType.TYPE_LIMIT,
      side: Schema.Side.SIDE_SELL,
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTT,
      size: '100',
      price: '1.00',
      expiresAt: expiresAt.toISOString().substring(0, 16),
    };
    testOrder(order, {
      price: '100000',
      expiresAt:
        new Date(order.expiresAt as string).getTime().toString() + '000000',
    });
  });
});

describe(
  'must submit order for market in batch auction',
  { tags: '@regression' },
  () => {
    before(() => {
      cy.mockTradingPage(
        Schema.MarketState.STATE_SUSPENDED,
        Schema.MarketTradingMode.TRADING_MODE_BATCH_AUCTION,
        Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY
      );
      cy.mockGQLSubscription();
      cy.visit('/#/markets/market-0');
      cy.wait('@Market');
      cy.connectVegaWallet();
      cy.window().then(function (window) {
        cy.wrap(window.localStorage.getItem('vega_wallet_config')).as('cfg');
      });
    });

    beforeEach(() => {
      cy.window().then(function (window) {
        window.localStorage.setItem('vega_wallet_config', this.cfg);
      });
    });

    it('successfully places limit buy order', () => {
      cy.mockVegaWalletTransaction();
      const order: OrderSubmission = {
        marketId: 'market-0',
        type: Schema.OrderType.TYPE_LIMIT,
        side: Schema.Side.SIDE_BUY,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
        size: '100',
        price: '200',
      };
      testOrder(order, { price: '20000000' });
    });

    it('successfully places limit sell order', () => {
      cy.mockVegaWalletTransaction();
      const order: OrderSubmission = {
        marketId: 'market-0',
        type: Schema.OrderType.TYPE_LIMIT,
        side: Schema.Side.SIDE_SELL,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
        size: '100',
        price: '50000',
      };
      testOrder(order, { price: '5000000000' });
    });

    it('successfully places GTT limit buy order', () => {
      cy.mockVegaWalletTransaction();
      const order: OrderSubmission = {
        marketId: 'market-0',
        type: Schema.OrderType.TYPE_LIMIT,
        side: Schema.Side.SIDE_SELL,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTT,
        size: '100',
        price: '1.00',
        expiresAt: displayTomorrow(),
      };
      testOrder(order, {
        price: '100000',
        expiresAt:
          new Date(order.expiresAt as string).getTime().toString() + '000000',
      });
    });
  }
);

describe(
  'must submit order for market in opening auction',
  { tags: '@regression' },
  () => {
    before(() => {
      cy.mockTradingPage(
        Schema.MarketState.STATE_SUSPENDED,
        Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
        Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY
      );
      cy.mockGQLSubscription();
      cy.visit('/#/markets/market-0');
      cy.wait('@Market');
      cy.connectVegaWallet();
      cy.window().then(function (window) {
        cy.wrap(window.localStorage.getItem('vega_wallet_config')).as('cfg');
      });
    });

    beforeEach(() => {
      cy.window().then(function (window) {
        window.localStorage.setItem('vega_wallet_config', this.cfg);
      });
    });

    it('successfully places limit buy order', () => {
      cy.mockVegaWalletTransaction();
      const order: OrderSubmission = {
        marketId: 'market-0',
        type: Schema.OrderType.TYPE_LIMIT,
        side: Schema.Side.SIDE_BUY,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
        size: '100',
        price: '200',
      };
      testOrder(order, { price: '20000000' });
    });

    it('successfully places limit sell order', () => {
      cy.mockVegaWalletTransaction();
      const order: OrderSubmission = {
        marketId: 'market-0',
        type: Schema.OrderType.TYPE_LIMIT,
        side: Schema.Side.SIDE_SELL,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
        size: '100',
        price: '50000',
      };
      testOrder(order, { price: '5000000000' });
    });

    it('successfully places GTT limit buy order', () => {
      cy.mockVegaWalletTransaction();
      const order: OrderSubmission = {
        marketId: 'market-0',
        type: Schema.OrderType.TYPE_LIMIT,
        side: Schema.Side.SIDE_SELL,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTT,
        size: '100',
        price: '1.00',
        expiresAt: displayTomorrow(),
      };
      testOrder(order, {
        price: '100000',
        expiresAt:
          new Date(order.expiresAt as string).getTime().toString() + '000000',
      });
    });
  }
);

describe(
  'must submit order for market in monitoring auction',
  { tags: '@regression' },
  () => {
    before(() => {
      cy.mockTradingPage(
        Schema.MarketState.STATE_SUSPENDED,
        Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
        Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY
      );
      cy.mockGQLSubscription();
      cy.visit('/#/markets/market-0');
      cy.wait('@Market');
      cy.connectVegaWallet();
      cy.window().then(function (window) {
        cy.wrap(window.localStorage.getItem('vega_wallet_config')).as('cfg');
      });
    });

    beforeEach(() => {
      cy.window().then(function (window) {
        window.localStorage.setItem('vega_wallet_config', this.cfg);
      });
    });

    it('successfully places limit buy order', () => {
      cy.mockVegaWalletTransaction();
      const order: OrderSubmission = {
        marketId: 'market-0',
        type: Schema.OrderType.TYPE_LIMIT,
        side: Schema.Side.SIDE_BUY,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
        size: '100',
        price: '200',
      };
      testOrder(order, { price: '20000000' });
    });

    it('successfully places limit sell order', () => {
      cy.mockVegaWalletTransaction();
      const order: OrderSubmission = {
        marketId: 'market-0',
        type: Schema.OrderType.TYPE_LIMIT,
        side: Schema.Side.SIDE_SELL,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
        size: '100',
        price: '50000',
      };
      testOrder(order, { price: '5000000000' });
    });

    it('successfully places GTT limit buy order', () => {
      cy.mockVegaWalletTransaction();
      const order: OrderSubmission = {
        marketId: 'market-0',
        type: Schema.OrderType.TYPE_LIMIT,
        side: Schema.Side.SIDE_SELL,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTT,
        size: '100',
        price: '1.00',
        expiresAt: displayTomorrow(),
      };
      testOrder(order, {
        price: '100000',
        expiresAt:
          new Date(order.expiresAt as string).getTime().toString() + '000000',
      });
    });
  }
);

describe('deal ticket validation', { tags: '@smoke' }, () => {
  beforeEach(() => {
    cy.mockTradingPage();
    cy.visit('/#/markets/market-0');
    cy.wait('@Market');
  });

  it('must not place an order if wallet is not connected', () => {
    cy.getByTestId('connect-vega-wallet'); // Not connected
    cy.getByTestId('order-connect-wallet').should('exist');
    cy.getByTestId(placeOrderBtn).should('not.exist');
    cy.getByTestId(errorMessage).should('not.exist');
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
    mockConnectWallet();
    cy.getByTestId(toggleLimit).click();
    cy.getByTestId(orderPriceField).clear().type('101');
    cy.getByTestId('order-connect-wallet').click();
    cy.getByTestId('dialog-content').should('be.visible');
    cy.getByTestId('connectors-list')
      .find('[data-testid="connector-jsonRpc"]')
      .click();
    cy.wait('@walletGQL');
    cy.getByTestId(placeOrderBtn).should('be.visible');
    cy.getByTestId(toggleLimit).children('input').should('be.checked');
    cy.getByTestId(orderPriceField).should('have.value', '101');
  });
});

describe('deal ticket size validation', { tags: '@smoke' }, function () {
  beforeEach(() => {
    cy.mockTradingPage();
    cy.visit('/#/markets/market-0');
    cy.wait('@Market');
    cy.connectVegaWallet();
  });

  it('must warn if order size input has too many digits after the decimal place', function () {
    //7002-SORD-016
    cy.getByTestId('order-type-TYPE_MARKET').click();
    cy.getByTestId(orderSizeField).clear().type('1.234');
    cy.getByTestId(placeOrderBtn).should('not.be.disabled');
    cy.getByTestId(placeOrderBtn).click();
    cy.getByTestId(placeOrderBtn).should('be.disabled');
    cy.getByTestId('dealticket-error-message-size-market').should(
      'have.text',
      'Size must be whole numbers for this market'
    );
  });

  it('must warn if order size is set to 0', function () {
    cy.getByTestId('order-type-TYPE_MARKET').click();
    cy.getByTestId(orderSizeField).clear().type('0');
    cy.getByTestId(placeOrderBtn).should('not.be.disabled');
    cy.getByTestId(placeOrderBtn).click();
    cy.getByTestId(placeOrderBtn).should('be.disabled');
    cy.getByTestId('dealticket-error-message-size-market').should(
      'have.text',
      'Size cannot be lower than 1'
    );
  });
});

describe('limit order validations', { tags: '@smoke' }, () => {
  before(() => {
    cy.mockTradingPage();
    cy.mockGQLSubscription();
    cy.visit('/#/markets/market-0');
    cy.connectVegaWallet();
    cy.wait('@Market');
    cy.getByTestId(toggleLimit).click();
  });

  it('must see the price unit', function () {
    //7002-SORD-018
    cy.getByTestId(orderPriceField)
      .siblings('label')
      .should('have.text', 'Price (tBTC)');
  });

  it('must see warning when placing an order with expiry date in past', () => {
    const expiresAt = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const expiresAtInputValue = expiresAt.toISOString().substring(0, 16);
    cy.getByTestId(toggleLimit).click();
    cy.getByTestId(orderPriceField).clear().type('0.1');
    cy.getByTestId(orderSizeField).clear().type('1');
    cy.getByTestId(orderTIFDropDown).select('TIME_IN_FORCE_GTT');

    cy.log('choosing yesterday');
    cy.getByTestId('date-picker-field').type(expiresAtInputValue);

    cy.getByTestId(placeOrderBtn).click();

    cy.getByTestId('dealticket-error-message-expiry').should(
      'have.text',
      'The expiry date that you have entered appears to be in the past'
    );
  });

  it('must see warning if price has too many digits after decimal place', function () {
    //7002-SORD-059
    cy.getByTestId(toggleLimit).click();
    cy.getByTestId(orderTIFDropDown).select('TIME_IN_FORCE_GTC');
    cy.getByTestId(orderSizeField).clear().type('1');
    cy.getByTestId(orderPriceField).clear().type('1.123456');
    cy.getByTestId('dealticket-error-message-price-limit').should(
      'have.text',
      'Price accepts up to 5 decimal places'
    );
  });

  describe('time in force validations', function () {
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

    it('selections should be remembered', () => {
      cy.getByTestId(orderTIFDropDown).select('TIME_IN_FORCE_GTT');
      cy.getByTestId(toggleMarket).click();
      cy.get(`[data-testid=${orderTIFDropDown}] option:selected`).should(
        'have.text',
        TIFlist.filter((item) => item.code === 'IOC')[0].text
      );
      cy.getByTestId(orderTIFDropDown).select('TIME_IN_FORCE_FOK');
      cy.getByTestId(toggleLimit).click();
      cy.get(`[data-testid=${orderTIFDropDown}] option:selected`).should(
        'have.text',
        TIFlist.filter((item) => item.code === 'GTT')[0].text
      );
      cy.getByTestId(toggleMarket).click();
      cy.get(`[data-testid=${orderTIFDropDown}] option:selected`).should(
        'have.text',
        TIFlist.filter((item) => item.code === 'FOK')[0].text
      );
    });
  });
});

describe('market order validations', { tags: '@smoke' }, () => {
  before(() => {
    cy.mockTradingPage();
    cy.visit('/#/markets/market-0');
    cy.wait('@Market');
    cy.getByTestId(toggleMarket).click();
  });
  it('must not see the price unit', function () {
    //7002-SORD-019
    cy.getByTestId(orderPriceField).should('not.exist');
  });

  describe('time in force validations', function () {
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
    cy.mockTradingPage(
      Schema.MarketState.STATE_SUSPENDED,
      Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
      Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY
    );
    cy.mockGQLSubscription();
    cy.visit('/#/markets/market-0');
    cy.wait('@Market');
    cy.connectVegaWallet();
  });

  it('should show warning for market order', function () {
    cy.getByTestId(toggleMarket).click();
    cy.getByTestId(placeOrderBtn).should('not.be.disabled');
    cy.getByTestId(placeOrderBtn).click();
    cy.getByTestId(placeOrderBtn).should('be.disabled');
    cy.getByTestId('dealticket-error-message-type').should(
      'have.text',
      'This market is in auction until it reaches sufficient liquidity. Only limit orders are permitted when market is in auction'
    );
  });
  it('should show info for allowed TIF', function () {
    cy.getByTestId(toggleLimit).click();
    cy.getByTestId(orderPriceField).clear().type('0.1');
    cy.getByTestId(orderSizeField).clear().type('1');
    cy.getByTestId(placeOrderBtn).should('be.enabled');
    cy.getByTestId('dealticket-warning-auction').should(
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
    cy.getByTestId('dealticket-error-message-tif').should(
      'have.text',
      'This market is in auction until it reaches sufficient liquidity. Until the auction ends, you can only place GFA, GTT, or GTC limit orders'
    );
  });
});

describe('account validation', { tags: '@regression' }, () => {
  describe('zero balance error', () => {
    beforeEach(() => {
      cy.mockTradingPage();
      cy.mockGQL((req) => {
        aliasQuery(
          req,
          'Accounts',
          generateAccounts({
            party: {
              accountsConnection: {
                edges: [
                  {
                    node: {
                      type: Schema.AccountType.ACCOUNT_TYPE_GENERAL,
                      balance: '0',
                      market: null,
                      asset: {
                        __typename: 'Asset',
                        id: '5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c',
                      },
                    },
                  },
                ],
              },
            },
          })
        );
      });
      cy.mockGQLSubscription();
      cy.visit('/#/markets/market-0');
      cy.connectVegaWallet();
      cy.wait('@Market');
    });

    it('should show an error if your balance is zero', () => {
      cy.getByTestId('place-order').should('not.be.disabled');
      cy.getByTestId('place-order').click();
      cy.getByTestId('place-order').should('be.disabled');
      //7002-SORD-003
      cy.getByTestId('dealticket-error-message-zero-balance').should(
        'have.text',
        'Insufficient balance. Deposit ' + 'tBTC'
      );
      cy.getByTestId('deal-ticket-deposit-dialog-button').should('exist');
    });
  });

  describe('not enough balance warning', () => {
    beforeEach(() => {
      cy.mockTradingPage();
      cy.mockGQL((req) => {
        aliasQuery(
          req,
          'EstimateOrder',
          generateEstimateOrder({
            estimateOrder: {
              marginLevels: {
                __typename: 'MarginLevels',
                initialLevel: '1000000000',
              },
            },
          })
        );
      });
      cy.mockGQLSubscription();
      cy.visit('/#/markets/market-0');
      cy.connectVegaWallet();
      cy.wait('@Market');
    });
    it('should display info and button for deposit', () => {
      //7002-SORD-003
      // warning should show immediately
      cy.getByTestId('dealticket-warning-margin').should(
        'contain.text',
        'You may not have enough margin available to open this position'
      );
      cy.getByTestId('dealticket-warning-margin').should(
        'contain.text',
        '9,999.99 tBTC currently required, 1,000.00 tBTC available'
      );
      cy.getByTestId('deal-ticket-deposit-dialog-button').click();
      cy.getByTestId('dialog-content')
        .find('h1')
        .eq(0)
        .should('have.text', 'Deposit');
    });
  });
});
