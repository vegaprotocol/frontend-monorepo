/// <reference types="cypress" />
import navigation from '../../locators/navigation.locators';
import staking from '../../locators/staking.locators';
import '../../support/staking.functions';
import '../../support/wallet.functions';

context('Staking Tab - with vega wallet connected', function () {
  before('visit staking tab and connect vega wallet', function () {
    cy.visit('/');
    cy.get(navigation.section, { timeout: 20000 }).should('be.visible');
    cy.get(navigation.staking).first().click();
    cy.walletVega_connect();
    cy.get(navigation.spinner, { timeout: 20000 }).should('not.exist');
    cy.walletVega_getUnstakedAmount().as('initialUnstakedBalance');
    cy.stakingPage_getValidatorNamesSorted().as('validatorNames');
  });

  describe('Vega wallet - contains VEGA tokens', function () {
    before('ensure environment fit for test', function () {
      assert.isAtLeast(
        this.validatorNames.length,
        2,
        'Checking we have at least 2 validators'
      );
      // Choose the first validator from top of sorted list
      this.validatorName = this.validatorNames[0];
    });

    before('drill into a specific validator - and note values', function () {
      cy.get(staking.validatorNames).contains(this.validatorName).click();
      cy.contains('Manage your stake').should('be.visible');
      cy.get(staking.stakeNextEpochValue)
        .invoke('text')
        .as('initialStakeNextEpoch');
      cy.get(staking.stakeThisEpochValue)
        .invoke('text')
        .as('initialStakeThisEpoch');
      cy.contains('OWN STAKE (THIS EPOCH)')
        .parent()
        .siblings()
        .invoke('text')
        .as('initialValidatorStake');
    });

    describe('Flow - Ability to remove a stake against a validator', function () {
      before('Check - validator has tokens to remove', function () {
        assert.isAtLeast(
          parseFloat(this.initialStakeNextEpoch),
          0.1,
          'Checking we have tokens to remove'
        );
      });

      before(
        'Check - ability to fill in fields and request a stake of 0.1 tokens',
        function () {
          cy.get(staking.removeStakeRadioButton).click({ force: true });
          cy.get(staking.tokenAmountInput).type('0.1');
          // cy.staking_waitForEpochRemainingSeconds(5);
          cy.get('button').contains('Remove 0.1 $VEGA tokens').click();
        }
      );

      it('Check - relevant successfull feedback provided after staking', function () {
        // Wallet auto approves at this stage
        cy.contains(
          `Removing 0.1 $VEGA from validator ${this.validatorName}`
        ).should('be.visible');
        cy.contains(
          'Waiting for confirmation that your change in nomination has been received'
        ).should('be.visible');
        cy.contains(
          'Waiting for confirmation that your change in nomination has been received',
          { timeout: 120000 }
        ).should('not.exist');
        cy.contains(
          `0.1 $VEGA has been removed from validator ${this.validatorName}`
        );
      });

      it('Check - staking page - stake on node (next epoch) - updates to reflect stake', function () {
        cy.stakingValidatorPage_check_stakeNextEpochValue(
          parseFloat(this.initialStakeNextEpoch) - 0.1
        );
      });

      it('Check - wallet - next epoch amount - updates balance for validator', function () {
        cy.walletVega_checkValidator_StakeNextEpochValue_is(
          this.validatorName,
          parseFloat(this.initialStakeNextEpoch) - 0.1
        );
      });

      it.skip('Check - wallet - unstaked amount - updates balance', function () {
        // Skipping until capsule can enable this test
        cy.walletVega_check_UnstakedValue_is(
          parseFloat(this.initialUnstakedBalance) - 0.1
        );
      });
    });
  });
});
