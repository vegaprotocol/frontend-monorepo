import '../support/common.functions';

context('Blocks page', function () {
  before('visit token home page', function () {
    cy.visit('/');
  });

  describe('Verify elements on page', function () {
    const blockNavigation = 'a[href="/blocks"]';
    const blockHeight = '[data-testid="block-height"]';
    const blockTime = '[data-testid="block-time"]';
    const blockHeader = '[data-testid="block-header"]';
    const previousBlockBtn = '[data-testid="previous-block"]';
    const infiniteScrollWrapper = '[data-testid="infinite-scroll-wrapper"]';

    beforeEach('navigate to blocks page', function () {
      cy.get(blockNavigation).click();
    });

    it('Blocks page is displayed', function () {
      validateBlocksDisplayed();
    });

    it('Blocks page is displayed on mobile', function () {
      cy.common_switch_to_mobile_and_click_toggle();
      cy.get(blockNavigation).click();
      validateBlocksDisplayed();
    });

    it('Block validator page is displayed', function () {
      waitForBlocksResponse();
      cy.get(blockHeight).eq(0).click();
      cy.get('[data-testid="block-validator"]').should('not.be.empty');
      cy.get(blockTime).should('not.be.empty');
      //TODO: Add assertion for transactions when txs are added
    });

    it('Navigate to previous block', function () {
      waitForBlocksResponse();
      cy.get(blockHeight).eq(0).click();
      cy.get(blockHeader)
        .invoke('text')
        .then(($blockHeaderTxt) => {
          const blockHeight = parseInt($blockHeaderTxt.replace('BLOCK ', ''));
          cy.get(previousBlockBtn).click();
          cy.get(blockHeader)
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
      cy.get('[data-testid="block-input"]').type('1');
      cy.get('[data-testid="go-submit"]').click();
      cy.get(previousBlockBtn).find('button').should('be.disabled');
      cy.get(blockHeader)
        .invoke('text')
        .then(($blockHeaderTxt) => {
          const blockHeight = parseInt($blockHeaderTxt.replace('BLOCK ', ''));
          cy.get('[data-testid="next-block"]').click();
          cy.get(blockHeader)
            .invoke('text')
            .then(($newBlockHeaderTxt) => {
              const newBlockHeight = parseInt(
                $newBlockHeaderTxt.replace('BLOCK ', '')
              );
              expect(newBlockHeight).to.be.greaterThan(blockHeight);
            });
        });
    });

    // Skipping these tests for time being - since blockchain in capsule is now too small to show historical data - re-enable once addressed
    it.skip('Infinite scroll shows at least 100 new blocks', function () {
      const expectedBlocks = 100;
      const scrollAttempts = 7;

      waitForBlocksResponse();
      cy.get(infiniteScrollWrapper).children().scrollTo('bottom');

      cy.intercept('*blockchain?maxHeight*').as('blockchain_load');
      cy.get(blockHeight)
        .last()
        .invoke('text')
        .then(($initialLastBlockHeight) => {
          for (let index = 0; index < scrollAttempts; index++) {
            cy.get(infiniteScrollWrapper)
              .children()
              .children()
              .invoke('css', 'height')
              .then((scrollTarget) => {
                cy.get(infiniteScrollWrapper)
                  .children()
                  .scrollTo(0, scrollTarget.toString(), { easing: 'linear' })
                  .wait('@blockchain_load');

                // eslint-disable-next-line cypress/no-unnecessary-waiting
                cy.wait(50); // Need this as although network response has arrived it takes a few millisecs for the css height to expand
              });
          }

          cy.get(blockHeight)
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
      cy.get('[data-testid="block-row"]').should('have.length.above', 1);
      cy.get(blockHeight).first().should('not.be.empty');
      cy.get('[data-testid="num-txs"]').first().should('not.be.empty');
      cy.get('[data-testid="validator-link"]').first().should('not.be.empty');
      cy.get(blockTime).first().should('not.be.empty');
    }
  });
});
