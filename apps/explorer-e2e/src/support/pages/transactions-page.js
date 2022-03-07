import BasePage from './base-page';

export default class TransactionsPage extends BasePage {
  blockRow = 'block-row';
  blockHeight = 'block-height';
  numberOfTransactions = 'num-txs';
  validatorLink = 'validator-link';
  blockTime = 'block-time';
  refreshBtn = 'refresh';

  validateTransactionsPagedisplayed() {
    cy.getByTestId(this.blockRow).should('have.length.above', 1);
    cy.getByTestId(this.blockHeight).first().should('not.be.empty');
    cy.getByTestId(this.numberOfTransactions).first().should('not.be.empty');
    cy.getByTestId(this.validatorLink).first().should('not.be.empty');
    cy.getByTestId(this.blockTime).first().should('not.be.empty');
  }

  validateRefreshBtn() {
    cy.getByTestId(this.blockHeight)
      .first()
      .invoke('text')
      .then((blockHeightTxt) => {
        cy.getByTestId(this.refreshBtn).click();

        cy.getByTestId(this.blockHeight)
          .first()
          .invoke('text')
          .should((newBlockHeightText) => {
            expect(blockHeightTxt).not.to.eq(newBlockHeightText);
          });
      });
    cy.getByTestId(this.blockTime).first();
  }
}
