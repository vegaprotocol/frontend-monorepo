/// <reference types="cypress" />
import navigation from '../../locators/navigation.locators';
import staking from '../../locators/staking.locators';
import '../../support/staking.functions';
import '../../support/wallet.functions';
import envVars from '../../fixtures/envVars.json';

context('Staking Tab - with vega wallet connected', function () {
  before('visit staking tab and connect vega wallet', function () {
    cy.vega_wallet_import();
    cy.visit('/');
    cy.get(navigation.section, { timeout: 20000 }).should('be.visible');
    cy.vega_wallet_connect();
    cy.vega_wallet_set_specified_approval_amount_and_reload('1000');
    cy.get(navigation.section, { timeout: 20000 }).should('be.visible');
    cy.ethereum_wallet_connect();
    cy.get(navigation.staking).first().click();
    cy.get(navigation.spinner, { timeout: 20000 }).should('not.exist');
    cy.get(staking.validatorNames).first().invoke('text').as('validatorName');
  });

  describe('Vega wallet - contains VEGA tokens', function () {
    beforeEach(
      'teardown wallet & drill into a specific validator',
      function () {
        cy.vega_wallet_teardown();
        cy.get(navigation.staking).first().click();
        cy.get(navigation.spinner, { timeout: 20000 }).should('not.exist');
        cy.get(staking.validatorNames).contains(this.validatorName).click();
        cy.contains('Your Stake On Node (This Epoch)').should('be.visible');
      }
    );

    it('Able to associate tokens', function () {
      cy.ethereum_wallet_associate_tokens('2');
      cy.ethereum_wallet_check_associated_vega_key_value_is(
        envVars.vegaWalletPublicKeyShort,
        '2.000000000000000000'
      );
      cy.vega_wallet_check_associated_value_is('2.000000000000000000');
    });

    it('Able to associate more tokens than the approved amount of 1000 - requires re-approval', function () {
      cy.ethereum_wallet_associate_tokens('1001', 'Approve');
      cy.ethereum_wallet_check_associated_vega_key_value_is(
        envVars.vegaWalletPublicKeyShort,
        '1,001.000000000000000000'
      );
      cy.vega_wallet_check_associated_value_is('1,001.000000000000000000');
    });

    it('Able to disassociate a partial amount of tokens currently associated', function () {
      cy.ethereum_wallet_associate_tokens('2');
      cy.vega_wallet_check_associated_value_is('2.000000000000000000');

      cy.ethereum_wallet_disassociate_tokens('1');
      cy.ethereum_wallet_check_associated_vega_key_value_is(
        envVars.vegaWalletPublicKeyShort,
        '1.000000000000000000'
      );
      cy.vega_wallet_check_associated_value_is('1.000000000000000000');
    });

    it('Able to disassociate all tokens', function () {
      cy.ethereum_wallet_associate_tokens('2');
      cy.vega_wallet_check_associated_value_is('2.000000000000000000');

      cy.ethereum_wallet_disassociate_all_tokens();
      cy.ethereum_wallet_check_associated_vega_key_is_no_longer_showing(
        envVars.vegaWalletPublicKeyShort
      );
      cy.vega_wallet_check_associated_value_is('0.000000000000000000');
    });

    it('Able to stake against a validator', function () {
      cy.ethereum_wallet_associate_tokens('3');
      cy.vega_wallet_check_unstaked_value_is('3.000000000000000000');

      cy.get('button').contains('Select a validator to nominate').click();
      cy.get(staking.validatorNames).contains(this.validatorName).click();

      cy.staking_validator_page_add_stake('2');
      cy.vega_wallet_check_validator_stake_next_epoch_value_is(
        this.validatorName,
        '2.000000000000000000'
      );
      cy.vega_wallet_check_unstaked_value_is('1.000000000000000000');
    });

    it('Able to remove stake against a validator', function () {
      cy.ethereum_wallet_associate_tokens('3');
      cy.vega_wallet_check_unstaked_value_is('3.000000000000000000');

      cy.get('button').contains('Select a validator to nominate').click();
      cy.get(staking.validatorNames).contains(this.validatorName).click();

      cy.staking_validator_page_add_stake('1');
      cy.staking_validator_page_check_stake_next_epoch_value('1.0');
      cy.vega_wallet_check_validator_stake_next_epoch_value_is(
        this.validatorName,
        '1.000000000000000000'
      );
      cy.vega_wallet_check_unstaked_value_is('2.000000000000000000');

      cy.get(navigation.staking).first().click();
      cy.get(staking.validatorNames).contains(this.validatorName).click();

      cy.staking_validator_page_removeStake('1');
      cy.staking_validator_page_check_stake_next_epoch_value('0.0');
      cy.vega_wallet_check_validator_stake_next_epoch_value_is(
        this.validatorName,
        '0.000000000000000000'
      );
      cy.vega_wallet_check_unstaked_value_is('3.000000000000000000');
    });

    it('Unable to remove a stake with a negative value for a validator', function () {
      cy.ethereum_wallet_associate_tokens('3');
      cy.vega_wallet_check_unstaked_value_is('3.000000000000000000');

      cy.get('button').contains('Select a validator to nominate').click();
      cy.get(staking.validatorNames).contains(this.validatorName).click();

      cy.staking_validator_page_add_stake('2');
      cy.staking_validator_page_check_stake_next_epoch_value('2.0');
      cy.vega_wallet_check_validator_stake_next_epoch_value_is(
        this.validatorName,
        '2.000000000000000000'
      );
      cy.vega_wallet_check_unstaked_value_is('1.000000000000000000');

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
      cy.ethereum_wallet_associate_tokens('3');
      cy.vega_wallet_check_unstaked_value_is('3.000000000000000000');

      cy.get('button').contains('Select a validator to nominate').click();
      cy.get(staking.validatorNames).contains(this.validatorName).click();

      cy.staking_validator_page_add_stake('2');
      cy.staking_validator_page_check_stake_next_epoch_value('2.0');
      cy.vega_wallet_check_validator_stake_next_epoch_value_is(
        this.validatorName,
        '2.000000000000000000'
      );
      cy.vega_wallet_check_unstaked_value_is('1.000000000000000000');

      cy.get(navigation.staking).first().click();
      cy.get(staking.validatorNames).contains(this.validatorName).click();
      cy.get(staking.removeStakeRadioButton).click({ force: true });
      cy.get(staking.tokenAmountInput).type(4);
      cy.contains('Waiting for next epoch to start', { timeout: 10000 });
      cy.get(staking.tokenInputSubmit)
        .should('be.disabled', { timeout: 8000 })
        .and('contain', `Remove 4 $VEGA tokens at the end of epoch`)
        .and('be.visible');
    });
  });
});
