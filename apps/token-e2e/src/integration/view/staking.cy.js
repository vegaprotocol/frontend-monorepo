const guideLink = '[data-testid="staking-guide-link"]';
const validators = '[data-testid="validators-grid"]';
const validatorTitle = '[data-testid="validator-node-title"]';
const validatorId = '[data-testid="validator-id"]';
const validatorPubKey = '[data-testid="validator-public-key"]';
const ethAddressLink = '[data-testid="link"]';
const totalStake = '[data-testid="total-stake"]'
const pendingStake = '[data-testid="pending-stake"]'
const stakedByOperator = '[data-testid="staked-by-operator"]'
const stakedByDelegates = '[data-testid="staked-by-delegates"]'
const stakeShare = '[data-testid="stakedByDelegates"]'
const epochCountDown = '[data-testid="epoch-countdown"]';
const stakeNumberRegex = /^\d*\.?\d*$/

context('Staking Page - verify elements on page', function () {
  before('navigate to staking page', function () {
    cy.visit('/').navigate_to('staking');
  });

  describe('with wallets disconnected', function () {
    describe('description section', function () {
      it('should have staking tab highlighted', function () {
        cy.verify_tab_highlighted('staking');
      });

      it('should have STAKING ON VEGA header visible', function () {
        cy.verify_page_header('Staking');
      });

      it('should have Staking Guide link visible', function () {
        // 0000-STAK-0003
        cy.get(guideLink)
          .should('be.visible')
          .and('have.text', 'Read more about staking on Vega')
          .and(
            'have.attr',
            'href',
            'https://docs.vega.xyz/docs/mainnet/concepts/vega-chain/#staking-on-vega'
          );
      });
    });

    describe('validators section', function () {
      // 1002-STAK-0050
      it('should be visible', function () {
        cy.get(validators).should('be.visible');
      });
    });
  });
  describe('With wallets connected', function () {
    before('connect wallets', function () {
      cy.vega_wallet_import();
      cy.vega_wallet_connect();
    });

    it('Should be able to see static information about a validator', function () { // 1002-STAK-0050
      cy.get('[col-id="validator"]').first.click()
      cy.get(validatorTitle).should('not.be.empty'); // 1002-STAK-0005
      cy.get(validatorId).should('not.be.empty'); // 1002-STAK-0007
      cy.get(validatorPubKey).should('not.be.empty'); // 1002-STAK-0008
      // TODO validators missing url for more information about them 1002-STAK-0009
      cy.get(ethAddressLink).should('not.be.empty').and('have.attr', 'href') // 1002-STAK-0010
      cy.get(totalStake).should('match', stakeNumberRegex) // 1002-STAK-0012
      cy.get(pendingStake).should('match', stakeNumberRegex)
      cy.get(stakedByOperator).should('match', stakeNumberRegex)
      cy.get(stakedByDelegates).should('match', stakeNumberRegex)
      cy.get(stakeShare).invoke('text').then(($stakePercentage) => {
        if ($stakePercentage != '-') {
          cy.wrap($stakePercentage).should('match', /\b(?<!\.)(?!0+(?:\.0+)?%)(?:\d|[1-9]\d|100)(?:(?<!100)\.\d+)?%/)
        }
      })
    });

    it('should be able to see epoch information', function () {
      const epochTitle = 'h3'
      const nextEpochInfo = 'p'

      cy.get(epochCountDown).within(() => {
        cy.get(epochTitle).should('not.be.empty');
        cy.get(nextEpochInfo).should('contain.text', 'epoch') // 1002-STAK-0011
      })
    })
  });
});
