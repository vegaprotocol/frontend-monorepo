/// <reference types="cypress" />

import {
  navigation,
  verifyPageHeader,
  verifyTabHighlighted,
} from '../../support/common.functions';
import {
  clickOnValidatorFromList,
  waitForBeginningOfEpoch,
} from '../../support/staking.functions';

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
const stakedByOperatorToolTip = '[data-testid="staked-operator-tooltip"]';
const stakedByDelegatesToolTip = '[data-testid="staked-delegates-tooltip"]';
const totalStakedToolTip = '[data-testid="total-staked-tooltip"]';
const unnormalisedVotingPowerToolTip =
  '[data-testid="unnormalised-voting-power-tooltip"]';
const normalisedVotingPowerToolTip =
  '[data-testid="normalised-voting-power-tooltip"]';
const performancePenaltyToolTip = '[data-testid="performance-penalty-tooltip"]';
const overstakedPenaltyToolTip = '[data-testid="overstaked-penalty-tooltip"]';
const epochCountDown = '[data-testid="epoch-countdown"]';
const stakeNumberRegex = /^\d{1,3}(,\d{3})*(\.\d+)?$/;

context('Validators Page - verify elements on page', function () {
  before('navigate to validators page', function () {
    cy.visit('/validators');
  });

  describe('with wallets disconnected', { tags: '@smoke' }, function () {
    it('Should have validators tab highlighted', function () {
      verifyTabHighlighted(navigation.validators);
    });

    it('Should have validators ON VEGA header visible', function () {
      verifyPageHeader('Validators');
    });

    it('Should have Staking Guide link visible', function () {
      // 1002-STKE-003
      cy.get(guideLink)
        .should('be.visible')
        .and('have.text', 'Read more about staking on Vega')
        .and(
          'have.attr',
          'href',
          'https://docs.vega.xyz/mainnet/concepts/vega-chain/#staking-on-vega'
        );
    });

    // 1002-STKE-032
    it('Should have button to connect vega wallet in validator page', function () {
      clickOnValidatorFromList(0);
      cy.getByTestId('connect-to-vega-wallet-btn').should('be.visible');
      cy.visit('/validators');
    });
  });
  // 1002-STKE-020 1002-STKE-021 1002-STKE-022 1002-STKE-023 1002-STKE-024
  describe(
    'Should be able to see validator list from the staking page',
    { tags: '@regression' },
    function () {
      // 1002-STKE-050
      it('Should be able to see validator names', function () {
        cy.get('[col-id="validator"] > div > span')
          .should('have.length.at.least', 1)
          .each(($name) => {
            cy.wrap($name).should('not.be.empty');
          });
      });

      it('Should be able to see validator stake', function () {
        cy.getByTestId('total-stake')
          .should('have.length.at.least', 1)
          .each(($stake) => {
            cy.wrap($stake).should('not.be.empty');
          });
      });

      it('Should be able to see validator stake tooltip', function () {
        waitForBeginningOfEpoch();
        cy.getByTestId('total-stake').first().realHover();

        cy.get(stakedByOperatorToolTip)
          .invoke('text')
          .should('contain', 'Staked by operator: 3,000.00');
        cy.get(stakedByDelegatesToolTip)
          .invoke('text')
          .should('contain', 'Staked by delegates: 0.00');
        cy.get(totalStakedToolTip)
          .invoke('text')
          .should('contain', 'Total stake: 3,000.00');
      });

      it('Should be able to see validator normalised voting power', function () {
        cy.getByTestId('normalised-voting-power')
          .should('have.length.at.least', 1)
          .each(($vPower) => {
            cy.wrap($vPower).should('not.be.empty');
          });
      });

      it('Should be able to see validator normalised voting power tooltip', function () {
        waitForBeginningOfEpoch();
        cy.getByTestId('normalised-voting-power').first().realHover();

        cy.get(unnormalisedVotingPowerToolTip)
          .invoke('text')
          .should('contain', 'Unnormalised voting power: 20.00%');
        cy.get(normalisedVotingPowerToolTip)
          .invoke('text')
          .should('contain', 'Normalised voting power: 50.00%');
      });

      // 2002-SINC-018
      it('Should be able to see validator total penalties', function () {
        cy.getByTestId('total-penalty')
          .should('have.length.at.least', 1)
          .each(($penalties) => {
            cy.wrap($penalties).should('contain.text', '0%');
          });
      });

      it('Should be able to see validator penalties tooltip', function () {
        waitForBeginningOfEpoch();
        cy.getByTestId('total-penalty').realHover();

        cy.get(performancePenaltyToolTip)
          .invoke('text')
          .should('contain', 'Performance penalty: 0.00%');
        cy.get(overstakedPenaltyToolTip)
          .invoke('text')
          .should('contain', 'Overstaked penalty: 60.00%'); // value not asserted due to #2886
      });

      it('Should be able to see validator pending stake', function () {
        cy.getByTestId('total-pending-stake')
          .should('have.length.at.least', 1)
          .each(($pendingStake) => {
            cy.wrap($pendingStake).should('contain.text', '0.00');
          });
      });
    }
  );

  // 1002-STKE-050
  describe(
    'Should be able to see static information about a validator',
    { tags: '@smoke' },
    function () {
      before('connect wallets and click on validator', function () {
        cy.connectVegaWallet();
        clickOnValidatorFromList(0);
      });

      // 1002-STKE-006
      it('Should be able to see validator name', function () {
        cy.get(validatorTitle).should('not.be.empty');
      });

      // 1002-STKE-007
      it('Should be able to see validator id', function () {
        cy.get(validatorId).should('not.be.empty');
      });

      // 1002-STKE-008
      it('Should be able to see validator public key', function () {
        cy.get(validatorPubKey).should('not.be.empty');
      });

      // 1002-STKE-010
      it('Should be able to see Ethereum address', function () {
        cy.get(ethAddressLink).should('not.be.empty').and('have.attr', 'href');
      });
      // TODO validators missing url for more information about them 1002-STKE-09

      it('Should be able to see validator status', function () {
        cy.get(validatorStatus).should('have.text', 'Consensus');
      });

      // 1002-STKE-012
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

      // 1002-STKE-051
      it('Should be able to see stake share in percentage', function () {
        cy.get(stakeShare)
          .invoke('text')
          .then(($stakePercentage) => {
            // The pattern must start at a word boundary (\b).
            // The pattern cannot be immediately preceded by a dot ((?<!\.)).
            // The pattern can be one of the following:
            // A percentage value of zero (0%), or
            // A non-zero percentage value that can be:
            // A single digit (\d) between 0 and 9, or
            // A two-digit number between 0 and 99 (\d{1,2}), or
            // The number 100.
            // The pattern can optionally include a decimal point and one or more digits after the decimal point ((?:(?<!100)\.\d+)?). However, if the number is 100, it cannot have a decimal point.
            // The pattern must end with a percentage sign (%).

            cy.wrap($stakePercentage).should(
              'match',
              /\b(?<!\.)(?:0+(?:\.0+)?%|(?:\d|\d{1,2}|100)(?:(?<!100)\.\d+)?)%/
            );
          });
      });

      // 1002-STKE-011 2002-SINC-001 2002-SINC-002
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
