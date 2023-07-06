import { mockConnectWallet } from '@vegaprotocol/cypress';

describe('Navbar', { tags: '@smoke' }, () => {
  beforeEach(() => {
    cy.clearAllLocalStorage();
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.visit('/');
    cy.wait('@Markets');
    cy.wait('@MarketsData');
  });

  const pages = [
    { name: 'Markets', link: '#/markets/all' },
    { name: 'Trading', link: '#/markets' },
    { name: 'Portfolio', link: '#/portfolio' },
  ];

  describe('desktop view', () => {
    pages.forEach(({ name, link }) => {
      it(`${name} should be correctly rendered`, () => {
        cy.get('nav')
          .find(`a[data-testid=${name}]:visible`)
          .then((element) => {
            cy.wrap(element).click();
            cy.location('hash').should('contain', link);
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

    it('Disclaimer should be presented after choosing from menu', () => {
      cy.get('nav')
        .find('ul li:contains(Resources)')
        .contains('Resources')
        .click();
      cy.getByTestId('Disclaimer').eq(0).click();
      cy.location('hash').should('equal', '#/disclaimer');
      cy.get('p').contains(
        'Vega is a decentralised peer-to-peer protocol that can be used to trade derivatives with cryptoassets.'
      );
    });
  });

  describe('mobile view', () => {
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
      pages.forEach(({ name, link }) => {
        it(`${name} should be correctly rendered`, () => {
          cy.getByTestId('button-menu-drawer').click();
          cy.getByTestId('menu-drawer').should('be.visible');
          cy.getByTestId('menu-drawer').within((el) => {
            cy.wrap(el).getByTestId(name).click();
            cy.location('hash').should('contain', link);
          });
        });
      });

      it('Menu drawer should not be visible until opened', () => {
        cy.getByTestId('menu-drawer').should('not.be.visible');
        cy.getByTestId('button-menu-drawer').click();
        cy.getByTestId('menu-drawer').should('be.visible');
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
});
