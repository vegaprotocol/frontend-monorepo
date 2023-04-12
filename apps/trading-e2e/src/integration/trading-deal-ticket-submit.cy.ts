import * as Schema from '@vegaprotocol/types';
import { aliasGQLQuery } from '@vegaprotocol/cypress';
import { testOrderSubmission } from '../support/order-validation';
import type { OrderSubmission } from '@vegaprotocol/wallet';
import {
  accountsQuery,
  estimateOrderQuery,
  amendGeneralAccountBalance,
} from '@vegaprotocol/mock';
import { createOrder } from '../support/create-order';

const orderSizeField = 'order-size';
const orderPriceField = 'order-price';
const orderTIFDropDown = 'order-tif';
const placeOrderBtn = 'place-order';
const toggleLimit = 'order-type-TYPE_LIMIT';
const toggleMarket = 'order-type-TYPE_MARKET';

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

describe('must submit order', { tags: '@smoke' }, () => {
  // 7002-SORD-039
  before(() => {
    cy.setVegaWallet();
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.visit('/#/markets/market-0');
    cy.wait('@Markets');
  });

  beforeEach(() => {
    cy.setVegaWallet();
  });

  it('successfully places market buy order', () => {
    // 7002-SORD-010
    // 0003-WTXN-012
    // 0003-WTXN-003
    cy.mockVegaWalletTransaction();
    const order: OrderSubmission = {
      marketId: 'market-0',
      type: Schema.OrderType.TYPE_MARKET,
      side: Schema.Side.SIDE_BUY,
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
      postOnly: false,
      reduceOnly: false,
      size: '100',
    };
    createOrder(order);
    testOrderSubmission(order);
  });

  it('successfully places market sell order', () => {
    cy.mockVegaWalletTransaction();
    const order: OrderSubmission = {
      marketId: 'market-0',
      type: Schema.OrderType.TYPE_MARKET,
      side: Schema.Side.SIDE_SELL,
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
      size: '100',
      postOnly: false,
      reduceOnly: false,
    };
    createOrder(order);
    testOrderSubmission(order);
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
      postOnly: false,
      reduceOnly: false,
      price: '200',
    };
    createOrder(order);
    testOrderSubmission(order, { price: '20000000' });
  });

  it('successfully places limit sell order', () => {
    cy.mockVegaWalletTransaction();
    const order: OrderSubmission = {
      marketId: 'market-0',
      type: Schema.OrderType.TYPE_LIMIT,
      side: Schema.Side.SIDE_SELL,
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GFN,
      size: '100',
      postOnly: false,
      reduceOnly: false,
      price: '50000',
    };
    createOrder(order);
    testOrderSubmission(order, { price: '5000000000' });
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
      postOnly: false,
      reduceOnly: false,
    };

    createOrder(order);
    testOrderSubmission(order, {
      price: '100000',
      expiresAt:
        new Date(order.expiresAt as string).getTime().toString() + '000000',
      postOnly: false,
      reduceOnly: false,
    });
  });
});

