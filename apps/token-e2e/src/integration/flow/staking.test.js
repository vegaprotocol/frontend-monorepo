/// <reference types="cypress" />
import navigation from '../../locators/navigation.locators';
import staking from '../../locators/staking.locators';
import '../../support/staking.functions';
import '../../support/wallet.functions';

context('Staking Tab - with vega wallet connected', function () {
  before('visit staking tab and connect vega wallet', function () {
    cy.vega_wallet_create();

    cy.visit('/');
    cy.get(navigation.section, { timeout: 20000 }).should('be.visible');
    
    cy.get(navigation.staking).first().click();
    cy.get(navigation.spinner, { timeout: 20000 }).should('not.exist');
    
    cy.ethereum_wallet_connect();
    cy.vega_wallet_connect();
    cy.get(navigation.spinner, { timeout: 20000 }).should('not.exist');
    
    cy.get(staking.validatorNames).first().invoke('text').as('validatorName');
  });

  describe('Vega wallet - contains VEGA tokens', function () {

    beforeEach('drill into a specific validator', function () {
        cy.vega_wallet_teardown();
        cy.get(navigation.staking).first().click();
        cy.get(navigation.spinner, { timeout: 20000 }).should('not.exist');
        cy.get(staking.validatorNames).contains(this.validatorName).click();
        cy.contains('Your Stake On Node (This Epoch)').should('be.visible');
    })

    it('Able to associate tokens for first time - requires approval', function () {
      cy.ethereum_wallet_approveAndAssociateTokens('2');
      cy.vega_wallet_check_associatedValue_is('2.0');
    })
    
    it('Able to associate tokens - having previously approved', function () {
      cy.ethereum_wallet_associateTokens('2');
      cy.vega_wallet_check_associatedValue_is('2.0');
    })

    it('Able to disassociate all tokens', function () {
      cy.ethereum_wallet_associateTokens('2');
      cy.vega_wallet_check_associatedValue_is('2.0');

      cy.ethereum_wallet_disassociateAllTokens();
      cy.vega_wallet_check_associatedValue_is('0.0');
    })

    it('Able to stake against a validator', function () {
      cy.ethereum_wallet_associateTokens('3');
      cy.vega_wallet_check_unstakedValue_is('3.0');

      cy.get('button').contains('Select a validator to nominate').click();
      cy.get(staking.validatorNames).contains(this.validatorName).click();

      cy.staking_validator_page_addStake('2');
      cy.vega_wallet_check_validator_stakeNextEpochValue_is(this.validatorName, '2.0');
      cy.vega_wallet_check_unstakedValue_is('1.0');
    });

    it('Able to remove stake against a validator', function () {
      cy.ethereum_wallet_associateTokens('3');
      cy.vega_wallet_check_unstakedValue_is('3.0');

      cy.get('button').contains('Select a validator to nominate').click();
      cy.get(staking.validatorNames).contains(this.validatorName).click();

      cy.staking_validator_page_addStake('1');
      cy.staking_validator_page_check_stakeNextEpochValue('1.0');
      cy.vega_wallet_check_validator_stakeNextEpochValue_is(this.validatorName, '1.0');
      cy.vega_wallet_check_unstakedValue_is('2.0');

      cy.get(navigation.staking).first().click();
      cy.get(staking.validatorNames).contains(this.validatorName).click();
      
      cy.staking_validator_page_removeStake('1');
      cy.staking_validator_page_check_stakeNextEpochValue('0.0');
      cy.vega_wallet_check_validator_stakeNextEpochValue_is(this.validatorName, '0.0');
      cy.vega_wallet_check_unstakedValue_is('3.0');
    });

    it('Unable to remove a stake with a negative value for a validator', function () {
      cy.ethereum_wallet_associateTokens('3');
      cy.vega_wallet_check_unstakedValue_is('3.0');

      cy.get('button').contains('Select a validator to nominate').click();
      cy.get(staking.validatorNames).contains(this.validatorName).click();
      
      cy.staking_validator_page_addStake('2');
      cy.staking_validator_page_check_stakeNextEpochValue('2.0');
      cy.vega_wallet_check_validator_stakeNextEpochValue_is(this.validatorName, '2.0');
      cy.vega_wallet_check_unstakedValue_is('1.0');
      
      cy.get(navigation.staking).first().click();
      cy.get(staking.validatorNames).contains(this.validatorName).click();
      cy.get(staking.removeStakeRadioButton).click({ force: true });
      cy.get(staking.tokenAmountInput).type('-0.1');
      cy.contains('Waiting for next epoch to start', { timeout: 10000 });
      cy.get(staking.tokenInputSubmit)
        .should('be.disabled', { timeout: 8000 })
        .and('contain', `Remove -0.1 $VEGA tokens at the end of epoch`)
        .and('be.visible');
    });

    it('Unable to remove a stake greater than staked amount next epoch for a validator', function () {
      cy.ethereum_wallet_associateTokens('3');
      cy.vega_wallet_check_unstakedValue_is('3.0');

      cy.get('button').contains('Select a validator to nominate').click();
      cy.get(staking.validatorNames).contains(this.validatorName).click();

      cy.staking_validator_page_addStake('2');
      cy.staking_validator_page_check_stakeNextEpochValue('2.0');
      cy.vega_wallet_check_validator_stakeNextEpochValue_is(this.validatorName, '2.0');
      cy.vega_wallet_check_unstakedValue_is('1.0');

      cy.get(navigation.staking).first().click();
      cy.get(staking.validatorNames).contains(this.validatorName).click();
      cy.get(staking.removeStakeRadioButton).click({ force: true });
      cy.get(staking.tokenAmountInput).type(4);
      cy.contains('Waiting for next epoch to start', { timeout: 10000 });
      cy.get(staking.tokenInputSubmit)
        .should('be.disabled', { timeout: 8000 })
        .and('contain',`Remove 4 $VEGA tokens at the end of epoch`)
        .and('be.visible');
    });

  });
});
