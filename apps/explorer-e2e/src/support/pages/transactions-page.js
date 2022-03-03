import BasePage from './base-page';

export default class TransactionsPage extends BasePage {
  unconfirmedTransactions = 'unconfirmed-txs';

  validateUnconfirmedTxsNumDisplayed() {
    cy.getByTestId(this.unconfirmedTransactions)
      .should('contain.text', 'Number: ')
      .and('have.length.above', 8);
  }
}
