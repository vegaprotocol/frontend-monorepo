import { mockConnectWallet } from '@vegaprotocol/cypress';

before(() => {
  cy.mockTradingPage();
  cy.mockSubscription();
  cy.visit('/');
  cy.wait('@Markets');
  cy.wait('@MarketsData');
  cy.getByTestId('dialog-close').click();
});

describe('Desktop view', { tags: '@smoke' }, () => {
  describe('Navbar', () => {
    const links = ['Markets', 'Trading', 'Portfolio'];
    const hashes = ['#/markets/all', '#/markets/market-1', '#/portfolio'];

    links.forEach((link, index) => {
      it(`${link} should be correctly rendered`, () => {
        cy.getByTestId('navbar')
          .find(`[data-testid="navbar-links"] a[data-testid=${link}]`)
          .then((element) => {
            cy.contains('Loading...').should('not.exist');
            cy.wrap(element).click();
            cy.wrap(element)
              .get('span.absolute.md\\:h-1.w-full')
              .should('exist');
            cy.location('hash').should('equal', hashes[index]);
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
