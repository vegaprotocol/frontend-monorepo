import {
  TIFlist,
  orderTIFDropDown,
  toggleLimit,
  toggleMarket,
} from '../support/deal-ticket';

const tooltipContent = 'tooltip-content';
const reduceOnly = 'reduce-only';
const postOnly = 'post-only';

describe('time in force validation', { tags: '@smoke' }, () => {
  before(() => {
    cy.setVegaWallet();
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.clearAllLocalStorage();
    cy.setOnBoardingViewed();
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

  describe('limit order', () => {
    before(() => {
      cy.getByTestId(toggleLimit).click();
    });
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
  });

  describe('market order', () => {
    before(() => {
      cy.getByTestId(toggleMarket).click();
    });

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

  describe('post and reduce - market order', () => {
    before(() => {
      cy.getByTestId(toggleMarket).click();
    });

    const validTIF = TIFlist.filter((tif) => ['FOK', 'IOC'].includes(tif.code));

    validTIF.forEach((tif) => {
      // 7002-SORD-025
      // 7002-SORD-026

      it(`post and reduce order market for ${tif.code}`, function () {
        // 7003-SORD-054
        // 7003-SORD-055
        // 7003-SORD-056
        // 7003-SORD-057

        cy.getByTestId(orderTIFDropDown).select(tif.value);
        cy.get(`[data-testid=${orderTIFDropDown}] option:selected`).should(
          'have.text',
          tif.text
        );
        cy.getByTestId(postOnly).should('be.disabled');
        cy.getByTestId(reduceOnly).should('be.enabled');
      });
    });
  });

  describe('post and reduce - limit order', () => {
    before(() => {
      cy.getByTestId(toggleLimit).click();
    });

    const validTIFLimit = TIFlist.filter((tif) =>
      ['GFA', 'GFN', 'GTC', 'GTT'].includes(tif.code)
    );

    validTIFLimit.forEach((tif) => {
      it(`post and reduce order for limit ${tif.code}`, function () {
        // 7003-SORD-054
        // 7003-SORD-055
        // 7003-SORD-056
        // 7003-SORD-057
        cy.getByTestId(orderTIFDropDown).select(tif.value);
        cy.get(`[data-testid=${orderTIFDropDown}] option:selected`).should(
          'have.text',
          tif.text
        );
        cy.getByTestId(postOnly).should('be.enabled');
        cy.getByTestId(reduceOnly).should('be.disabled');
      });
    });
    it(`can see explanation of what post only and reduce only is/does`, function () {
      // 7003-SORD-058
      cy.get('[for="post-only"]').should('have.text', 'Post only').realHover();
      cy.getByTestId(tooltipContent).should(
        'contain.text',
        `"Post only" will ensure the order is not filled immediately but is placed on the order book as a passive order. When the order is processed it is either stopped (if it would not be filled immediately), or placed in the order book as a passive order until the price taker matches with it.`
      );
      cy.get('[for="reduce-only"]')
        .should('have.text', 'Reduce only')
        .realHover();
      cy.getByTestId(tooltipContent).should(
        'contain.text',
        `"Reduce only" can be used only with non-persistent orders, such as "Fill or Kill" or "Immediate or Cancel".`
      );
    });
  });
});
