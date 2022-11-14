/// <reference types="cypress" />
const guideLink = '[data-testid="staking-guide-link"]';
const validatorTitle = '[data-testid="validator-node-title"]';
const validatorId = '[data-testid="validator-id"]';
const validatorPubKey = '[data-testid="validator-public-key"]';
const ethAddressLink = '[data-testid="link"]';
const totalStake = '[data-testid="total-stake"]';
const pendingStake = '[data-testid="pending-stake"]';
const stakedByOperator = '[data-testid="staked-by-operator"]';
const stakedByDelegates = '[data-testid="staked-by-delegates"]';
const stakeShare = '[data-testid="stake-percentage"]';
const epochCountDown = '[data-testid="epoch-countdown"]';
const stakeNumberRegex = /^\d*\.?\d*$/;
const ownStake = '[data-testid="own-stake"]';
const nominatedStake = '[data-testid="nominated-stake"]';

context('Staking Page - verify elements on page', function () {
  before('navigate to staking page', function () {
    cy.visit('/').navigate_to('staking');
  });

  describe('with wallets disconnected', { tags: '@smoke' }, function () {
    describe('description section', function () {
      it('Should have staking tab highlighted', function () {
        cy.verify_tab_highlighted('staking');
      });

      it('Should have STAKING ON VEGA header visible', function () {
        cy.verify_page_header('Staking');
      });

      it('Should have Staking Guide link visible', function () {
        // 2001-STKE-003
        cy.get(guideLink)
          .should('be.visible')
          .and('have.text', 'Read more about staking on Vega')
          .and(
            'have.attr',
            'href',
            'https://docs.vega.xyz/mainnet/concepts/vega-chain/#staking-on-vega'
          );
      });
    });
  });

  describe(
    'Should be able to see validator list from the staking page',
    { tags: '@regression' },
    function () {
      // 2001-STKE-050
      it('Should be able to see validator names', function () {
        cy.get('[col-id="validator"]')
          .should('have.length.at.least', 1)
          .each(($name) => {
            cy.wrap($name).should('not.be.empty');
          });
      });

      it('Should be able to see validator status', function () {
        cy.get('[col-id="status"]')
          .should('have.length.at.least', 1)
          .each(($status) => {
            cy.wrap($status).should('not.be.empty');
          });
      });

      it('Should be able to see total stake for this epoch', function () {
        cy.get('[col-id="totalStakeThisEpoch"]')
          .should('have.length.at.least', 1)
          .each(($totalStaked) => {
            cy.wrap($totalStaked).should('not.be.empty');
          });
      });

      it('Should be able to see validator staked for this epoch', function () {
        cy.get('[col-id="validatorStake"]')
          .should('have.length.at.least', 1)
          .each(($validatorStake) => {
            cy.wrap($validatorStake).should('not.be.empty');
          });
      });

      it('Should be able to see validator staked for next epoch', function () {
        cy.get('[col-id="pendingStake"]')
          .should('have.length.at.least', 1)
          .each(($pendingStake) => {
            cy.wrap($pendingStake).should('not.be.empty');
          });
      });

      // 2001-STKE-021
      it('Should be able to see validator ranking score', function () {
        cy.get('.ag-body-horizontal-scroll-viewport').scrollTo('right');
        cy.get('[col-id="rankingScore"]')
          .should('have.length.at.least', 1)
          .each(($rankingScore) => {
            cy.wrap($rankingScore).should('not.be.empty');
          });
      });

      // 2001-STKE-022
      it('Should be able to see validator stake score', function () {
        cy.get('[col-id="stakeScore"]')
          .should('have.length.at.least', 1)
          .each(($stakeScore) => {
            cy.wrap($stakeScore).should('not.be.empty');
          });
      });

      // 2001-STKE-023
      it('Should be able to see validator performance score', function () {
        cy.get('[col-id="performanceScore"]')
          .should('have.length.at.least', 1)
          .each(($performanceScore) => {
            cy.wrap($performanceScore).should('not.be.empty');
          });
      });

      // 2001-STKE-024
      it('Should be able to see validator voting power score', function () {
        cy.get('[col-id="votingPower"]')
          .should('have.length.at.least', 1)
          .each(($votingPower) => {
            cy.wrap($votingPower).should('not.be.empty');
          });
      });

      it('Should be able to see button to unhide top validators', function () {
        cy.get('[data-testid="show-all-validators"]').should('be.visible');
      });
    }
  );

  // 2001-STKE-050
  describe(
    'Should be able to see static information about a validator',
    { tags: '@smoke' },
    function () {
      before('connect wallets and click on validator', function () {
        cy.vega_wallet_import();
        cy.vega_wallet_connect();
        cy.click_on_validator_from_list(0);
      });

      // 2001-STKE-006
      it('Should be able to see validator name', function () {
        cy.get(validatorTitle).should('not.be.empty');
      });

      // 2001-STKE-007
      it('Should be able to see validator id', function () {
        cy.get(validatorId).should('not.be.empty');
      });

      // 2001-STKE-008
      it('Should be able to see validator public key', function () {
        cy.get(validatorPubKey).should('not.be.empty');
      });

      // 2001-STKE-010
      it('Should be able to see Ethereum address', function () {
        cy.get(ethAddressLink).should('not.be.empty').and('have.attr', 'href');
      });
      // TODO validators missing url for more information about them 2001-STKE-09

      // 2001-STKE-012
      it('Should be able to see total stake', function () {
        cy.get(totalStake).invoke('text').should('match', stakeNumberRegex);
      });

      it('Should be able to see pending stake', function () {
        cy.get(pendingStake).invoke('text').should('match', stakeNumberRegex);
      });

      it('Should be able to see staked by operator', function () {
        cy.get(stakedByOperator)
          .invoke('text')
          .should('match', stakeNumberRegex);
      });

      it('Should be able to see staked by delegates', function () {
        cy.get(stakedByDelegates)
          .invoke('text')
          .should('match', stakeNumberRegex);
      });

      // 2001-STKE-051
      it('Should be able to see stake share in percentage', function () {
        cy.get(stakeShare)
          .invoke('text')
          .then(($stakePercentage) => {
            if ($stakePercentage != '-') {
              cy.wrap($stakePercentage).should(
                'match',
                /\b(?<!\.)(?!0+(?:\.0+)?%)(?:\d|[1-9]\d|100)(?:(?<!100)\.\d+)?%/
              );
            }
          });
      });

      // 2001-STKE-013
      it('Should be able to see own stake this epoch', function () {
        cy.get(ownStake).invoke('text').should('match', stakeNumberRegex);
      });

      // 2001-STKE-014
      it('Should be able to see nominated stake this epoch', function () {
        cy.get(nominatedStake).invoke('text').should('match', stakeNumberRegex);
      });

      // 2001-STKE-011 2002-SINC-001 2002-SINC-002
      it('Should be able to see epoch information', function () {
        const epochTitle = 'h3';
        const nextEpochInfo = 'p';

        cy.get(epochCountDown).within(() => {
          cy.get(epochTitle).should('not.be.empty');
          cy.get(nextEpochInfo).should('contain.text', 'Next epoch');
        });
      });
    }
  );
});
