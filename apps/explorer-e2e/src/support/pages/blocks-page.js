/* eslint-disable cypress/no-unnecessary-waiting */
import BasePage from './base-page';

export default class BlocksPage extends BasePage {
  blockRow = 'block-row';
  transactionsRow = 'transaction-row';
  blockHeight = 'block-height';
  numberOfTransactions = 'num-txs';
  validatorLink = 'validator-link';
  blockTime = 'block-time';
  refreshBtn = 'refresh';
  minedByValidator = 'block-validator';

  validateBlocksPageDisplayed() {
    cy.getByTestId(this.blockRow).should('have.length.above', 1);
    cy.getByTestId(this.blockHeight).first().should('not.be.empty');
    cy.getByTestId(this.numberOfTransactions).first().should('not.be.empty');
    cy.getByTestId(this.validatorLink).first().should('not.be.empty');
    cy.getByTestId(this.blockTime).first().should('not.be.empty');
  }

  clickOnTopBlockHeight() {
    cy.getByTestId(this.blockHeight).first().click();
  }

  validateBlockValidatorPage() {
    cy.getByTestId(this.minedByValidator).should('not.be.empty');
    cy.getByTestId(this.blockTime).should('not.be.empty');
    cy.wait(1000);
    cy.get('body').then(($body) => {
      if ($body.find(`[data-testid=${this.transactionsRow}] > td`).length) {
        cy.get(`[data-testid=${this.transactionsRow}] > td`).each(($cell) => {
          cy.wrap($cell).should('not.be.empty');
        });
      } else {
        cy.log('Unable to find any transactions on page');
        cy.screenshot();
      }
    });
  }
}