describe(
  'must submit order for market in batch auction',
  { tags: '@regression' },
  () => {
    before(() => {
      cy.setVegaWallet();
      cy.mockTradingPage(
        Schema.MarketState.STATE_SUSPENDED,
        Schema.MarketTradingMode.TRADING_MODE_BATCH_AUCTION,
        Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY_TARGET_NOT_MET
      );
      cy.mockSubscription();
      cy.visit('/#/markets/market-0');
      cy.wait('@Markets');
    });

    beforeEach(() => {
      cy.setVegaWallet();
    });

    it('successfully places limit buy order', () => {
      cy.mockVegaWalletTransaction();
      const order: OrderSubmission = {
        marketId: 'market-0',
        type: Schema.OrderType.TYPE_LIMIT,
        side: Schema.Side.SIDE_BUY,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
        size: '100',
        postOnly: false,
        reduceOnly: false,
        price: '200',
      };
      createOrder(order);
      testOrderSubmission(order, { price: '20000000' });
    });

    it('successfully places limit sell order', () => {
      cy.mockVegaWalletTransaction();
      const order: OrderSubmission = {
        marketId: 'market-0',
        type: Schema.OrderType.TYPE_LIMIT,
        side: Schema.Side.SIDE_SELL,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
        size: '100',
        postOnly: false,
        reduceOnly: false,
        price: '50000',
      };
      createOrder(order);
      testOrderSubmission(order, { price: '5000000000' });
    });

    it('successfully places GTT limit buy order', () => {
      cy.mockVegaWalletTransaction();
      const order: OrderSubmission = {
        marketId: 'market-0',
        type: Schema.OrderType.TYPE_LIMIT,
        side: Schema.Side.SIDE_SELL,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTT,
        size: '100',
        postOnly: false,
        reduceOnly: false,
        price: '1.00',
        expiresAt: displayTomorrow(),
      };
      createOrder(order);
      testOrderSubmission(order, {
        price: '100000',
        postOnly: false,
        reduceOnly: false,
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
      cy.setVegaWallet();
      cy.mockTradingPage(
        Schema.MarketState.STATE_SUSPENDED,
        Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
        Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY_TARGET_NOT_MET
      );
      cy.mockSubscription();
      cy.visit('/#/markets/market-0');
      cy.wait('@Markets');
    });

    beforeEach(() => {
      cy.setVegaWallet();
    });

    it('successfully places limit buy order', () => {
      cy.mockVegaWalletTransaction();
      const order: OrderSubmission = {
        marketId: 'market-0',
        type: Schema.OrderType.TYPE_LIMIT,
        side: Schema.Side.SIDE_BUY,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
        size: '100',
        postOnly: false,
        reduceOnly: false,
        price: '200',
      };
      createOrder(order);
      testOrderSubmission(order, { price: '20000000' });
    });

    it('successfully places limit sell order', () => {
      cy.mockVegaWalletTransaction();
      const order: OrderSubmission = {
        marketId: 'market-0',
        type: Schema.OrderType.TYPE_LIMIT,
        side: Schema.Side.SIDE_SELL,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
        size: '100',
        postOnly: false,
        reduceOnly: false,
        price: '50000',
      };
      createOrder(order);
      testOrderSubmission(order, { price: '5000000000' });
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
        postOnly: false,
        reduceOnly: false,
      };
      createOrder(order);
      testOrderSubmission(order, {
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
      cy.setVegaWallet();
      cy.mockTradingPage(
        Schema.MarketState.STATE_SUSPENDED,
        Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
        Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY_TARGET_NOT_MET
      );
      cy.mockSubscription();
      cy.visit('/#/markets/market-0');
      cy.wait('@Markets');
    });

    beforeEach(() => {
      cy.setVegaWallet();
    });

    it('successfully places limit buy order', () => {
      cy.mockVegaWalletTransaction();
      const order: OrderSubmission = {
        marketId: 'market-0',
        type: Schema.OrderType.TYPE_LIMIT,
        side: Schema.Side.SIDE_BUY,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
        size: '100',
        postOnly: false,
        reduceOnly: false,
        price: '200',
      };
      createOrder(order);
      testOrderSubmission(order, { price: '20000000' });
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
        postOnly: false,
        reduceOnly: false,
      };
      createOrder(order);
      testOrderSubmission(order, { price: '5000000000' });
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
        postOnly: false,
        reduceOnly: false,
      };
      createOrder(order);
      testOrderSubmission(order, {
        price: '100000',
        expiresAt:
          new Date(order.expiresAt as string).getTime().toString() + '000000',
      });
    });
  }
);

describe('suspended market validation', { tags: '@regression' }, () => {
  before(() => {
    cy.setVegaWallet();
    cy.mockTradingPage(
      Schema.MarketState.STATE_SUSPENDED,
      Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
      Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY_TARGET_NOT_MET
    );
    const accounts = accountsQuery();
    cy.mockGQL((req) => {
      aliasGQLQuery(req, 'Accounts', accounts);
    });
    cy.mockSubscription();
    cy.visit('/#/markets/market-0');
    cy.wait('@Markets');
  });

  beforeEach(() => {
    cy.setVegaWallet();
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
      cy.setVegaWallet();
      cy.mockTradingPage();
      const accounts = accountsQuery();
      amendGeneralAccountBalance(accounts, 'market-0', '0');
      cy.mockGQL((req) => {
        aliasGQLQuery(req, 'Accounts', accounts);
      });
      cy.mockSubscription();
      cy.visit('/#/markets/market-0');
      cy.wait('@Markets');
    });

    it('should show an error if your balance is zero', () => {
      cy.getByTestId('place-order').should('be.disabled');
      // 7002-SORD-003
      cy.getByTestId('dealticket-error-message-zero-balance').should(
        'have.text',
        'You need ' +
          'tDAI' +
          ' in your wallet to trade in this market.See all your collateral.Make a deposit'
      );
      cy.getByTestId('deal-ticket-deposit-dialog-button').should('exist');
    });
  });

  describe('not enough balance warning', () => {
    beforeEach(() => {
      cy.setVegaWallet();
      cy.mockTradingPage();
      const accounts = accountsQuery();
      amendGeneralAccountBalance(accounts, 'market-0', '100000000');
      cy.mockGQL((req) => {
        aliasGQLQuery(req, 'Accounts', accounts);
      });
      cy.mockGQL((req) => {
        aliasGQLQuery(req, 'EstimateOrder', estimateOrderQuery());
      });
      cy.mockSubscription();
      cy.visit('/#/markets/market-0');
      cy.wait('@Markets');
    });

    it('should display info and button for deposit', () => {
      // 7002-SORD-003

      // warning should show immediately
      cy.getByTestId('dealticket-warning-margin').should(
        'contain.text',
        'You may not have enough margin available to open this position'
      );
      cy.getByTestId('dealticket-warning-margin').should(
        'contain.text',
        'You may not have enough margin available to open this position. 2,354.72283 tDAI is currently required. You have only 1,000.01 tDAI available.'
      );
      cy.getByTestId('deal-ticket-deposit-dialog-button').click();
      cy.getByTestId('dialog-content')
        .find('h1')
        .eq(0)
        .should('have.text', 'Deposit');
    });
  });

  describe('must submit order', { tags: '@smoke' }, () => {
    // 7002-SORD-039
    beforeEach(() => {
      cy.setVegaWallet();
      cy.mockTradingPage();
      cy.mockSubscription();
      cy.visit('/#/markets/market-0');
      cy.wait('@Markets');
    });

    it('must see a prompt to check connected vega wallet to approve transaction', () => {
      // 0003-WTXN-002
      cy.mockVegaWalletTransaction(1000);
      const order: OrderSubmission = {
        marketId: 'market-0',
        type: Schema.OrderType.TYPE_MARKET,
        side: Schema.Side.SIDE_BUY,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
        size: '100',
      };
      createOrder(order);
      cy.getByTestId('toast-content').should(
        'contain.text',
        'Please go to your Vega wallet application and approve or reject the transaction.'
      );
    });

    it('must show error returned by wallet ', () => {
      // 0003-WTXN-009
      // 0003-WTXN-011
      // 0002-WCON-016
      // 0003-WTXN-008

      //trigger error from the wallet
      cy.intercept('POST', 'http://localhost:1789/api/v2/requests', (req) => {
        req.on('response', (res) => {
          res.send({
            jsonrpc: '2.0',
            id: '1',
          });
        });
      });

      const order: OrderSubmission = {
        marketId: 'market-0',
        type: Schema.OrderType.TYPE_MARKET,
        side: Schema.Side.SIDE_BUY,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
        size: '100',
      };
      createOrder(order);
      cy.getByTestId('toast-content').should(
        'contain.text',
        'The connection to your Vega Wallet has been lost.'
      );
      cy.getByTestId('connect-vega-wallet').click();
      cy.getByTestId('dialog-content').should('be.visible');
    });

    it('must see that the order was rejected by the connected wallet', () => {
      // 0003-WTXN-007

      //trigger rejection error from the wallet
      cy.intercept('POST', 'http://localhost:1789/api/v2/requests', (req) => {
        req.alias = 'client.send_transaction';
        req.reply({
          statusCode: 400,
          body: {
            jsonrpc: '2.0',
            error: {
              code: 3001,
              data: 'the user rejected the wallet connection',
              message: 'User error',
            },
            id: '0',
          },
        });
      });

      const order: OrderSubmission = {
        marketId: 'market-0',
        type: Schema.OrderType.TYPE_MARKET,
        side: Schema.Side.SIDE_BUY,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
        size: '100',
      };
      createOrder(order);
      cy.getByTestId('toast-content').should(
        'contain.text',
        'Error occurredthe user rejected the wallet connection'
      );
    });
  });
});
