import navigationLocators from '../locators/navigation.locators';
import transactionsLocators from '../locators/transactions.locators';

//Tests set to skip until transactions are generated after capsule start up
context.skip('Transactions page - verify elements on page', function () {
  before('visit token home page', function () {
    cy.visit('/');
  });

  describe('Transactions page', function () {
    beforeEach('Navigate to transactions page', function () {
      cy.get(navigationLocators.transactions).click();
    });

    it('transactions are displayed', function () {
      cy.get(transactionsLocators.transactionRow).should(
        'have.length.above',
        1
      );
    });

    it('transactions details page is displayed', function () {
      clickTopTransaction();
      validateTxDetailsAreDisplayed();
    });

    it('transactions details page is displayed in mobile', function () {
      cy.common_switch_to_mobile_and_click_toggle();
      cy.get(navigationLocators.transactions).click();
      clickTopTransaction();
      validateTxDetailsAreDisplayed();
    });

    function clickTopTransaction() {
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000); // Wait for transactions to load if there are any
      cy.get('body').then(($body) => {
        if ($body.find(transactionsLocators.transactionRow).length) {
          cy.get(transactionsLocators.transactionRow)
            .first()
            .find('a')
            .first()
            .click({ force: true });
        } else {
          cy.slack('Unable to find any transactions on page');
          cy.screenshot();
        }
      });
    }

    function validateTxDetailsAreDisplayed() {
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000); // Wait for transactions to load if there are any
      cy.get('body').then(($body) => {
        if ($body.find(transactionsLocators.txHash).length) {
          cy.get(transactionsLocators.txHash)
            .invoke('text')
            .should('have.length', 64);
          cy.get(transactionsLocators.txSubmittedBy)
            .find('a')
            .then(($address) => {
              cy.wrap($address).should('have.attr', 'href');
              cy.wrap($address).invoke('text').should('have.length', 66);
            });
          cy.get(transactionsLocators.txBlock).should('not.be.empty');
          cy.get(transactionsLocators.txEncodedTnx).should('not.be.empty');
          cy.get(transactionsLocators.txType)
            .should('not.be.empty')
            .invoke('text')
            .then((txTypeTxt) => {
              if (txTypeTxt == 'Order Submission') {
                cy.get('.hljs-attr')
                  .should('have.length.at.least', 8)
                  .each(($propertyName) => {
                    cy.wrap($propertyName).should('not.be.empty');
                  });
                cy.get('.hljs-string')
                  .should('have.length.at.least', 8)
                  .each(($propertyValue) => {
                    cy.wrap($propertyValue).should('not.be.empty');
                  });
              }
            });
        } else {
          cy.slack('Unable to find any transactions on page');
          cy.screenshot();
        }
      });
    }
  });
});
