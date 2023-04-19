import { mockConnectWallet } from '@vegaprotocol/cypress';

beforeEach(() => {
  cy.mockTradingPage();
  cy.mockSubscription();
  cy.visit('/');
  cy.wait('@Markets');
  cy.wait('@MarketsData');
  cy.wait('@MarketsCandles');
  cy.getByTestId('dialog-close').click();
});

describe('Desktop view', { tags: '@smoke' }, () => {
  describe('Navbar', () => {
    const links = ['Markets', 'Trading', 'Portfolio'];
    const hashes = ['#/markets/all', '#/markets/market-1', '#/portfolio'];

    links.forEach((link, index) => {
      it(`${link} should be correctly rendered`, () => {
        cy.get('nav')
          .find(`a[data-testid=${link}]:visible`)
          .then((element) => {
            cy.wrap(element).click();
            cy.location('hash').should('equal', hashes[index]);
          });
      });
    });

    it('Resources dropdown should be correctly rendered', () => {
      const resourceSelector = 'ul li:contains(Resources)';
      ['Docs', 'Give Feedback'].forEach((text, index) => {
        cy.get('nav').find(resourceSelector).contains('Resources').click();
        cy.get('nav')
          .find(resourceSelector)
          .find('.navigation-content li')
          .eq(index)
          .find('a')
          .then((element) => {
            expect(element.attr('target')).to.eq('_blank');
            expect(element.attr('href')).to.not.be.empty;
            expect(element.text()).to.eq(text);
          });
      });
    });
  });
});

describe('Mobile view', { tags: '@smoke' }, () => {
  const viewportHeight = Cypress.config('viewportHeight');
  const viewportWidth = Cypress.config('viewportWidth');
  before(() => {
    // a little hack to keep the viewport size between tests (cypress bug)
    Cypress.config({
      viewportWidth: 560,
      viewportHeight: 890,
    });
    cy.viewport(560, 890);
  });

  describe('wallet drawer', () => {
    it('wallet drawer should be correctly rendered', () => {
      mockConnectWallet();
      cy.connectVegaWallet(true);
      cy.getByTestId('connect-vega-wallet-mobile').click();
      cy.getByTestId('wallets-drawer').should('be.visible');
      cy.getByTestId('wallets-drawer').within((el) => {
        cy.wrap(el).get('button').contains('Disconnect').click();
      });
      cy.getByTestId('wallets-drawer').should('not.be.visible');
    });
  });

  describe('menu drawer', () => {
    it('Markets should be correctly rendered', () => {
      cy.getByTestId('button-menu-drawer').click();
      cy.getByTestId('menu-drawer').should('be.visible');
      cy.getByTestId('menu-drawer').within((el) => {
        cy.wrap(el).getByTestId('Markets').click();
        cy.location('hash').should('equal', '#/markets/all');
      });
    });
    it('Trading should be correctly rendered', () => {
      cy.getByTestId('button-menu-drawer').click();
      cy.getByTestId('menu-drawer').within((el) => {
        cy.wrap(el).getByTestId('Trading').click();
        cy.location('hash').should('equal', '#/markets/market-1');
      });
    });
    it('Portfolio should be correctly rendered', () => {
      cy.getByTestId('button-menu-drawer').click();
      cy.getByTestId('menu-drawer').within((el) => {
        cy.wrap(el).getByTestId('Portfolio').click();
        cy.location('hash').should('equal', '#/portfolio');
      });
    });

    it('Menu drawer should not be visible until opened', () => {
      cy.getByTestId('menu-drawer').should('not.be.visible');
      cy.getByTestId('button-menu-drawer').click();
      cy.getByTestId('menu-drawer').should('be.visible');
      cy.getByTestId('menu-drawer')
        .find('[data-testid="theme-switcher"]')
        .should('be.visible');
      cy.getByTestId('button-menu-drawer').click();
      cy.getByTestId('menu-drawer').should('not.be.visible');
    });
  });
  after(() => {
    // a little hack to keep the viewport size between tests (cypress bug)
    Cypress.config({
      viewportWidth,
      viewportHeight,
    });
  });
});
