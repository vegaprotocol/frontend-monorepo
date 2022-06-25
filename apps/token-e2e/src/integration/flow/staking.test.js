/// <reference types="cypress" />
import navigation from '../../locators/navigation.locators';
import staking from '../../locators/staking.locators';
import '../../support/staking.functions';
import '../../support/wallet.functions';

context('Staking Tab - with vega wallet connected', function () {
  before('visit staking tab and connect vega wallet', function () {
    cy.visit('/');
    cy.walletVega_create();
    cy.get(navigation.section, { timeout: 20000 }).should('be.visible');
    cy.get(navigation.staking).first().click();
    cy.get(navigation.spinner, { timeout: 20000 }).should('not.exist');
    cy.walletEth_connect();
    cy.walletVega_connect();
    cy.get(navigation.spinner, { timeout: 20000 }).should('not.exist');
    cy.get(staking.validatorNames).first().invoke('text').as('validatorName');
  });

  describe('Vega wallet - contains VEGA tokens', function () {

    beforeEach('drill into a specific validator', function () {
        cy.walletVega_teardown();
        cy.get(navigation.staking).first().click();
        cy.get(navigation.spinner, { timeout: 20000 }).should('not.exist');
        cy.get(staking.validatorNames).contains(this.validatorName).click();
        cy.contains('Your Stake On Node (This Epoch)').should('be.visible');
    })
    
    it('Able to associate tokens', function () {
      cy.walletEth_associateTokens('2');
      cy.walletVega_check_associatedValue_is('2.0')
    })

    it('Able to disassociate all tokens', function () {
      cy.walletEth_associateTokens('2');
      cy.walletVega_check_associatedValue_is('2.0')
      cy.walletEth_disassociateAllTokens();
      cy.walletVega_check_associatedValue_is('0.0')
    })

    it.only('Able to stake against a validator', function () {
      cy.walletEth_associateTokens('0.1');
      cy.get('button').contains('Select a validator to nominate').click();
      cy.get(staking.validatorNames).contains(this.validatorName).click();
      cy.staking_addStake('0.1');
      cy.walletVega_checkThisValidator_StakeNextEpochValue_is(this.validatorName, '0.1');
      cy.walletVega_check_UnstakedValue_is('1.9');
    });

    it('Able to remove stake against a validator', function () {
      cy.walletEth_associateTokens('0.1');
      cy.get('button').contains('Select a validator to nominate').click();
      cy.get(staking.validatorNames).contains(this.validatorName).click();
      cy.staking_addStake('0.1');
      cy.walletVega_checkThisValidator_StakeNextEpochValue_is(this.validatorName, '0.1');
      cy.walletVega_check_UnstakedValue_is('1.9');
      cy.staking_removeStake('0.1')
      cy.walletVega_checkThisValidator_StakeNextEpochValue_is(this.validatorName, '0.0');
      cy.walletVega_check_UnstakedValue_is('2.0');
      cy.stakingValidatorPage_check_stakeNextEpochValue('0.0');
      cy.walletVega_checkThisValidator_StakeNextEpochValue_is(this.validatorName, '0.0')
      cy.walletVega_check_UnstakedValue_is('2.0');
    });

    it('Unable to remove a stake with a negative value for a validator', function () {
      cy.get(staking.removeStakeRadioButton).click({ force: true });
      cy.get(staking.tokenAmountInput).type('-0.1');
      cy.contains('Waiting for next epoch to start', { timeout: 10000 });
      cy.get(staking.tokenInputSubmit)
        .should('be.disabled', { timeout: 8000 })
        .and('contain', `Remove -0.1 $VEGA tokens at the end of epoch`)
        .and('be.visible');
    });

    it('Unable to remove a stake greater than staked amount next epoch for a validator', function () {
      cy.get(staking.removeStakeRadioButton).click({ force: true });
      cy.get(staking.tokenAmountInput).type(0.1);
      cy.contains('Waiting for next epoch to start', { timeout: 10000 });
      cy.get(staking.tokenInputSubmit)
        .should('be.disabled', { timeout: 8000 })
        .and('contain',`Remove 0.1 $VEGA tokens at the end of epoch`)
        .and('be.visible');
    });

  });
});
