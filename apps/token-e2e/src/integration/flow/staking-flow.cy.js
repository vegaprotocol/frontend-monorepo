/// <reference types="cypress" />
const stakeValidatorListTotalStake = '[col-id="stake"] > div > span';
const stakeValidatorListTotalShare = '[col-id="stakeShare"] > div > span';
const stakeValidatorListValidatorStake = '[col-id="stake"] > div > span';
const stakeRemoveStakeRadioButton = '[data-testid="remove-stake-radio"]';
const stakeTokenAmountInputBox = '[data-testid="token-amount-input"]';
const stakeTokenSubmitButton = '[data-testid="token-input-submit-button"]';
const stakeNextEpochValue = '[data-testid="stake-next-epoch"]';
const stakeThisEpochValue = '[data-testid="stake-this-epoch"]';
const stakeAddStakeRadioButton = '[data-testid="add-stake-radio"]';
const stakeMaximumTokens = '[data-testid="token-amount-use-maximum"]';
const totalStake = '[data-testid="total-stake"]';
const stakeShare = '[data-testid="stake-percentage"]';
const vegaWalletPublicKeyShort = Cypress.env('vegaWalletPublicKeyShort');
const vegaWalletAssociatedBalance = '[data-testid="currency-value"]';
const vegaWalletUnstakedBalance =
  '[data-testid="vega-wallet-balance-unstaked"]';
const vegaWalletStakedBalances =
  '[data-testid="vega-wallet-balance-staked-validators"]';
const ethWalletAssociatedBalances =
  '[data-testid="eth-wallet-associated-balances"]';
const ethWalletTotalAssociatedBalance = '[data-testid="currency-locked"]';
const ethWalletContainer = '[data-testid="ethereum-wallet"]';
const vegaWallet = '[data-testid="vega-wallet"]';
const partValidatorId = '…';
const txTimeout = Cypress.env('txTimeout');
const epochTimeout = Cypress.env('epochTimeout');

