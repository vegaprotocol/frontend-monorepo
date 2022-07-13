/// <reference types="cypress" />
const stakingPageLink = '[href="/staking"]';
const pageSpinner = 'splash-loader';
const menuBar = 'nav';
const validatorList = '[data-testid="node-list-item-name"]';
const validatorWithinList = '[data-testid="node-list-item"]';
const removeStakeRadioButton = '[data-testid="remove-stake-radio"]';
const tokenAmountInputBox = '[data-testid="token-amount-input"]';
const tokenSubmitButton = '[data-testid="token-input-submit-button"]';
const stakeNextEpochValue = '[data-testid="stake-next-epoch"]';
const vegaWalletPublicKeyShort = Cypress.env('vegaWalletPublicKeyShort');
const vegaWalletContainer = '[data-testid="vega-wallet"]';

context('Staking Flow - with eth and vega wallets connected', function () {
  before('visit staking tab and connect vega wallet', function () {
    cy.vega_wallet_import();
    cy.visit('/');
    cy.get(menuBar, { timeout: 20000 }).should('be.visible');
    cy.vega_wallet_connect();
    cy.vega_wallet_set_specified_approval_amount('1000');
    cy.reload();
    cy.get(menuBar, { timeout: 20000 }).should('be.visible');
    cy.ethereum_wallet_connect();
    cy.get(stakingPageLink).first().click();
    cy.get(pageSpinner, { timeout: 20000 }).should('not.exist');
    cy.get(validatorList).first().invoke('text').as('validatorName');
    cy.get(validatorList).last().invoke('text').as('otherValidatorName');
  });

  describe('Eth wallet - contains VEGA tokens', function () {
    beforeEach(
      'teardown wallet & drill into a specific validator',
      function () {
        cy.vega_wallet_teardown();
        cy.get(stakingPageLink).first().click();
      }
    );

    it.only('Able to stake against a validator', function () {
      cy.staking_page_associate_tokens('3');
      cy.vega_wallet_check_unstaked_value_is('3.000000000000000000');
      cy.ethereum_wallet_check_associated_value_is('3.0');
      cy.ethereum_wallet_check_associated_vega_key_value_is(
        vegaWalletPublicKeyShort,
        '3.000000000000000000'
      );

      cy.get('button').contains('Select a validator to nominate').click();
      cy.get(validatorList).contains(this.validatorName).click();

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
      cy.staking_validator_page_check_stake_this_epoch_value('2.0');
      cy.staking_validator_page_check_stake_next_epoch_value('2.0');
      cy.get(stakingPageLink).first().click();
      cy.staking_validator_page_get_specified_validator_value(
        this.validatorName,
        'Total stake'
      )
        .should('contain', '2.0')
        .and('contain', '100%');
    });

    it('Able to stake against mulitple validators', function () {
      cy.staking_page_associate_tokens('5');
      cy.vega_wallet_check_unstaked_value_is('5.000000000000000000');
      cy.get('button').contains('Select a validator to nominate').click();
      cy.get(validatorList).contains(this.validatorName).click();

      cy.staking_validator_page_add_stake('2');
      cy.vega_wallet_check_validator_staked_value_is(
        this.validatorName,
        '2.000000000000000000'
      );
      cy.get(stakingPageLink).first().click();
      cy.get(validatorList).contains(this.otherValidatorName).click();
      cy.staking_validator_page_add_stake('1');
      cy.vega_wallet_check_validator_staked_value_is(
        this.otherValidatorName,
        '1.000000000000000000'
      );
      cy.vega_wallet_check_unstaked_value_is('2.000000000000000000');
      cy.get(stakingPageLink).first().click();
      cy.staking_validator_page_get_specified_validator_value(
        this.validatorName,
        'Total stake'
      )
        .should('contain', '2.00')
        .and('contain', '66.67%');
      cy.staking_validator_page_get_specified_validator_value(
        this.otherValidatorName,
        'Total stake'
      )
        .should('contain', '1.00')
        .and('contain', '33.33%');
    });

    it('Able to remove part of a stake against a validator', function () {
      cy.staking_page_associate_tokens('4');
      cy.vega_wallet_check_unstaked_value_is('4.000000000000000000');

      cy.get('button').contains('Select a validator to nominate').click();
      cy.get(validatorList).contains(this.validatorName).click();

      cy.staking_validator_page_add_stake('3');
      cy.staking_validator_page_check_stake_next_epoch_value('3.0');
      cy.vega_wallet_check_validator_stake_next_epoch_value_is(
        this.validatorName,
        '3.000000000000000000'
      );
      cy.vega_wallet_check_unstaked_value_is('1.000000000000000000');

      cy.get(stakingPageLink).first().click();
      cy.get(validatorList).contains(this.validatorName).click();
      cy.staking_validator_page_check_stake_this_epoch_value('3.0');
      cy.staking_validator_page_remove_stake('1');
      cy.staking_validator_page_check_stake_next_epoch_value('2.0');
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
      cy.get(stakingPageLink).first().click();
      cy.staking_validator_page_get_specified_validator_value(
        this.validatorName,
        'Total stake'
      )
        .should('contain', '2.0')
        .and('contain', '100%');
    });

    it('Able to remove a full stake against a validator', function () {
      cy.staking_page_associate_tokens('3');
      cy.vega_wallet_check_unstaked_value_is('3.000000000000000000');

      cy.get('button').contains('Select a validator to nominate').click();
      cy.get(validatorList).contains(this.validatorName).click();

      cy.staking_validator_page_add_stake('1');
      cy.vega_wallet_check_validator_stake_next_epoch_value_is(
        this.validatorName,
        '1.000000000000000000'
      );
      cy.vega_wallet_check_unstaked_value_is('2.000000000000000000');

      cy.get(stakingPageLink).first().click();
      cy.get(validatorList).contains(this.validatorName).click();

      cy.staking_validator_page_remove_stake('1');
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
      cy.get(stakingPageLink).first().click();
      cy.staking_validator_page_get_specified_validator_value(
        this.validatorName,
        'Total stake'
      ).should('contain', '0.0');
    });

    it.skip('Unable to remove a stake with a negative value for a validator', function () {
      cy.staking_page_associate_tokens('3');
      cy.vega_wallet_check_unstaked_value_is('3.000000000000000000');

      cy.get('button').contains('Select a validator to nominate').click();
      cy.get(validatorList).contains(this.validatorName).click();

      cy.staking_validator_page_add_stake('2');
      cy.staking_validator_page_check_stake_next_epoch_value('2.0');
      cy.vega_wallet_check_validator_stake_next_epoch_value_is(
        this.validatorName,
        '2.000000000000000000'
      );
      cy.vega_wallet_check_unstaked_value_is('1.000000000000000000');

      cy.get(stakingPageLink).first().click();
      cy.get(validatorList).contains(this.validatorName).click();
      cy.get(removeStakeRadioButton).click({ force: true });
      cy.get(tokenAmountInputBox).type('-0.1');
      cy.contains('Waiting for next epoch to start', { timeout: 10000 });
      cy.get(tokenSubmitButton)
        .should('be.disabled', { timeout: 8000 })
        .and('contain', `Remove -0.1 $VEGA tokens at the end of epoch`)
        .and('be.visible');
    });

    it.skip('Unable to remove a stake greater than staked amount next epoch for a validator', function () {
      cy.staking_page_associate_tokens('3');
      cy.vega_wallet_check_unstaked_value_is('3.000000000000000000');

      cy.get('button').contains('Select a validator to nominate').click();
      cy.get(validatorList).contains(this.validatorName).click();

      cy.staking_validator_page_add_stake('2');
      cy.staking_validator_page_check_stake_next_epoch_value('2.0');
      cy.vega_wallet_check_validator_stake_next_epoch_value_is(
        this.validatorName,
        '2.000000000000000000'
      );
      cy.vega_wallet_check_unstaked_value_is('1.000000000000000000');

      cy.get(stakingPageLink).first().click();
      cy.get(validatorList).contains(this.validatorName).click();
      cy.get(removeStakeRadioButton).click({ force: true });
      cy.get(tokenAmountInputBox).type(4);
      cy.contains('Waiting for next epoch to start', { timeout: 10000 });
      cy.get(tokenSubmitButton)
        .should('be.disabled', { timeout: 8000 })
        .and('contain', `Remove 4 $VEGA tokens at the end of epoch`)
        .and('be.visible');
    });

    it.skip('Disassociating all tokens - removes all staked tokens', function () {
      cy.staking_page_associate_tokens('3');
      cy.vega_wallet_check_unstaked_value_is('3.000000000000000000');

      cy.get('button').contains('Select a validator to nominate').click();
      cy.get(validatorList).contains(this.validatorName).click();

      cy.staking_validator_page_add_stake('2');
      cy.vega_wallet_check_unstaked_value_is('1.000000000000000000');
      cy.vega_wallet_check_validator_staked_value_is(
        this.validatorName,
        '2.000000000000000000'
      );
      cy.get(stakingPageLink).first().click();
      cy.staking_page_disassociate_all_tokens();
      cy.ethereum_wallet_check_associated_vega_key_is_no_longer_showing(
        vegaWalletPublicKeyShort
      );
      cy.ethereum_wallet_check_associated_value_is('0.0');
      cy.vega_wallet_check_associated_value_is('0.000000000000000000');
      cy.vega_wallet_check_validator_no_longer_showing(this.validatorName);
      cy.get(stakingPageLink).first().click();
      cy.staking_validator_page_get_specified_validator_value(
        this.validatorName,
        'Total stake'
      ).should('contain', '0.0');
    });

    it('Disassociating some tokens - prioritizes unstaked tokens', function () {
      cy.staking_page_associate_tokens('3');
      cy.vega_wallet_check_unstaked_value_is('3.000000000000000000');

      cy.get('button').contains('Select a validator to nominate').click();
      cy.get(validatorList).contains(this.validatorName).click();

      cy.staking_validator_page_add_stake('2');
      cy.vega_wallet_check_unstaked_value_is('1.000000000000000000');
      cy.vega_wallet_check_validator_staked_value_is(
        this.validatorName,
        '2.000000000000000000'
      );
      cy.get(stakingPageLink).first().click();
      cy.staking_page_disassociate_tokens('1');
      cy.ethereum_wallet_check_associated_value_is('2.0');
      cy.vega_wallet_check_associated_value_is('2.000000000000000000');
      cy.vega_wallet_check_validator_staked_value_is(
        this.validatorName,
        '2.000000000000000000'
      );
      cy.get(stakingPageLink).first().click();
      cy.staking_validator_page_get_specified_validator_value(
        this.validatorName,
        'Total stake'
      )
        .should('contain', '2.0')
        .and('contain', '100%');
    });

    // after(
    //   'teardown wallet so state/results dont bleed into other test suites',
    //   function () {
    //     cy.vega_wallet_teardown();
    //   }
    // );
  });

  Cypress.Commands.add(
    'staking_validator_page_check_stake_next_epoch_value',
    (expectedVal) => {
      cy.highlight(
        `Checking Staking Page - Validator Stake Next Epoch Value is ${expectedVal}`
      );
      cy.get(stakeNextEpochValue, { timeout: 10000 })
        .contains(expectedVal, { timeout: 10000 })
        .should('be.visible');
    }
  );

  Cypress.Commands.add(
    'staking_validator_page_check_stake_this_epoch_value',
    (expectedVal) => {
      cy.highlight(
        `Checking Staking Page - Validator Stake This Epoch Value is ${expectedVal}`
      );
      cy.get(stakeNextEpochValue, { timeout: 10000 })
        .contains(expectedVal, { timeout: 10000 })
        .should('be.visible');
    }
  );

  Cypress.Commands.add(
    'staking_validator_page_get_specified_validator_value',
    (validatorName, label) => {
      cy.highlight(
        `Getting ${label} value for ${validatorName} - from validator list`
      );
      cy.get(validatorWithinList, { timeout: 10000 })
        .contains(validatorName)
        .parent()
        .contains(label)
        .siblings()
        .invoke('text');
    }
  );

  Cypress.Commands.add(
    'vega_wallet_check_validator_stake_next_epoch_value_is',
    (validatorName, expectedVal) => {
      cy.highlight(
        `Checking vega wallet - Stake Next Epoch Value for ${validatorName} is ${expectedVal}`
      );
      cy.get(vegaWalletContainer).within(() => {
        cy.contains(`${validatorName} (Next epoch)`, { timeout: 40000 })
          .siblings()
          .contains(expectedVal, { timeout: 40000 })
          .should('be.visible');
      });
    }
  );

  Cypress.Commands.add(
    'vega_wallet_check_validator_stake_this_epoch_value_is',
    (validatorName, expectedVal) => {
      cy.highlight(
        `Checking vega wallet - Stake This Epoch Value for ${validatorName} is ${expectedVal}`
      );
      cy.get(vegaWalletContainer).within(() => {
        cy.contains(`${validatorName} (This Epoch)`, { timeout: 40000 })
          .siblings()
          .contains(expectedVal, { timeout: 40000 })
          .should('be.visible');
      });
    }
  );

  Cypress.Commands.add(
    'vega_wallet_check_validator_no_longer_showing',
    (validatorName) => {
      cy.highlight(
        `Checking Validator and therefore stake removed for ${validatorName}`
      );
      cy.get(vegaWalletContainer).within(() => {
        cy.contains(`${validatorName}`, { timeout: 40000 }).should(
          'not.exist',
          {
            timeout: 40000,
          }
        );
      });
    }
  );

  Cypress.Commands.add(
    'vega_wallet_check_validator_staked_value_is',
    (validatorName, expectedVal) => {
      cy.highlight(
        `Checking Validator Stake Value for ${validatorName} is ${expectedVal}`
      );
      cy.get(vegaWalletContainer).within(() => {
        cy.contains(`${validatorName}`, { timeout: 40000 })
          .siblings()
          .contains(expectedVal, { timeout: 40000 })
          .should('be.visible');
      });
    }
  );
});
