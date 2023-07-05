import { waitForSpinner } from '../../support/common.functions';

context('Home Page - verify elements on page', { tags: '@smoke' }, function () {
  before('visit token home page', function () {
    cy.visit('/');
    cy.get('nav', { timeout: 10000 }).should('be.visible');
  });

  describe('Links and buttons', function () {
    it('should have link for proposal page', function () {
      cy.getByTestId('home-proposals').within(() => {
        cy.get('[href="/proposals"]')
          .should('exist')
          .and('have.text', 'Browse, vote, and propose');
      });
    });

    it('should display announcement banner', function () {
      /**
       * TODO(@nx/cypress): Nesting Cypress commands in a should assertion now throws.
       * You should use .then() to chain commands instead.
       * More Info: https://docs.cypress.io/guides/references/migration-guide#-should
       **/
      cy.getByTestId('app-announcement')
        .should('contain.text', 'TEST ANNOUNCEMENT!')
        .within(() => {
          cy.getByTestId('external-link')
            .should('have.attr', 'href', 'https://fairground.wtf')
            .and('have.text', 'CLICK LINK');
        });
      cy.getByTestId('app-announcement-close').should('be.visible').click();
      cy.getByTestId('app-announcement').should('not.exist');
    });

    it('should show open or enacted proposals without proposal summary', function () {
      cy.get('body').then(($body) => {
        if (!$body.find('[data-testid="proposals-list-item"]').length) {
          cy.createMarket();
          cy.reload();
          waitForSpinner();
        }
      });
      /**
       * TODO(@nx/cypress): Nesting Cypress commands in a should assertion now throws.
       * You should use .then() to chain commands instead.
       * More Info: https://docs.cypress.io/guides/references/migration-guide#-should
       **/
      cy.getByTestId('proposals-list-item')
        .should('have.length.at.least', 1)
        .first()
        .within(() => {
          cy.getByTestId('proposal-title')
            .invoke('text')
            .should('not.be.empty');
          cy.getByTestId('proposal-type').invoke('text').should('not.be.empty');
          cy.getByTestId('proposal-status')
            .invoke('text')
            .should('not.be.empty');
          cy.getByTestId('vote-details').invoke('text').should('not.be.empty');
          cy.getByTestId('view-proposal-btn').should('be.visible');
        });
    });

    it('should have external link for governance', function () {
      cy.getByTestId('home-proposals').within(() => {
        cy.getByTestId('external-link')
          .should('have.attr', 'href')
          .and('contain', 'https://vega.xyz/governance');
      });
    });

    it('should have link for validator page', function () {
      cy.getByTestId('home-validators').within(() => {
        cy.get('[href="/validators"]')
          .first()
          .should('exist')
          .and('have.text', 'Browse, and stake');
      });
    });

    it('should have external link for validators', function () {
      cy.getByTestId('home-validators').within(() => {
        cy.getByTestId('external-link')
          .should('have.attr', 'href')
          .and(
            'contain',
            'https://community.vega.xyz/c/mainnet-validator-candidates'
          );
      });
    });

    it('should have information on active nodes', function () {
      cy.getByTestId('node-information')
        .first()
        .should('contain.text', '2')
        .and('contain.text', 'active nodes');
    });

    it('should have information on consensus nodes', function () {
      cy.getByTestId('node-information')
        .last()
        .should('contain.text', '2')
        .and('contain.text', 'consensus nodes');
    });

    it('should contain link to specific validators', function () {
      /**
       * TODO(@nx/cypress): Nesting Cypress commands in a should assertion now throws.
       * You should use .then() to chain commands instead.
       * More Info: https://docs.cypress.io/guides/references/migration-guide#-should
       **/
      cy.getByTestId('validators')
        .should('have.length', '2')
        .each(($validator) => {
          cy.wrap($validator).find('a').should('have.attr', 'href');
        });
    });

    it('should have link for rewards page', function () {
      cy.getByTestId('home-rewards').within(() => {
        cy.get('[href="/rewards"]')
          .first()
          .should('exist')
          .and('have.text', 'See rewards');
      });
    });

    it('should have link for withdrawal page', function () {
      cy.getByTestId('home-vega-token').within(() => {
        cy.get('[href="/token/withdraw"]')
          .first()
          .should('exist')
          .and('have.text', 'Manage tokens');
      });
    });

    it('should display network data', function () {
      /**
       * TODO(@nx/cypress): Nesting Cypress commands in a should assertion now throws.
       * You should use .then() to chain commands instead.
       * More Info: https://docs.cypress.io/guides/references/migration-guide#-should
       **/
      cy.getByTestId('git-network-data')
        .should('contain.text', 'Reading network data from')
        .within(() => {
          cy.get('span')
            .first()
            .should('have.text', 'http://localhost:3008/graphql');
          cy.getByTestId('link').should('exist');
        });
    });

    it('should display eth data', function () {
      /**
       * TODO(@nx/cypress): Nesting Cypress commands in a should assertion now throws.
       * You should use .then() to chain commands instead.
       * More Info: https://docs.cypress.io/guides/references/migration-guide#-should
       **/
      cy.getByTestId('git-eth-data')
        .should('contain.text', 'Reading Ethereum data from')
        .within(() => {
          cy.get('span').should('have.text', 'http://localhost:8545');
        });
    });

    it('should contain link for known issues on Github', function () {
      cy.getByTestId('git-info').within(() => {
        cy.contains('Known issues and feedback on')
          .find('[data-testid="link"]')
          .should(
            'have.attr',
            'href',
            'https://github.com/vegaprotocol/feedback/discussions'
          );
      });
    });
  });

  describe('Mobile view - navigation bar', function () {
    before('Change to mobile resolution', function () {
      cy.viewport('iphone-xr');
    });

    it('should have burger button', () => {
      cy.getByTestId('button-menu-drawer').should('be.visible').click();
      cy.getByTestId('menu-drawer').should('be.visible');
    });

    it.skip('should have link for proposal page', function () {
      cy.getByTestId('menu-drawer').within(() => {
        cy.get('[href="/proposals"]')
          .should('exist')
          .and('have.text', 'Proposals');
      });
    });
    it('should have link for validator page', function () {
      cy.getByTestId('menu-drawer').within(() => {
        cy.get('[href="/validators"]')
          .first()
          .should('exist')
          .and('have.text', 'Validators');
      });
    });

    it('should have link for rewards page', function () {
      cy.getByTestId('menu-drawer').within(() => {
        cy.get('[href="/rewards"]')
          .first()
          .should('exist')
          .and('have.text', 'Rewards');
      });
    });
    it('should have link for withdrawal page', function () {
      cy.getByTestId('menu-drawer').within(() => {
        cy.get('[href="/token/withdraw"]')
          .first()
          .should('exist')
          .and('have.text', 'Withdraw');
      });
    });

    after(function () {
      cy.viewport(
        Cypress.config('viewportWidth'),
        Cypress.config('viewportHeight')
      );
    });
  });
});