context(
  'Staking Tab - with eth and vega wallets connected',
  { tags: '@slow' },
  function () {
    // 2001-STKE-002, 2001-STKE-032
    before('visit staking tab and connect vega wallet', function () {
      cy.visit('/');
      cy.vega_wallet_set_specified_approval_amount('1000');
    });

    describe('Eth wallet - contains VEGA tokens', function () {
      beforeEach(
        'teardown wallet & drill into a specific validator',
        function () {
          cy.reload();
          cy.wait_for_spinner();
          cy.connectVegaWallet();
          cy.ethereum_wallet_connect();
          cy.vega_wallet_teardown();
          cy.navigate_to('validators');
        }
      );

      it('Able to stake against a validator - using vega from wallet', function () {
        cy.staking_page_associate_tokens('3');

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          3.0,
          txTimeout
        );

        cy.get(ethWalletTotalAssociatedBalance, txTimeout)
          .contains('3.0', txTimeout)
          .should('be.visible');

        cy.get(ethWalletAssociatedBalances, txTimeout)
          .contains(vegaWalletPublicKeyShort, txTimeout)
          .parent()
          .should('contain', 3.0, txTimeout);

        cy.get('button').contains('Select a validator to nominate').click();

        // 2001-STKE-031
        cy.click_on_validator_from_list(0);

        // 2001-STKE-033, 2001-STKE-034, 2001-STKE-037
        cy.staking_validator_page_add_stake('2');

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          1.0,
          txTimeout
        );
        // 2001-STKE-039
        cy.get(vegaWalletStakedBalances, txTimeout)
          .should('contain', 2.0, txTimeout)
          .and('contain', partValidatorId);

        cy.get(stakeNextEpochValue, epochTimeout) // 2001-STKE-016 2001-STKE-038
          .contains(2.0, epochTimeout)
          .should('be.visible');

        cy.get(stakeThisEpochValue, epochTimeout) // 2001-STKE-013
          .contains(2.0, epochTimeout)
          .should('be.visible');

        cy.close_staking_dialog();
        cy.navigate_to('validators');

        // 2002-SINC-007
        cy.validate_validator_list_total_stake_and_share(
          '0',
          '2.00',
          '100.00%'
        );
      });

      it('Able to stake against a validator - using vega from vesting contract', function () {
        cy.staking_page_associate_tokens('3', { type: 'contract' });

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          3.0,
          txTimeout
        );

        cy.get(ethWalletTotalAssociatedBalance, txTimeout)
          .contains('3.0', txTimeout)
          .should('be.visible');

        cy.get(ethWalletAssociatedBalances, txTimeout)
          .contains(vegaWalletPublicKeyShort, txTimeout)
          .parent()
          .should('contain', 3.0, txTimeout);

        cy.get('button').contains('Select a validator to nominate').click();

        cy.click_on_validator_from_list(0);

        cy.staking_validator_page_add_stake('2');

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          1.0,
          txTimeout
        );

        cy.get(vegaWalletStakedBalances, txTimeout)
          .should('contain', 2.0, txTimeout)
          .and('contain', partValidatorId);

        cy.get(stakeNextEpochValue, epochTimeout)
          .contains(2.0, epochTimeout)
          .should('be.visible');

        cy.get(stakeThisEpochValue, epochTimeout)
          .contains(2.0, epochTimeout)
          .should('be.visible');

        cy.close_staking_dialog();
        cy.navigate_to('validators');

        cy.validate_validator_list_total_stake_and_share(
          '0',
          '2.00',
          '100.00%'
        );
      });

      it('Able to stake against a validator - using vega from both wallet and vesting contract', function () {
        cy.staking_page_associate_tokens('3', { type: 'contract' });
        cy.navigate_to('validators');
        cy.staking_page_associate_tokens('4', { type: 'wallet' });

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          7.0,
          txTimeout
        );

        cy.get(ethWalletTotalAssociatedBalance, txTimeout)
          .contains('3.0', txTimeout)
          .should('be.visible');

        cy.get(ethWalletTotalAssociatedBalance, txTimeout)
          .contains('4.0', txTimeout)
          .should('be.visible');

        cy.get(ethWalletAssociatedBalances, txTimeout).should(
          'contain',
          3.0,
          txTimeout
        );

        cy.get(ethWalletAssociatedBalances, txTimeout).should(
          'contain',
          4.0,
          txTimeout
        );

        cy.get('button').contains('Select a validator to nominate').click();

        cy.click_on_validator_from_list(0);

        cy.staking_validator_page_add_stake('6');

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          1.0,
          txTimeout
        );

        cy.get(vegaWalletStakedBalances, txTimeout)
          .should('contain', 6.0, txTimeout)
          .and('contain', partValidatorId);

        cy.get(stakeNextEpochValue, epochTimeout)
          .contains(6.0, epochTimeout)
          .should('be.visible');

        cy.get(stakeThisEpochValue, epochTimeout)
          .contains(6.0, epochTimeout)
          .should('be.visible');

        cy.close_staking_dialog();
        cy.navigate_to('validators');

        cy.validate_validator_list_total_stake_and_share(
          '0',
          '6.00',
          '100.00%'
        );
      });

      it('Able to stake against multiple validators', function () {
        cy.staking_page_associate_tokens('5');

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          5.0,
          txTimeout
        );

        cy.get('button').contains('Select a validator to nominate').click();

        cy.click_on_validator_from_list(0);

        cy.staking_validator_page_add_stake('2');

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          3.0,
          txTimeout
        );

        cy.get(vegaWalletStakedBalances, txTimeout)
          .parent()
          .should('contain', 2.0, txTimeout);

        cy.close_staking_dialog();
        cy.navigate_to('validators');

        cy.click_on_validator_from_list(1);

        cy.staking_validator_page_add_stake('1');

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          2.0,
          txTimeout
        );

        cy.get(vegaWalletStakedBalances, txTimeout)
          .should('have.length', 2, txTimeout)
          .eq(0)
          .should('contain', 2.0, txTimeout);

        cy.get(vegaWalletStakedBalances, txTimeout)
          .eq(1)
          .should('contain', 1.0, txTimeout);

        cy.close_staking_dialog();
        cy.navigate_to('validators');

        cy.get(`[row-id="${0}"]`).within(() => {
          cy.get(stakeValidatorListTotalStake)
            .should('have.text', '2.00')
            .and('be.visible');
          cy.get(stakeValidatorListTotalShare)
            .should('have.text', '66.67%')
            .and('be.visible');
          cy.get(stakeValidatorListValidatorStake)
            .scrollIntoView()
            .should('have.text', '2.00')
            .and('be.visible');
        });

        cy.get(`[row-id="${1}"]`).within(() => {
          cy.get(stakeValidatorListTotalStake)
            .scrollIntoView()
            .should('have.text', '1.00')
            .and('be.visible');
          cy.get(stakeValidatorListTotalShare)
            .should('have.text', '33.33%')
            .and('be.visible');
          cy.get(stakeValidatorListValidatorStake)
            .scrollIntoView()
            .should('have.text', '1.00')
            .and('be.visible');
        });
      });

      // 2001-STKE-041
      it(
        'Able to remove part of a stake against a validator',
        { tags: '@smoke' },
        function () {
          cy.staking_page_associate_tokens('4');

          cy.get(vegaWalletUnstakedBalance, txTimeout).should(
            'contain',
            4.0,
            txTimeout
          );

          cy.get('button').contains('Select a validator to nominate').click();

          cy.click_on_validator_from_list(0);

          cy.staking_validator_page_add_stake('3');

          cy.get(stakeNextEpochValue, epochTimeout)
            .contains(3.0, epochTimeout)
            .should('be.visible');

          cy.get(vegaWalletUnstakedBalance, txTimeout).should(
            'contain',
            1.0,
            txTimeout
          );

          cy.close_staking_dialog();
          cy.navigate_to('validators');
          // 2001-STKE-040
          cy.click_on_validator_from_list(0);

          // 2001-STKE-044, 2001-STKE-048
          cy.staking_validator_page_remove_stake('1');

          // 2001-STKE-049
          cy.get(stakeNextEpochValue, epochTimeout).contains(2.0, epochTimeout);

          cy.get(vegaWalletUnstakedBalance, txTimeout).should(
            'contain',
            2.0,
            txTimeout
          );

          cy.get(vegaWalletStakedBalances, txTimeout).should(
            'contain',
            2.0,
            txTimeout
          );

          cy.get(stakeNextEpochValue, epochTimeout)
            .contains(2.0, epochTimeout)
            .should('be.visible');

          cy.get(stakeThisEpochValue, epochTimeout)
            .contains(2.0, epochTimeout)
            .should('be.visible');

          cy.get(totalStake, epochTimeout).should('contain.text', '2');
          cy.get(stakeShare, epochTimeout).should('have.text', '100%');

          cy.navigate_to('validators');

          cy.validate_validator_list_total_stake_and_share(
            '0',
            '2.00',
            '100.00%'
          );
        }
      );

      // 2001-STKE-045
      it('Able to remove a full stake against a validator', function () {
        cy.staking_page_associate_tokens('3');

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          3.0,
          txTimeout
        );

        cy.get('button').contains('Select a validator to nominate').click();

        cy.click_on_validator_from_list(0);

        cy.staking_validator_page_add_stake('1');

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          2.0,
          txTimeout
        );

        cy.close_staking_dialog();
        cy.navigate_to('validators');

        cy.click_on_validator_from_list('0');

        cy.staking_validator_page_remove_stake('1');

        cy.get(stakeNextEpochValue, epochTimeout)
          .contains(0.0, epochTimeout)
          .should('be.visible');

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          3.0,
          txTimeout
        );

        cy.get(stakeNextEpochValue, epochTimeout)
          .contains(0.0, epochTimeout)
          .should('be.visible');

        cy.get(stakeThisEpochValue, epochTimeout)
          .contains(0.0, epochTimeout)
          .should('be.visible');

        cy.get(vegaWalletStakedBalances, txTimeout).should(
          'not.exist',
          txTimeout
        );

        cy.navigate_to('validators');

        cy.validate_validator_list_total_stake_and_share('0', '0.00', '0.00%');
      });

      it('Unable to remove a stake with a negative value for a validator', function () {
        cy.staking_page_associate_tokens('3');

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          3.0,
          txTimeout
        );

        cy.get('button').contains('Select a validator to nominate').click();

        cy.click_on_validator_from_list(0);

        cy.staking_validator_page_add_stake('2');

        cy.get(stakeNextEpochValue, epochTimeout)
          .contains(2.0, epochTimeout)
          .should('be.visible');

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          1.0,
          txTimeout
        );

        cy.close_staking_dialog();
        cy.navigate_to('validators');

        cy.click_on_validator_from_list(0);

        cy.get(stakeRemoveStakeRadioButton, txTimeout).click();

        cy.get(stakeTokenAmountInputBox).type('-0.1');

        cy.contains('Waiting for next epoch to start', epochTimeout);

        cy.get(stakeTokenSubmitButton)
          .should('be.disabled', epochTimeout)
          .and('contain', `Remove -0.1 $VEGA tokens at the end of epoch`)
          .and('be.visible');
      });

      it('Unable to remove a stake greater than staked amount next epoch for a validator', function () {
        cy.staking_page_associate_tokens('3');

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          3.0,
          txTimeout
        );

        cy.get('button').contains('Select a validator to nominate').click();

        cy.click_on_validator_from_list(0);

        cy.staking_validator_page_add_stake('2');

        cy.get(stakeNextEpochValue, epochTimeout)
          .contains(2.0, epochTimeout)
          .should('be.visible');

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          1.0,
          txTimeout
        );

        cy.close_staking_dialog();
        cy.navigate_to('validators');

        cy.click_on_validator_from_list(0);

        cy.get(stakeRemoveStakeRadioButton).click();

        cy.get(stakeTokenAmountInputBox).type(4);

        cy.contains('Waiting for next epoch to start', epochTimeout);

        cy.get(stakeTokenSubmitButton)
          .should('be.disabled', epochTimeout)
          .and('contain', `Remove 4 $VEGA tokens at the end of epoch`)
          .and('be.visible');
      });

      it('Disassociating all wallet tokens max - removes all staked tokens', function () {
        cy.staking_page_associate_tokens('3');

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          3.0,
          txTimeout
        );

        cy.get('button').contains('Select a validator to nominate').click();

        cy.click_on_validator_from_list('1');

        cy.staking_validator_page_add_stake('2');

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          1.0,
          txTimeout
        );

        cy.get(vegaWalletStakedBalances, txTimeout).should(
          'contain',
          2.0,
          txTimeout
        );

        cy.close_staking_dialog();
        cy.staking_page_disassociate_all_tokens('wallet');

        cy.get(ethWalletContainer).within(() => {
          cy.contains(vegaWalletPublicKeyShort, txTimeout).should('not.exist');
        });

        cy.get(ethWalletTotalAssociatedBalance, txTimeout)
          .contains('0.0', txTimeout)
          .should('be.visible');

        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should(
            'contain',
            '0.00'
          );
        });

        cy.get(vegaWalletStakedBalances, txTimeout).should(
          'not.exist',
          txTimeout
        );

        cy.navigate_to('validators');

        cy.validate_validator_list_total_stake_and_share('0', '0.00', '0.00%');
      });

      it('Disassociating all vesting contract tokens max - removes all staked tokens', function () {
        cy.staking_page_associate_tokens('3', { type: 'contract' });

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          3.0,
          txTimeout
        );

        cy.get('button').contains('Select a validator to nominate').click();

        cy.click_on_validator_from_list('1');

        cy.staking_validator_page_add_stake('2');

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          1.0,
          txTimeout
        );

        cy.get(vegaWalletStakedBalances, txTimeout).should(
          'contain',
          2.0,
          txTimeout
        );
        cy.close_staking_dialog();
        cy.staking_page_disassociate_all_tokens('contract');

        cy.get(ethWalletContainer).within(() => {
          cy.contains(vegaWalletPublicKeyShort, txTimeout).should('not.exist');
        });

        cy.get(ethWalletTotalAssociatedBalance, txTimeout)
          .contains('0.0', txTimeout)
          .should('be.visible');

        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should(
            'contain',
            '0.00'
          );
        });

        cy.get(vegaWalletStakedBalances, txTimeout).should(
          'not.exist',
          txTimeout
        );

        cy.navigate_to('validators');

        cy.validate_validator_list_total_stake_and_share('0', '0.00', '0.00%');
      });

      it('Disassociating some tokens - prioritizes unstaked tokens', function () {
        cy.staking_page_associate_tokens('3');

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          3.0,
          txTimeout
        );

        cy.get('button').contains('Select a validator to nominate').click();
        cy.click_on_validator_from_list(0);

        cy.staking_validator_page_add_stake('2');
        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          1.0,
          txTimeout
        );

        cy.get(vegaWalletStakedBalances, txTimeout).should(
          'contain',
          2.0,
          txTimeout
        );
        cy.close_staking_dialog();
        cy.staking_page_disassociate_tokens('1');

        cy.get(ethWalletTotalAssociatedBalance, txTimeout)
          .contains('2.0', txTimeout)
          .should('be.visible');

        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should(
            'contain',
            '2.00'
          );
        });

        cy.get(vegaWalletStakedBalances, txTimeout)
          .should('contain', 2.0, txTimeout)
          .and('contain', partValidatorId);

        cy.navigate_to('validators');

        cy.validate_validator_list_total_stake_and_share(
          '0',
          '2.00',
          '100.00%'
        );
      });

      it('Associating wallet tokens - when some already staked - auto stakes tokens to staked validator', function () {
        // 2001-STKE-004
        cy.staking_page_associate_tokens('3');

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          3.0,
          txTimeout
        );

        cy.get('button').contains('Select a validator to nominate').click();
        cy.click_on_validator_from_list(0);

        cy.staking_validator_page_add_stake('3');

        cy.get(vegaWalletStakedBalances, txTimeout).should(
          'contain',
          3.0,
          txTimeout
        );
        cy.close_staking_dialog();
        cy.staking_page_associate_tokens('4');

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          0.0,
          txTimeout
        );

        cy.get(vegaWalletStakedBalances, txTimeout).should(
          'contain',
          7.0,
          txTimeout
        );
      });

      it('Associating vesting contract tokens - when some already staked - auto stakes tokens to staked validator', function () {
        // 2001-STKE-004
        cy.staking_page_associate_tokens('3', { type: 'contract' });

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          3.0,
          txTimeout
        );

        cy.get('button').contains('Select a validator to nominate').click();
        cy.click_on_validator_from_list(0);

        cy.staking_validator_page_add_stake('3');

        cy.get(vegaWalletStakedBalances, txTimeout).should(
          'contain',
          3.0,
          txTimeout
        );
        cy.close_staking_dialog();
        cy.staking_page_associate_tokens('4', { type: 'contract' });

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          0.0,
          txTimeout
        );

        cy.get(vegaWalletStakedBalances, txTimeout).should(
          'contain',
          7.0,
          txTimeout
        );
      });

      it('Associating vesting contract tokens - when wallet tokens already staked - auto stakes tokens to staked validator', function () {
        // 2001-STKE-004
        cy.staking_page_associate_tokens('3', { type: 'wallet' });

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          3.0,
          txTimeout
        );

        cy.get('button').contains('Select a validator to nominate').click();
        cy.click_on_validator_from_list(0);

        cy.staking_validator_page_add_stake('3');

        cy.get(vegaWalletStakedBalances, txTimeout).should(
          'contain',
          3.0,
          txTimeout
        );
        cy.close_staking_dialog();
        cy.staking_page_associate_tokens('4', { type: 'contract' });

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          0.0,
          txTimeout
        );

        cy.get(vegaWalletStakedBalances, txTimeout).should(
          'contain',
          7.0,
          txTimeout
        );
      });

      it('Associating tokens - with multiple validators already staked - auto stakes to staked validators - abiding by existing stake ratio', function () {
        // 2001-STKE-004
        cy.staking_page_associate_tokens('6');

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          6.0,
          txTimeout
        );

        cy.get('button').contains('Select a validator to nominate').click();
        cy.click_on_validator_from_list(0);

        cy.staking_validator_page_add_stake('2');

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          0.0,
          txTimeout
        );
        cy.close_staking_dialog();

        cy.click_on_validator_from_list(1);

        cy.staking_validator_page_add_stake('4');

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          0.0,
          txTimeout
        );
        cy.close_staking_dialog();
        cy.staking_page_associate_tokens('6');

        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should(
            'contain',
            '12.00'
          );
        });

        cy.get(vegaWalletStakedBalances, txTimeout)
          .should('contain', '4.0', txTimeout)
          .and('contain', partValidatorId);

        cy.get(vegaWalletStakedBalances, txTimeout)
          .should('contain', '8.0')
          .and('contain', partValidatorId);

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          0.0,
          txTimeout
        );
      });

      it('Selecting use maximum where tokens are already staked - suggests the unstaked token amount', function () {
        cy.staking_page_associate_tokens('3');

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          3.0,
          txTimeout
        );

        cy.get('button').contains('Select a validator to nominate').click();
        cy.click_on_validator_from_list(0);

        cy.staking_validator_page_add_stake('2');

        cy.get(vegaWalletUnstakedBalance, txTimeout).should(
          'contain',
          1.0,
          txTimeout
        );
        cy.close_staking_dialog();

        cy.click_on_validator_from_list(0);

        cy.get(stakeAddStakeRadioButton).click();

        cy.get(stakeMaximumTokens, { timeout: 60000 }).click();

        cy.get(stakeTokenSubmitButton).should('contain', 'Add 1 $VEGA tokens');
      });
    });
  }
);
