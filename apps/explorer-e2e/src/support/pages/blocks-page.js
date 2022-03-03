import BasePage from './base-page';

export default class BlocksPage extends BasePage {
  blocksFrmHeader = 'blocks-frm-header';
  blocksStreamedHeader = 'blocks-streamed-header';
  blockHeight = 'block-height';
  blockchainBlocks = 'blockchain-blocks';
  streamedBlocks = 'streamed-blocks';

  validateBlocksPageDisplayed() {
    cy.getByTestId(this.blocksFrmHeader).should(
      'have.text',
      'Blocks from blockchain'
    );
    cy.getByTestId(this.blocksStreamedHeader).should(
      'have.text',
      'Blocks streamed in'
    );
    cy.getByTestId(this.blockHeight)
      .should('contain.text', 'Height: ')
      .and('have.length.greaterThan', 10);
    cy.getByTestId(this.blockchainBlocks).should('not.be.empty');
    cy.getByTestId(this.streamedBlocks).should('not.be.empty');
  }
}
