//Tests set to skip until transactions are generated after capsule start up
context.skip('Transactions page', function () {
  before('visit token home page', function () {
    cy.visit('/');
  });

  describe('Verify elements on page', { tags: '@regression' }, function () {
    const transactionNavigation = 'a[href="/txs"]';
    const transactionRow = 'transaction-row';
    const txHash = 'hash';

    beforeEach('Navigate to transactions page', function () {
      cy.get(transactionNavigation).click();
    });

    it('transactions are displayed', function () {
      cy.get(transactionRow).should('have.length.above', 1);
    });

    it('transactions details page is displayed', function () {
      clickTopTransaction();
      validateTxDetailsAreDisplayed();
    });

    it('transactions details page is displayed in mobile', function () {
      cy.common_switch_to_mobile_and_click_toggle();
      cy.get(transactionNavigation).click();
      clickTopTransaction();
      validateTxDetailsAreDisplayed();
    });

    function clickTopTransaction() {
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000); // Wait for transactions to load if there are any
      cy.get('body').then(($body) => {
        if ($body.find(transactionRow).length) {
          cy.get(transactionRow)
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
        if ($body.find(txHash).length) {
          cy.get(txHash).invoke('text').should('have.length', 64);
          cy.get('submitted-by')
            .find('a')
            .then(($address) => {
              cy.wrap($address).should('have.attr', 'href');
              cy.wrap($address).invoke('text').should('have.length', 66);
            });
          cy.get('block').should('not.be.empty');
          cy.get('encoded-tnx').should('not.be.empty');
          cy.get('tx-type')
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
