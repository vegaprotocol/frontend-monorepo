const guideLink = '[data-testid="staking-guide-link"]';
const validators = '[data-testid="validators-grid"]';
const validatorTitle = '[data-testid="validator-node-title"]';
const validatorId = '[data-testid="validator-id"]';
const validatorPubKey = '[data-testid="validator-public-key"]';
const ethAddressLink = '[data-testid="link"]';
const totalStake = '[data-testid="total-stake"]';
const pendingStake = '[data-testid="pending-stake"]';
const stakedByOperator = '[data-testid="staked-by-operator"]';
const stakedByDelegates = '[data-testid="staked-by-delegates"]';
const stakeShare = '[data-testid="stakedByDelegates"]';
const epochCountDown = '[data-testid="epoch-countdown"]';
const stakeNumberRegex = /^\d*\.?\d*$/;
const ownStake = '[data-testid="own-stake"]';
const nominatedStake = '[data-testid="nominated-stake"]';

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
        // 1002-STAK-003
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
      // 1002-STAK-050
      it('should be visible', function () {
        cy.get(validators).should('be.visible');
      });
    });
  });

  // 1002-STAK-050
  describe('Should be able to see static information about a validator', function () {
    before('connect wallets and click on validator', function () {
      cy.vega_wallet_import();
      cy.vega_wallet_connect();
      cy.get('[col-id="validator"]').first.click();
    });

    // 1002-STAK-005
    it('Should be able to see validator name', function () {
      cy.get(validatorTitle).should('not.be.empty');
    });

    // 1002-STAK-007
    it('Should be able to see validator id', function () {
      cy.get(validatorId).should('not.be.empty');
    });

    // 1002-STAK-008
    it('Should be able to see validator public key', function () {
      cy.get(validatorPubKey).should('not.be.empty');
    });

    // 1002-STAK-010
    it('Should be able to see Ethereum address', function () {
      cy.get(ethAddressLink).should('not.be.empty').and('have.attr', 'href');
    });
    // TODO validators missing url for more information about them 1002-STAK-09

    // 1002-STAK-012
    it('Should be able to see total stake', function () {
      cy.get(totalStake).should('match', stakeNumberRegex);
    });

    it('Should be able to see pending stake', function () {
      cy.get(pendingStake).should('match', stakeNumberRegex);
    });

    it('Should be able to see staked by operator', function () {
      cy.get(stakedByOperator).should('match', stakeNumberRegex);
    });

    it('Should be able to see staked by delegates', function () {
      cy.get(stakedByDelegates).should('match', stakeNumberRegex);
    });

    // 1002-STAK-051
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

    // 1002-STAK-013
    it('Should be able to see own stake this epoch', function () {
      cy.get(ownStake).should('match', stakeNumberRegex);
    });

    // 1002-STAK-014
    it('Should be able to see nominated stake this epoch', function () {
      cy.get(nominatedStake).should('match', stakeNumberRegex);
    });

    // 1002-STAK-011
    it('should be able to see epoch information', function () {
      const epochTitle = 'h3';
      const nextEpochInfo = 'p';

      cy.get(epochCountDown).within(() => {
        cy.get(epochTitle).should('not.be.empty');
        cy.get(nextEpochInfo).should('contain.text', 'Next epoch');
      });
    });

    describe('Should be able to see validator list from the staking page', function () {
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

      // 1002-STAK-021
      it('Should be able to see validator ranking score', function () {
        //
        cy.get('[col-id="rankingScore"]')
          .should('have.length.at.least', 1)
          .each(($rankingScore) => {
            cy.wrap($rankingScore).should('not.be.empty');
          });
      });

      // 1002-STAK-022
      it('Should be able to see validator stake score', function () {
        cy.get('[col-id="stakeScore"]')
          .should('have.length.at.least', 1)
          .each(($stakeScore) => {
            cy.wrap($stakeScore).should('not.be.empty');
          });
      });

      // 1002-STAK-023
      it('Should be able to see validator performance score', function () {
        cy.get('[col-id="performanceScore"]')
          .should('have.length.at.least', 1)
          .each(($performanceScore) => {
            cy.wrap($performanceScore).should('not.be.empty');
          });
      });

      // 1002-STAK-024
      it('Should be able to see validator voting power score', function () {
        cy.get('[col-id="votingPower"]')
          .should('have.length.at.least', 1)
          .each(($votingPower) => {
            cy.wrap($votingPower).should('not.be.empty');
          });
      });
    });
  });
});
