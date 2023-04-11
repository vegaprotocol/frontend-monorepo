import * as Schema from '@vegaprotocol/types';
import { mockConnectWallet } from '@vegaprotocol/cypress';

const orderSizeField = 'order-size';
const orderPriceField = 'order-price';
const orderTIFDropDown = 'order-tif';
const placeOrderBtn = 'place-order';
const toggleShort = 'order-side-SIDE_SELL';
const toggleLong = 'order-side-SIDE_BUY';
const toggleLimit = 'order-type-TYPE_LIMIT';
const toggleMarket = 'order-type-TYPE_MARKET';

const TIFlist = Object.values(Schema.OrderTimeInForce).map((value) => {
  return {
    code: Schema.OrderTimeInForceCode[value],
    value,
    text: Schema.OrderTimeInForceMapping[value],
  };
});

describe('time in force default values', () => {
  before(() => {
    cy.setVegaWallet();
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.visit('/#/markets/market-0');
    cy.wait('@Markets');
  });

  it('must have market order set up to IOC by default', function () {
    // 7002-SORD-030
    cy.getByTestId(toggleMarket).click();
    cy.get(`[data-testid=${orderTIFDropDown}] option:selected`).should(
      'have.text',
      TIFlist.filter((item) => item.code === 'IOC')[0].text
    );
  });

  it('must have time in force set to GTC for limit order', function () {
    // 7002-SORD-031
    cy.getByTestId(toggleLimit).click();
    cy.get(`[data-testid=${orderTIFDropDown}] option:selected`).should(
      'have.text',
      TIFlist.filter((item) => item.code === 'GTC')[0].text
    );
  });
});

describe('deal ticket validation', { tags: '@smoke' }, () => {
  beforeEach(() => {
    cy.mockTradingPage();
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

describe('deal ticket size validation', { tags: '@smoke' }, function () {
  beforeEach(() => {
    cy.setVegaWallet();
    cy.mockTradingPage();
    cy.visit('/#/markets/market-0');
    cy.wait('@Markets');
  });

  it('must warn if order size input has too many digits after the decimal place', function () {
    // 7002-SORD-016
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
    cy.setVegaWallet();
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.visit('/#/markets/market-0');
    cy.wait('@Markets');
    cy.getByTestId(toggleLimit).click();
  });

  beforeEach(() => {
    cy.setVegaWallet();
  });

  it('must see the price unit', function () {
    // 7002-SORD-018
    cy.getByTestId(orderPriceField)
      .siblings('label')
      .should('have.text', 'Price (DAI)');
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
    // 7002-SORD-059
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
      // 7002-SORD-023
      // 7002-SORD-024
      // 7002-SORD-025
      // 7002-SORD-026
      // 7002-SORD-027
      // 7002-SORD-028

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
    cy.setVegaWallet();
    cy.mockTradingPage();
    cy.visit('/#/markets/market-0');
    cy.wait('@Markets');
    cy.getByTestId(toggleMarket).click();
  });

  beforeEach(() => {
    cy.setVegaWallet();
  });

  it('must not see the price unit', function () {
    // 7002-SORD-019
    cy.getByTestId(orderPriceField).should('not.exist');
  });

  describe('time in force validations', function () {
    const validTIF = TIFlist.filter((tif) => ['FOK', 'IOC'].includes(tif.code));
    const invalidTIF = TIFlist.filter(
      (tif) => !['FOK', 'IOC'].includes(tif.code)
    );

    validTIF.forEach((tif) => {
      // 7002-SORD-025
      // 7002-SORD-026

      it(`must be able to select ${tif.code}`, function () {
        cy.getByTestId(orderTIFDropDown).select(tif.value);
        cy.get(`[data-testid=${orderTIFDropDown}] option:selected`).should(
          'have.text',
          tif.text
        );
      });
    });

    invalidTIF.forEach((tif) => {
      // 7002-SORD-023
      // 7002-SORD-024
      // 7002-SORD-027
      // 7002-SORD-028
      it(`must not be able to select ${tif.code}`, function () {
        cy.getByTestId(orderTIFDropDown).should('not.contain', tif.text);
      });
    });
  });
});

describe('post and reduce order validations', { tags: '@smoke' }, () => {
  before(() => {
    cy.setVegaWallet();
    cy.mockTradingPage();
    cy.visit('/#/markets/market-0');
    cy.wait('@Markets');
    cy.getByTestId(toggleMarket).click();
  });

  beforeEach(() => {
    cy.setVegaWallet();
  });

  const validTIF = TIFlist.filter((tif) => ['FOK', 'IOC'].includes(tif.code));

  validTIF.forEach((tif) => {
    // 7002-SORD-025
    // 7002-SORD-026

    it(`post and reduce order market for ${tif.code}`, function () {
      cy.getByTestId(orderTIFDropDown).select(tif.value);
      cy.get(`[data-testid=${orderTIFDropDown}] option:selected`).should(
        'have.text',
        tif.text
      );
      cy.getByTestId('post-only').should('be.disabled');
      cy.getByTestId('reduce-only').should('be.enabled');
    });
  });

  validTIF.forEach((tif) => {
    it(`post and reduce order limit for ${tif.code}`, function () {
      cy.getByTestId(toggleLimit).click();
      cy.getByTestId(orderTIFDropDown).select(tif.value);
      cy.get(`[data-testid=${orderTIFDropDown}] option:selected`).should(
        'have.text',
        tif.text
      );
      cy.getByTestId('post-only').should('be.disabled');
      cy.getByTestId('reduce-only').should('be.enabled');
    });
  });

  const validTIFLimit = TIFlist.filter((tif) =>
    ['GFA', 'GFN', 'GTC', 'GTT'].includes(tif.code)
  );

  validTIFLimit.forEach((tif) => {
    it(`post and reduce order for limit ${tif.code}`, function () {
      cy.getByTestId(toggleLimit).click();
      cy.getByTestId(orderTIFDropDown).select(tif.value);
      cy.get(`[data-testid=${orderTIFDropDown}] option:selected`).should(
        'have.text',
        tif.text
      );
      cy.getByTestId('post-only').should('be.enabled');
      cy.getByTestId('reduce-only').should('be.disabled');
    });
  });
});
