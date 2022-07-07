/// <reference types="cypress" />
import navigation from '../../locators/navigation.locators';
import staking from '../../locators/staking.locators';
import wallet from '../../locators/wallet.locators';
import '../../support/staking.functions';
import '../../support/vega-wallet.functions';
import '../../support/eth-wallet.functions';
import '../../support/wallet-teardown.functions';

const vegaWalletPublicKeyShort = Cypress.env('vegaWalletPublicKeyShort');

context('Staking Tab - with eth and vega wallets connected', function () {
  before('visit staking tab and connect vega wallet', function () {
    cy.vega_wallet_import();
    cy.visit('/');
    cy.get(navigation.section, { timeout: 20000 }).should('be.visible');
    cy.vega_wallet_connect();
    cy.vega_wallet_set_specified_approval_amount('1000');
    cy.reload();
    cy.get(navigation.section, { timeout: 20000 }).should('be.visible');
    cy.ethereum_wallet_connect();
    cy.get(navigation.staking).first().click();
    cy.get(navigation.spinner, { timeout: 20000 }).should('not.exist');
    cy.get(staking.validatorNames).first().invoke('text').as('validatorName');
    cy.get(staking.validatorNames)
      .last()
      .invoke('text')
      .as('otherValidatorName');
  });

  describe('Eth wallet - contains VEGA tokens', function () {
    beforeEach(
      'teardown wallet & drill into a specific validator',
      function () {
        cy.vega_wallet_teardown();
        cy.get(navigation.staking).first().click();
      }
    );

    it('Able to stake against a validator', function () {
      cy.staking_page_associate_tokens('3');
      cy.vega_wallet_check_unstaked_value_is('3.000000000000000000');
      cy.ethereum_wallet_check_associated_value_is('3.0');
      cy.ethereum_wallet_check_associated_vega_key_value_is(
        vegaWalletPublicKeyShort,
        '3.000000000000000000'
      );

      cy.get('button').contains('Select a validator to nominate').click();
      cy.get(staking.validatorNames).contains(this.validatorName).click();

      cy.staking_validator_page_add_stake('2');
      cy.vega_wallet_check_validator_stake_next_epoch_value_is(
        this.validatorName,
        '2.000000000000000000'
      );
      cy.vega_wallet_check_unstaked_value_is('1.000000000000000000');
      cy.vega_wallet_check_validator_staked_value_is(
        this.validatorName,
        '2.000000000000000000'
      );
      cy.staking_validator_page_check_stake_next_epoch_value('2.0');
      cy.staking_validator_page_check_stake_this_epoch_value('2.0');
    });

    it('Able to stake against mulitple validators', function () {
      cy.staking_page_associate_tokens('5');
      cy.vega_wallet_check_unstaked_value_is('5.000000000000000000');
      cy.get('button').contains('Select a validator to nominate').click();
      cy.get(staking.validatorNames).contains(this.validatorName).click();

      cy.staking_validator_page_add_stake('2');
      cy.vega_wallet_check_validator_staked_value_is(
        this.validatorName,
        '2.000000000000000000'
      );
      cy.get(navigation.staking).first().click();
      cy.get(staking.validatorNames).contains(this.otherValidatorName).click();
      cy.staking_validator_page_add_stake('1');
      cy.vega_wallet_check_validator_staked_value_is(
        this.otherValidatorName,
        '1.000000000000000000'
      );
      cy.vega_wallet_check_unstaked_value_is('2.000000000000000000');
    });

    it.skip('Able to remove part of a stake against a validator', function () {
      cy.staking_page_associate_tokens('4');
      cy.vega_wallet_check_unstaked_value_is('4.000000000000000000');

      cy.get('button').contains('Select a validator to nominate').click();
      cy.get(staking.validatorNames).contains(this.validatorName).click();

      cy.staking_validator_page_add_stake('3');
      cy.staking_validator_page_check_stake_next_epoch_value('3.0');
      cy.vega_wallet_check_validator_stake_next_epoch_value_is(
        this.validatorName,
        '3.000000000000000000'
      );
      cy.vega_wallet_check_unstaked_value_is('1.000000000000000000');

      cy.get(navigation.staking).first().click();
      cy.get(staking.validatorNames).contains(this.validatorName).click();

      cy.staking_validator_page_removeStake('1');
      cy.staking_validator_page_check_stake_next_epoch_value('2.0');
      cy.staking_validator_page_check_stake_this_epoch_value('3.0');
      cy.vega_wallet_check_validator_stake_next_epoch_value_is(
        this.validatorName,
        '2.000000000000000000'
      );
      cy.vega_wallet_check_validator_stake_this_epoch_value_is(
        this.validatorName,
        '3.000000000000000000'
      );
      cy.vega_wallet_check_unstaked_value_is('2.000000000000000000');
      cy.vega_wallet_check_validator_staked_value_is(
        this.validatorName,
        '2.000000000000000000'
      );
      cy.staking_validator_page_check_stake_next_epoch_value('2.0');
      cy.staking_validator_page_check_stake_this_epoch_value('2.0');
    });

    it('Able to remove a full stake against a validator', function () {
      cy.staking_page_associate_tokens('3');
      cy.vega_wallet_check_unstaked_value_is('3.000000000000000000');

      cy.get('button').contains('Select a validator to nominate').click();
      cy.get(staking.validatorNames).contains(this.validatorName).click();

      cy.staking_validator_page_add_stake('1');
      cy.vega_wallet_check_validator_stake_next_epoch_value_is(
        this.validatorName,
        '1.000000000000000000'
      );
      cy.vega_wallet_check_unstaked_value_is('2.000000000000000000');

      cy.get(navigation.staking).first().click();
      cy.get(staking.validatorNames).contains(this.validatorName).click();

      cy.staking_validator_page_removeStake('1');
      cy.staking_validator_page_check_stake_next_epoch_value('0.0');

      cy.vega_wallet_check_validator_stake_this_epoch_value_is(
        this.validatorName,
        '1.000000000000000000'
      );
      cy.vega_wallet_check_validator_stake_next_epoch_value_is(
        this.validatorName,
        '0.000000000000000000'
      );
      cy.vega_wallet_check_unstaked_value_is('3.000000000000000000');
      cy.staking_validator_page_check_stake_next_epoch_value('0.0');
      cy.staking_validator_page_check_stake_this_epoch_value('0.0');
      cy.vega_wallet_check_validator_no_longer_showing(this.validatorName);
    });

    it.skip('Unable to remove a stake with a negative value for a validator', function () {
      cy.staking_page_associate_tokens('3');
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

    it.skip('Unable to remove a stake greater than staked amount next epoch for a validator', function () {
      cy.staking_page_associate_tokens('3');
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

    it.skip('Disassociating all tokens - removes all staked tokens', function () {
      cy.staking_page_associate_tokens('3');
      cy.vega_wallet_check_unstaked_value_is('3.000000000000000000');

      cy.get('button').contains('Select a validator to nominate').click();
      cy.get(staking.validatorNames).contains(this.validatorName).click();

      cy.staking_validator_page_add_stake('2');
      cy.vega_wallet_check_unstaked_value_is('1.000000000000000000');
      cy.vega_wallet_check_validator_staked_value_is(
        this.validatorName,
        '2.000000000000000000'
      );
      cy.get(navigation.staking).first().click();
      cy.staking_page_disassociate_all_tokens();
      cy.ethereum_wallet_check_associated_vega_key_is_no_longer_showing(
        vegaWalletPublicKeyShort
      );
      cy.ethereum_wallet_check_associated_value_is('0.0');
      cy.vega_wallet_check_associated_value_is('0.000000000000000000');
      cy.vega_wallet_check_validator_no_longer_showing(this.validatorName);
    });

    it('Disassociating some tokens - prioritizes unstaked tokens', function () {
      cy.staking_page_associate_tokens('3');
      cy.vega_wallet_check_unstaked_value_is('3.000000000000000000');

      cy.get('button').contains('Select a validator to nominate').click();
      cy.get(staking.validatorNames).contains(this.validatorName).click();

      cy.staking_validator_page_add_stake('2');
      cy.vega_wallet_check_unstaked_value_is('1.000000000000000000');
      cy.vega_wallet_check_validator_staked_value_is(
        this.validatorName,
        '2.000000000000000000'
      );
      cy.get(navigation.staking).first().click();
      cy.staking_page_disassociate_tokens('1');
      cy.ethereum_wallet_check_associated_value_is('2.0');
      cy.vega_wallet_check_associated_value_is('2.000000000000000000');
      cy.vega_wallet_check_validator_staked_value_is(
        this.validatorName,
        '2.000000000000000000'
      );
    });
  });

  cy.staking_validator_page_check_stake_next_epoch_value = (expectedVal) => {
    cy.highlight(
      `Checking Staking Page - Validator Stake Next Epoch Value is ${expectedVal}`
    );
    cy.get(staking.stakeNextEpochValue, { timeout: 10000 })
      .contains(expectedVal, { timeout: 10000 })
      .should('be.visible');
  };

  cy.staking_validator_page_check_stake_this_epoch_value = (expectedVal) => {
    cy.highlight(
      `Checking Staking Page - Validator Stake This Epoch Value is ${expectedVal}`
    );
    cy.get(staking.stakeThisEpochValue, { timeout: 10000 })
      .contains(expectedVal, { timeout: 10000 })
      .should('be.visible');
  };

  cy.vega_wallet_check_validator_stake_next_epoch_value_is = (
    validatorName,
    expectedVal
  ) => {
    cy.highlight(
      `Checking vega wallet - Stake Next Epoch Value for ${validatorName} is ${expectedVal}`
    );
    cy.get(wallet.vegawallet).within(() => {
      cy.contains(`${validatorName} (Next epoch)`, { timeout: 40000 })
        .siblings()
        .contains(expectedVal, { timeout: 40000 })
        .should('be.visible');
    });
  };

  cy.vega_wallet_check_validator_stake_this_epoch_value_is = (
    validatorName,
    expectedVal
  ) => {
    cy.highlight(
      `Checking vega wallet - Stake This Epoch Value for ${validatorName} is ${expectedVal}`
    );
    cy.get(wallet.vegawallet).within(() => {
      cy.contains(`${validatorName} (This Epoch)`, { timeout: 40000 })
        .siblings()
        .contains(expectedVal, { timeout: 40000 })
        .should('be.visible');
    });
  };

  cy.vega_wallet_check_validator_no_longer_showing = (validatorName) => {
    cy.highlight(
      `Checking Validator and therefore stake removed for ${validatorName}`
    );
    cy.get(wallet.vegawallet).within(() => {
      cy.contains(`${validatorName}`, { timeout: 40000 }).should('not.exist', {
        timeout: 40000,
      });
    });
  };

  cy.vega_wallet_check_validator_staked_value_is = (
    validatorName,
    expectedVal
  ) => {
    cy.highlight(
      `Checking Validator Stake Value for ${validatorName} is ${expectedVal}`
    );
    cy.get(wallet.vegawallet).within(() => {
      cy.contains(`${validatorName}`, { timeout: 40000 })
        .siblings()
        .contains(expectedVal, { timeout: 40000 })
        .should('be.visible');
    });
  };
});
