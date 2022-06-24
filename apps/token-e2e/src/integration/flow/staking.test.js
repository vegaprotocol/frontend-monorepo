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
    cy.stakingPage_getValidatorNamesSorted().as('validatorNames');
  });

  describe('Vega wallet - contains VEGA tokens', function () {
    beforeEach(
      'drill into a specific validator - and note values',
      function () {
        cy.get(navigation.staking).first().click();
        cy.get(navigation.spinner, { timeout: 20000 }).should('not.exist');
        cy.get(staking.validatorNames).contains(this.validatorNames[0]).click();
        cy.contains('Manage your stake').should('be.visible');
        cy.walletVega_getUnstakedAmount().as('initialUnstakedBalance');
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
      }
    );

    it('Able to stake against a validator', function () {
      // Check - ability to fill in fields and request a stake of 0.1 tokens
      cy.get(staking.addStakeRadioButton).click({ force: true });
      cy.get(staking.tokenAmountInput).type('0.1');
      // cy.staking_waitForEpochRemainingSeconds(5);
      cy.get('button').contains('Add 0.1 $VEGA tokens').click();

      // Check - relevant successfull feedback provided after staking - Note: Wallet auto approves at this stage
      cy.contains(
        `Adding 0.1 $VEGA to validator ${this.validatorNames[0]}`
      ).should('be.visible');
      cy.contains(
        'Waiting for confirmation that your change in nomination has been received'
      ).should('be.visible');
      cy.contains(
        'Waiting for confirmation that your change in nomination has been received',
        { timeout: 120000 }
      ).should('not.exist');
      cy.contains(
        'At the beginning of the next epoch your $VEGA will be nominated to the validator'
      );

      // Check - staking page - stake on node (next epoch) - updates to reflect stake
      cy.stakingValidatorPage_check_stakeNextEpochValue(
        parseFloat(this.initialStakeNextEpoch) + 0.1
      );

      // Check - wallet staked amount - updates balance for validator
      cy.walletVega_checkValidator_StakeNextEpochValue_is(
        this.validatorNames[0],
        parseFloat(this.initialStakeNextEpoch) + 0.1
      );

      //Check - wallet unstaked amount - updates balance - Note: Skipping until capsule can enable this test
      // cy.walletVega_check_UnstakedValue_is(
      //   parseFloat(this.initialUnstakedBalance) - 0.1);
    });

    it.skip('Able to stake maximum tokens against a validator', function () {
      // Check - ability to fill in fields and request a stake of 0.1 tokens
      cy.get(staking.addStakeRadioButton).click({ force: true });
      cy.get(staking.stakeMaximumTokens).click();
      // cy.staking_waitForEpochRemainingSeconds(5);
      cy.get('button')
        .contains(`Add ${parseFloat(this.initialUnstakedBalance)} $VEGA tokens`)
        .click();

      // Check - relevant successfull feedback provided after staking - Note: Wallet auto approves at this stage
      cy.contains(
        `Adding 0.1 $VEGA to validator ${this.validatorNames[0]}`
      ).should('be.visible');
      cy.contains(
        'Waiting for confirmation that your change in nomination has been received'
      ).should('be.visible');
      cy.contains(
        'Waiting for confirmation that your change in nomination has been received',
        { timeout: 120000 }
      ).should('not.exist');
      cy.contains(
        'At the beginning of the next epoch your $VEGA will be nominated to the validator'
      );

      // Check - staking page - stake on node (next epoch) - updates to reflect stake
      cy.stakingValidatorPage_check_stakeNextEpochValue(
        parseFloat(this.initialStakeNextEpoch) + 0.1
      );

      // Check - wallet staked amount - updates balance for validator
      cy.walletVega_checkValidator_StakeNextEpochValue_is(
        this.validatorNames[0],
        parseFloat(this.initialStakeNextEpoch) + 0.1
      );

      //Check - wallet unstaked amount - updates balance - Note: Skipping until capsule can enable this test
      // cy.walletVega_check_UnstakedValue_is(
      //   parseFloat(this.initialUnstakedBalance) - 0.1);
    });

    it('Able to remove stake against a validator', function () {
      // Check - ability to fill in fields and request a stake of 0.1 tokens
      cy.get(staking.removeStakeRadioButton).click({ force: true });
      cy.get(staking.tokenAmountInput).type('0.1');
      // cy.staking_waitForEpochRemainingSeconds(5);
      cy.get('button').contains('Remove 0.1 $VEGA tokens').click();

      // Check - relevant successfull feedback provided after staking
      // Wallet auto approves at this stage
      cy.contains(
        `Removing 0.1 $VEGA from validator ${this.validatorNames[0]}`
      ).should('be.visible');
      cy.contains(
        'Waiting for confirmation that your change in nomination has been received'
      ).should('be.visible');
      cy.contains(
        'Waiting for confirmation that your change in nomination has been received',
        { timeout: 120000 }
      ).should('not.exist');
      cy.contains(
        `0.1 $VEGA has been removed from validator ${this.validatorNames[0]}`
      );

      // Check - staking page - stake on node (next epoch) - updates to reflect stake
      cy.stakingValidatorPage_check_stakeNextEpochValue(
        parseFloat(this.initialStakeNextEpoch) - 0.1
      );

      cy.get(staking.stakeThisEpochValue)
        .invoke('text')
        .then((stakeThisEpochValue) => {
          cy.get(staking.stakeNextEpochValue)
            .invoke('text')
            .then((stakeNextEpochValue) => {
              if (stakeNextEpochValue == stakeThisEpochValue) {
                cy.log('nothing');
              } else {
                cy.walletVega_checkValidator_StakeNextEpochValue_is(
                  this.validatorNames[0],
                  parseFloat(this.initialStakeNextEpoch) + 0.1
                );
              }
            });
        });

      // Check - wallet - next epoch amount - updates balance for validator
      // cy.walletVega_checkValidator_StakeNextEpochValue_is(
      //   this.validatorNames[0],
      //   parseFloat(this.initialStakeNextEpoch) - 0.1
      // );

      // Check - wallet - unstaked amount - updates balance'
      // Skipping until capsule can enable this test
      // cy.walletVega_check_UnstakedValue_is(
      //   parseFloat(this.initialUnstakedBalance) - 0.1
      // );
    });

    it('Unable to remove a stake with a negative value for a validator', function () {
      // Check - ability to fill in fields and request a stake of 0.1 tokens
      cy.get(staking.removeStakeRadioButton).click({ force: true });
      cy.get(staking.tokenAmountInput).type('-0.1');
      // cy.staking_waitForEpochRemainingSeconds(5);
      cy.get('button')
        .contains('Remove -0.1 $VEGA tokens at the end of epoch')
        .should('be.disabled');
    });

    it('Unable to remove a stake greater than staked amount next epoch for a validator', function () {
      let amountToTry = this.initialStakeNextEpoch.slice(0, -1) + '1';
      cy.get(staking.removeStakeRadioButton).click({ force: true });
      cy.get(staking.tokenAmountInput).type(amountToTry);
      // cy.staking_waitForEpochRemainingSeconds(5);
      cy.get('button')
        .contains(`Remove ${amountToTry} $VEGA tokens at the end of epoch`)
        .should('be.disabled');
    });
  });
});
