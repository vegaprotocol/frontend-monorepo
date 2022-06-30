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
    cy.ethereum_wallet_connect();
    cy.vega_wallet_connect();
    cy.vega_wallet_set_approval_amount_to('1000');
    cy.get(navigation.staking).first().click();
    cy.get(navigation.spinner, { timeout: 20000 }).should('not.exist');
    cy.get(staking.validatorNames).first().invoke('text').as('validatorName');
  });

  describe('Vega wallet - contains VEGA tokens', function () {

    beforeEach('teardown wallet & drill into a specific validator', function () {
      cy.vega_wallet_teardown();
      cy.get(navigation.staking).first().click();
      cy.get(navigation.spinner, { timeout: 20000 }).should('not.exist');
      cy.get(staking.validatorNames).contains(this.validatorName).click();
      cy.contains('Your Stake On Node (This Epoch)').should('be.visible');
    })
    
    it('Able to associate tokens - having previously approved', function () {
      cy.ethereum_wallet_associateTokens('2');
      cy.vega_wallet_check_associatedValue_is('2.000000000000000000');
    })

    it('Able to associate more tokens for then the approved amount of 1000 - requires re-approval', function () {
      cy.ethereum_wallet_associateTokens('1001', 'Approve');
      cy.vega_wallet_check_associatedValue_is('1,001.000000000000000000');
    })

    it('Able to disassociate some tokens - but not all', function () {
      cy.ethereum_wallet_associateTokens('2');
      cy.vega_wallet_check_associatedValue_is('2.000000000000000000');

      cy.ethereum_wallet_disassociateTokens('1');
      cy.vega_wallet_check_associatedValue_is('1.000000000000000000');
    })

    it('Able to disassociate all tokens', function () {
      cy.ethereum_wallet_associateTokens('2');
      cy.vega_wallet_check_associatedValue_is('2.000000000000000000');

      cy.ethereum_wallet_disassociateAllTokens();
      cy.vega_wallet_check_associatedValue_is('0.000000000000000000');
    })

    it('Able to stake against a validator', function () {
      cy.ethereum_wallet_associateTokens('3');
      cy.vega_wallet_check_unstakedValue_is('3.000000000000000000');

      cy.get('button').contains('Select a validator to nominate').click();
      cy.get(staking.validatorNames).contains(this.validatorName).click();

      cy.staking_validator_page_addStake('2');
      cy.vega_wallet_check_validator_stakeNextEpochValue_is(this.validatorName, '2.000000000000000000');
      cy.vega_wallet_check_unstakedValue_is('1.000000000000000000');
    });

    it('Able to remove stake against a validator', function () {
      cy.ethereum_wallet_associateTokens('3');
      cy.vega_wallet_check_unstakedValue_is('3.000000000000000000');

      cy.get('button').contains('Select a validator to nominate').click();
      cy.get(staking.validatorNames).contains(this.validatorName).click();

      cy.staking_validator_page_addStake('1');
      cy.staking_validator_page_check_stakeNextEpochValue('1.0');
      cy.vega_wallet_check_validator_stakeNextEpochValue_is(this.validatorName, '1.000000000000000000');
      cy.vega_wallet_check_unstakedValue_is('2.000000000000000000');

      cy.get(navigation.staking).first().click();
      cy.get(staking.validatorNames).contains(this.validatorName).click();
      
      cy.staking_validator_page_removeStake('1');
      cy.staking_validator_page_check_stakeNextEpochValue('0.0');
      cy.vega_wallet_check_validator_stakeNextEpochValue_is(this.validatorName, '0.000000000000000000');
      cy.vega_wallet_check_unstakedValue_is('3.000000000000000000');
    });

    it('Unable to remove a stake with a negative value for a validator', function () {
      cy.ethereum_wallet_associateTokens('3');
      cy.vega_wallet_check_unstakedValue_is('3.000000000000000000');

      cy.get('button').contains('Select a validator to nominate').click();
      cy.get(staking.validatorNames).contains(this.validatorName).click();
      
      cy.staking_validator_page_addStake('2');
      cy.staking_validator_page_check_stakeNextEpochValue('2.0');
      cy.vega_wallet_check_validator_stakeNextEpochValue_is(this.validatorName, '2.000000000000000000');
      cy.vega_wallet_check_unstakedValue_is('1.000000000000000000');
      
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
      cy.vega_wallet_check_unstakedValue_is('3.000000000000000000');

      cy.get('button').contains('Select a validator to nominate').click();
      cy.get(staking.validatorNames).contains(this.validatorName).click();

      cy.staking_validator_page_addStake('2');
      cy.staking_validator_page_check_stakeNextEpochValue('2.0');
      cy.vega_wallet_check_validator_stakeNextEpochValue_is(this.validatorName, '2.000000000000000000');
      cy.vega_wallet_check_unstakedValue_is('1.000000000000000000');

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

    it('Able to associate more tokens for then the approved amount of 1000 - requires re-approval', function () {
      cy.ethereum_wallet_associateTokens('1001', 'Approve');
      cy.vega_wallet_check_associatedValue_is('1,001.000000000000000000');
    })

  });
});
