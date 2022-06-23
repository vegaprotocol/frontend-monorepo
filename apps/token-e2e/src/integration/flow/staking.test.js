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

  describe('vega wallet contains VEGA tokens', function () {
    before('ensure environment fit for test', function () {
      assert.isAtLeast(
        parseInt(this.initialUnstakedBalance),
        0.1,
        'Checking we have at least 0.1 unstaked vega to play with'
      );
      assert.isAtLeast(
        this.validatorNames.length,
        2,
        'Checking we have at least 2 validators'
      );
      // Ensure we are not in last minute - as this adds flake
      cy.get(staking.epochEndingText)
        .contains('Next epoch in 1 minutes', { timeout: 65000 })
        .should('not.exist');
    });

    before('drill into a specific validator - and note values', function () {
      cy.get(staking.validatorNames).contains(this.validatorNames[0]).click();
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

    describe('Able to stake against a validator', function () {
      it('Able to stake against a validator', function () {
        // Check - ability to fill in fields and request a stake of 0.1 tokens
        cy.get(staking.addStakeRadioButton).click({ force: true });
        cy.get(staking.tokenAmountInput).type('0.1');
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
        let expectedStakeNextEpochValue =
          parseFloat(this.initialStakeNextEpoch) + 0.1;
        cy.get(staking.stakeNextEpochValue, { timeout: 10000 }).contains(
          expectedStakeNextEpochValue.toFixed(2),
          { timeout: 10000 }
        );

        //Check - wallet staked amount - updates balance for validator
        let expectedValStakeNextEpochValue =
          parseFloat(this.initialStakeNextEpoch) + 0.1;
        cy.walletVega_getNextEpochStakeForSpecifiedValidator(
          this.validatorNames[0]
        ).then((actualNextEpochStake) => {
          assert.equal(
            parseFloat(actualNextEpochStake).toPrecision(12),
            parseFloat(expectedValStakeNextEpochValue).toPrecision(12)
          );
        });

        //Check - wallet unstaked amount - updates balance - Note: Skipping until capsule can enable this test
        // cy.walletVega_getUnstakedAmount().should('equal', this.initialUnstakedBalance - 0.1);
      });
    });
  });
});
