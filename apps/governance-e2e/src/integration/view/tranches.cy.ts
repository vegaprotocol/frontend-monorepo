import { trancheData } from '../../fixtures/mocks/tranches';
import { navigateTo, navigation } from '../../support/common.functions';

const tranches = trancheData;

context(
  'Tranches page - verify elements on the page',
  { tags: '@smoke' },
  function () {
    before('visit homepage', function () {
      cy.intercept('GET', '**/tranches/stats', { tranches });
      cy.visit('/');
    });

    it('Able to navigate to tranches page', function () {
      navigateTo(navigation.supply);
      cy.url().should('include', '/token/tranches');
      cy.get('h1').should('contain.text', 'Vesting tranches');
    });

    // 1005-VEST-001
    // 1005-VEST-002
    it('Able to view tranches', function () {
      /**
       * TODO(@nx/cypress): Nesting Cypress commands in a should assertion now throws.
       * You should use .then() to chain commands instead.
       * More Info: https://docs.cypress.io/guides/references/migration-guide#-should
       **/
      cy.getByTestId('tranche-item')
        .should('have.length', 2)
        .first()
        .within(() => {
          cy.get('a')
            .should('have.text', 'Tranche 2') // 1005-VEST-003
            .and('have.attr', 'href', '/token/tranches/2');
          cy.get('span').eq(1).should('have.text', '111.30'); // 1005-VEST-005
          cy.contains('Unlocking starts') // 1005-VEST-008
            .parent()
            .should('contain.text', '28 Feb 2023');
          cy.contains('Fully unlocked')
            .parent()
            .should('contain.text', '23 Aug 2023');
          cy.getByTestId('progress-bar').should('exist');
          cy.getByTestId('currency-locked') // 1005-VEST-006
            .invoke('text')
            .should('not.be.empty');
          cy.getByTestId('currency-unlocked') // 1005-VEST-007
            .invoke('text')
            .should('not.be.empty');
        });
    });

    it('Able to see individual tranche data', function () {
      cy.get('[href="/token/tranches/2"]').click();
      cy.getByTestId('redeemed-tranche-tokens').within(() => {
        cy.get('span').eq(1).should('have.text', 0);
      });
      cy.getByTestId('key-value-table').within(() => {
        /**
         * TODO(@nx/cypress): Nesting Cypress commands in a should assertion now throws.
         * You should use .then() to chain commands instead.
         * More Info: https://docs.cypress.io/guides/references/migration-guide#-should
         **/
        cy.getByTestId('link')
          .should('have.length', 8)
          .each((ethLink) => {
            cy.wrap(ethLink)
              .should('have.attr', 'href')
              .and('contain', 'https://sepolia.etherscan.io/address/');
          });
        /**
         * TODO(@nx/cypress): Nesting Cypress commands in a should assertion now throws.
         * You should use .then() to chain commands instead.
         * More Info: https://docs.cypress.io/guides/references/migration-guide#-should
         **/
        cy.getByTestId('redeem-link')
          .should('have.length', 8)
          .each((redeemLink) => {
            cy.wrap(redeemLink)
              .should('have.attr', 'href')
              .and('contain', '/token/redeem/');
          });
      });
    });

    it('Able to view tranches with less than 10 vega', function () {
      navigateTo(navigation.supply);
      cy.getByTestId('show-all-tranches').click();
      /**
       * TODO(@nx/cypress): Nesting Cypress commands in a should assertion now throws.
       * You should use .then() to chain commands instead.
       * More Info: https://docs.cypress.io/guides/references/migration-guide#-should
       **/
      cy.getByTestId('tranche-item')
        .should('have.length', 8)
        .first()
        .within(() => {
          cy.get('a')
            .should('have.text', 'Tranche 0')
            .and('have.attr', 'href', '/token/tranches/0');
          cy.get('span').eq(1).should('have.text', '0.00');
          cy.contains('Unlocking starts')
            .parent()
            .should('contain.text', '01 Jan 1970');
          cy.contains('Fully unlocked')
            .parent()
            .should('contain.text', '01 Jan 1970');
          cy.getByTestId('progress-bar').should('exist');
          cy.getByTestId('currency-locked')
            .invoke('text')
            .should('not.be.empty');
          cy.getByTestId('currency-unlocked')
            .invoke('text')
            .should('not.be.empty');
        });
    });
  }
);
