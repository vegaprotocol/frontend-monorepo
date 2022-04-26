import BasePage from './base-page';

export default class BlocksPage extends BasePage {
  blockRow = 'block-row';
  transactionsRow = 'transaction-row';
  blockHeight = 'block-height';
  numberOfTransactions = 'num-txs';
  validatorLink = 'validator-link';
  blockTime = 'block-time';
  refreshBtn = 'refresh';
  blockHeader = 'block-header';
  minedByValidator = 'block-validator';
  previousBlockBtn = 'previous-block';
  nextBlockBtn = 'next-block';
  jumpToBlockInput = 'block-input';
  jumpToBlockSubmit = 'go-submit';

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
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000); // Wait for transactions to load if there are any
    cy.get('body').then(($body) => {
      if ($body.find(`[data-testid=${this.transactionsRow}] > td`).length) {
        cy.get(`[data-testid=${this.transactionsRow}] > td`).each(($cell) => {
          cy.wrap($cell).should('not.be.empty');
        });
      } else {
        cy.slack('Unable to find any transactions on page');
        cy.screenshot();
      }
    });
  }

  navigateToPreviousBlock() {
    cy.getByTestId(this.blockHeader)
      .invoke('text')
      .then(($blockHeaderTxt) => {
        const blockHeight = parseInt($blockHeaderTxt.replace('BLOCK ', ''));
        this.clickPreviousBlock();
        cy.getByTestId(this.blockHeader)
          .invoke('text')
          .then(($newBlockHeaderTxt) => {
            const newBlockHeight = parseInt(
              $newBlockHeaderTxt.replace('BLOCK ', '')
            );
            expect(newBlockHeight).to.be.lessThan(blockHeight);
          });
      });
  }

  navigateToNextBlock() {
    cy.getByTestId(this.blockHeader)
      .invoke('text')
      .then(($blockHeaderTxt) => {
        const blockHeight = parseInt($blockHeaderTxt.replace('BLOCK ', ''));
        this.clickNextBlock();
        cy.getByTestId(this.blockHeader)
          .invoke('text')
          .then(($newBlockHeaderTxt) => {
            const newBlockHeight = parseInt(
              $newBlockHeaderTxt.replace('BLOCK ', '')
            );
            expect(newBlockHeight).to.be.greaterThan(blockHeight);
          });
      });
  }

  clickPreviousBlock() {
    cy.getByTestId(this.previousBlockBtn).click();
  }

  clickNextBlock() {
    cy.getByTestId(this.nextBlockBtn).click();
  }

  jumpToBlock(blockNumber: string) {
    cy.getByTestId(this.jumpToBlockInput).type(blockNumber);
    cy.getByTestId(this.jumpToBlockSubmit).click();
  }

  verifyPreviousBtnDisabled() {
    cy.getByTestId(this.previousBlockBtn).find('button').should('be.disabled');
  }
}
