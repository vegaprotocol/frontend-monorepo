import '../support/common.functions';
import blocksLocators from '../locators/blocks.locators';
import navigationLocators from '../locators/navigation.locators';

context('Blocks page', function () {
  before('visit token home page', function () {
    cy.visit('/');
  });

  describe('Verify elements on page', function () {
    beforeEach('navigate to blocks page', function () {
      cy.get(navigationLocators.blocks).click();
    });

    it('Blocks page is displayed', function () {
      validateBlocksDisplayed();
    });

    it('Blocks page is displayed on mobile', function () {
      cy.common_switch_to_mobile_and_click_toggle();
      cy.get(navigationLocators.blocks).click();
      validateBlocksDisplayed();
    });

    it('Block validator page is displayed', function () {
      waitForBlocksResponse();
      cy.get(blocksLocators.blockHeight).first().click();
      cy.get(blocksLocators.minedByValidator).should('not.be.empty');
      cy.get(blocksLocators.blockTime).should('not.be.empty');
      //TODO: Add assertion for transactions when txs are added
    });

    it('Navigate to previous block', function () {
      cy.get(blocksLocators.blockHeight).first().click();
      cy.get(blocksLocators.blockHeader)
        .invoke('text')
        .then(($blockHeaderTxt) => {
          const blockHeight = parseInt($blockHeaderTxt.replace('BLOCK ', ''));
          cy.get(blocksLocators.previousBlockBtn).click();
          cy.get(blocksLocators.blockHeader)
            .invoke('text')
            .then(($newBlockHeaderTxt) => {
              const newBlockHeight = parseInt(
                $newBlockHeaderTxt.replace('BLOCK ', '')
              );
              expect(newBlockHeight).to.be.lessThan(blockHeight);
            });
        });
    });

    it('Previous button disabled on first block', function () {
      cy.get(blocksLocators.jumpToBlockInput).type('1');
      cy.get(blocksLocators.jumpToBlockSubmit).click();
      cy.get(blocksLocators.previousBlockBtn)
        .find('button')
        .should('be.disabled');
      cy.get(blocksLocators.blockHeader)
        .invoke('text')
        .then(($blockHeaderTxt) => {
          const blockHeight = parseInt($blockHeaderTxt.replace('BLOCK ', ''));
          cy.get(blocksLocators.nextBlockBtn).click();
          cy.get(blocksLocators.blockHeader)
            .invoke('text')
            .then(($newBlockHeaderTxt) => {
              const newBlockHeight = parseInt(
                $newBlockHeaderTxt.replace('BLOCK ', '')
              );
              expect(newBlockHeight).to.be.greaterThan(blockHeight);
            });
        });
    });

    it('Infinite scroll shows at least 100 new blocks', function () {
      const expectedBlocks = 100;
      const scrollAttempts = 7;

      waitForBlocksResponse();
      cy.get(blocksLocators.infiniteScrollWrapper)
        .children()
        .scrollTo('bottom');

      cy.intercept('*blockchain?maxHeight*').as('blockchain_load');
      cy.get(blocksLocators.blockHeight)
        .last()
        .invoke('text')
        .then(($initialLastBlockHeight) => {
          for (let index = 0; index < scrollAttempts; index++) {
            cy.get(blocksLocators.infiniteScrollWrapper)
              .children()
              .children()
              .invoke('css', 'height')
              .then((scrollTarget) => {
                cy.get(blocksLocators.infiniteScrollWrapper)
                  .children()
                  .scrollTo(0, scrollTarget.toString(), { easing: 'linear' })
                  .wait('@blockchain_load');

                // eslint-disable-next-line cypress/no-unnecessary-waiting
                cy.wait(50); // Need this as although network response has arrived it takes a few millisecs for the css height to expand
              });
          }

          cy.get(blocksLocators.blockHeight)
            .last()
            .invoke('text')
            .then(($lastBlockHeight) => {
              const totalBlocksLoadedSinceScrollBegan =
                parseInt($initialLastBlockHeight) - parseInt($lastBlockHeight);
              expect(totalBlocksLoadedSinceScrollBegan).to.be.at.least(
                expectedBlocks
              );
            });
        });
    });

    function waitForBlocksResponse() {
      cy.contains('Loading...').should('not.exist', { timeout: 18000 });
    }

    function validateBlocksDisplayed() {
      waitForBlocksResponse();
      cy.get(blocksLocators.blockRow).should('have.length.above', 1);
      cy.get(blocksLocators.blockHeight).first().should('not.be.empty');
      cy.get(blocksLocators.numberOfTransactions)
        .first()
        .should('not.be.empty');
      cy.get(blocksLocators.validatorLink).first().should('not.be.empty');
      cy.get(blocksLocators.blockTime).first().should('not.be.empty');
    }
  });
});
