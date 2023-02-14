/// <reference types="cypress" />
const guideLink = '[data-testid="staking-guide-link"]';
const validatorTitle = '[data-testid="validator-node-title"]';
const validatorId = '[data-testid="validator-id"]';
const validatorPubKey = '[data-testid="validator-public-key"]';
const ethAddressLink = '[data-testid="link"]';
const validatorStatus = '[data-testid="validator-status"]';
const totalStake = '[data-testid="total-stake"]';
const pendingStake = '[data-testid="pending-stake"]';
const stakedByOperator = '[data-testid="staked-by-operator"]';
const stakedByDelegates = '[data-testid="staked-by-delegates"]';
const stakeShare = '[data-testid="stake-percentage"]';
const stakedByOperatorToolTip = "[data-testid='staked-operator-tooltip']";
const stakedByDelegatesToolTip = "[data-testid='staked-delegates-tooltip']";
const totalStakedToolTip = "[data-testid='total-staked-tooltip']";
const unnormalisedVotingPowerToolTip =
  "[data-testid='unnormalised-voting-power-tooltip']";
const normalisedVotingPowerToolTip =
  "[data-testid='normalised-voting-power-tooltip']";
const performancePenaltyToolTip = "[data-testid='performance-penalty-tooltip']";
const overstakedPenaltyToolTip = "[data-testid='overstaked-penalty-tooltip']";
const totalPenaltyToolTip = "[data-testid='total-penalty-tooltip']";
const epochCountDown = '[data-testid="epoch-countdown"]';
const stakeNumberRegex = /^\d*\.?\d*$/;

context('Staking Page - verify elements on page', function () {
  before('navigate to staking page', function () {
    cy.visit('/').navigate_to('validators');
  });

  describe('with wallets disconnected', { tags: '@smoke' }, function () {
    describe('description section', function () {
      it('Should have validators tab highlighted', function () {
        cy.verify_tab_highlighted('validators');
      });

      it('Should have validators ON VEGA header visible', function () {
        cy.verify_page_header('Validators');
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
        cy.get('[col-id="validator"] > div > span')
          .should('have.length.at.least', 1)
          .each(($name) => {
            cy.wrap($name).should('not.be.empty');
          });
      });

      it('Should be able to see validator stake', function () {
        cy.get('[col-id="stake"] > div > span > span')
          .should('have.length.at.least', 1)
          .each(($stake) => {
            cy.wrap($stake).should('not.be.empty');
          });
      });

      it('Should be able to see validator stake tooltip', function () {
        cy.get('[col-id="stake"] > div > span > span').first().realHover();

        cy.get(stakedByOperatorToolTip)
          .invoke('text')
          .should('contain', 'Staked by operator: 0.00');
        cy.get(stakedByDelegatesToolTip)
          .invoke('text')
          .should('contain', 'Staked by delegates: 0.00');
        cy.get(totalStakedToolTip)
          .invoke('text')
          .should('contain', 'Total stake: 0.00');
      });

      it('Should be able to see validator normalised voting power', function () {
        cy.get('[col-id="normalisedVotingPower"] > div > span > span')
          .should('have.length.at.least', 1)
          .each(($vPower) => {
            cy.wrap($vPower).should('not.be.empty');
          });
      });

      it('Should be able to see validator voting power tooltip', function () {
        cy.get('[col-id="normalisedVotingPower"] > div > span > span')
          .first()
          .realHover();

        cy.get(unnormalisedVotingPowerToolTip)
          .invoke('text')
          .should('contain', 'Unnormalised voting power: 0.00%');
        cy.get(normalisedVotingPowerToolTip)
          .invoke('text')
          .should('contain', 'Normalised voting power: 0.10%');
      });

      it('Should be able to see validator total penalties', function () {
        cy.get('[col-id="totalPenalties"] > div > span > span')
          .should('have.length.at.least', 1)
          .each(($penalties) => {
            cy.wrap($penalties).should('contain.text', '0%');
          });
      });

      it('Should be able to see validator penalties tooltip', function () {
        cy.get('[col-id="totalPenalties"] > div > span > span').realHover();

        cy.get(performancePenaltyToolTip)
          .invoke('text')
          .should('contain', 'Performance penalty: 100.00%');
        cy.get(overstakedPenaltyToolTip)
          .invoke('text')
          .should('contain', 'Overstaked penalty:'); // value not asserted due to #2886
        cy.get(totalPenaltyToolTip)
          .invoke('text')
          .should('contain', 'Total penalties: 0.00%');
      });

      it('Should be able to see validator pending stake', function () {
        cy.get('[col-id="pendingStake"] > div > span')
          .should('have.length.at.least', 1)
          .each(($pendingStake) => {
            cy.wrap($pendingStake).should('contain.text', '0.00');
          });
      });
    }
  );

  // 2001-STKE-050
  describe(
    'Should be able to see static information about a validator',
    { tags: '@smoke' },
    function () {
      before('connect wallets and click on validator', function () {
        cy.connectVegaWallet();
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

      it('Should be able to see validator status', function () {
        cy.get(validatorStatus).should('have.text', 'Consensus');
      });

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
