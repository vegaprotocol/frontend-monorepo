/// <reference types="cypress" />
import navigation from '../../locators/navigation.locators';
import staking from '../../locators/staking.locators';
import wallet from '../../locators/wallet.locators';
import '../../support/staking.functions';
import '../../support/wallet.functions';

context('Staking Tab - with vega wallet connected', function () {
  before('visit staking tab and connect vega wallet', function () {
    cy.visit('/');
    cy.get(navigation.section, { timeout: 20000 }).should('be.visible');
    cy.get(navigation.staking).first().click();
    cy.walletVega_create();
    cy.walletEth_connect();
    cy.walletVega_connect();
    cy.get(navigation.spinner, { timeout: 20000 }).should('not.exist');
    cy.get(staking.validatorNames).first().invoke('text').as('validatorName');
  });

  describe('Vega wallet - contains VEGA tokens', function () {

    before('Associate VEGA tokens', function () {
      cy.get(wallet.ethWallet).within(() => cy.get(wallet.ethWalletAssociate).click())
      cy.get(staking.stakeAssociateWalletRadio, {timeout : 20000}).click();
      cy.get(staking.tokenAmountInput, {timeout : 10000}).type('2');
      cy.contains('$VEGA Tokens are approved for staking', {timeout : 20000})
    })

    beforeEach('drill into a specific validator - and note values', function () {
        cy.get(navigation.staking).first().click();
        cy.get(navigation.spinner, { timeout: 20000 }).should('not.exist');
        cy.get(staking.validatorNames).contains(this.validatorName).click();
        cy.contains('Manage your stake').should('be.visible');
        cy.get(wallet.vegawallet).contains('Unstaked').siblings()
          .invoke('text').as('initialUnstakedBalance');
        cy.get(staking.stakeNextEpochValue).invoke('text')
          .as('initialStakeNextEpoch');
        cy.get(staking.stakeThisEpochValue).invoke('text')
          .as('initialStakeThisEpoch');
    });

    it('Able to stake against a validator', function () {
      cy.log("**Check - ability to fill in fields and request an add stake of 0.5 tokens**");
      cy.get(staking.addStakeRadioButton).click({ force: true });
      cy.get(staking.tokenAmountInput).type('0.5');
      cy.contains('Waiting for next epoch to start', {timeout:10000});
      cy.get(staking.tokenInputSubmit).should('be.enabled', {timeout:8000})
        .and('contain', 'Add 0.5 $VEGA tokens')
        .and('be.visible')
        .click();

      cy.log("**Check - relevant successfull feedback provided after staking - after auto approval**");
      cy.contains('At the beginning of the next epoch your $VEGA will be nominated to the validator');

      cy.log("**Check - staking page - stake on node (next epoch) - updates to reflect stake**");
      cy.stakingValidatorPage_check_stakeNextEpochValue(parseFloat(this.initialStakeNextEpoch) + 0.5);

      cy.log("**Check - wallet - next epoch amount - updates balance for validator**");
      cy.walletVega_checkThisValidator_StakeNextEpochValue_is(this.validatorName,
        parseFloat(this.initialStakeNextEpoch) + 0.5);

      cy.log("**Check - wallet - unstaked amount - updates balance**");
      cy.walletVega_check_UnstakedValue_is(parseFloat(this.initialUnstakedBalance) - 0.5);
    });

    it('Able to remove stake against a validator', function () {

      cy.log("**Check - ability to fill in fields and request a removal stake of 0.1 tokens**");
      cy.get(staking.removeStakeRadioButton).click({ force: true });
      cy.get(staking.tokenAmountInput).type('0.1');
      cy.contains('Waiting for next epoch to start', {timeout:10000});
      cy.get(staking.tokenInputSubmit).should('be.enabled', {timeout:8000})
        .and('contain', 'Remove 0.1 $VEGA tokens').and('be.visible').click();

      cy.log("**Check - relevant successfull feedback provided after staking - after auto approval**");
      cy.contains(`0.1 $VEGA has been removed from validator`).should('be.visible');

      cy.log("**Check - staking page - stake on node (next epoch) - updates to reflect stake**");
      cy.stakingValidatorPage_check_stakeNextEpochValue(parseFloat(this.initialStakeNextEpoch) - 0.1);

      cy.log("**Check - wallet - next epoch amount - updates balance for validator**");
      cy.walletVega_checkThisValidator_StakeNextEpochValue_is(this.validatorName,
        parseFloat(this.initialStakeNextEpoch) - 0.1);

      cy.log("**Check - wallet - unstaked amount - updates balance**");
      cy.walletVega_check_UnstakedValue_is(parseFloat(this.initialUnstakedBalance) + 0.1);
    });

    it('Unable to remove a stake with a negative value for a validator', function () {
      cy.get(staking.removeStakeRadioButton).click({ force: true });
      cy.get(staking.tokenAmountInput).type('-0.1');
      cy.contains('Waiting for next epoch to start', {timeout:10000});
      cy.get(staking.tokenInputSubmit).should('be.disabled', {timeout:8000})
        .and('contain', `Remove -0.1 $VEGA tokens at the end of epoch`)
        .and('be.visible')
    });

    it('Unable to remove a stake greater than staked amount next epoch for a validator', function () {
      let amountToTry = this.initialStakeNextEpoch.slice(0, -1) + '1';
      cy.get(staking.removeStakeRadioButton).click({ force: true });
      cy.get(staking.tokenAmountInput).type(amountToTry);
      cy.contains('Waiting for next epoch to start', {timeout:10000});
      cy.get(staking.tokenInputSubmit).should('be.disabled', {timeout:8000})
        .and('contain', `Remove ${amountToTry} $VEGA tokens at the end of epoch`)
        .and('be.visible')
    });
  });
});
