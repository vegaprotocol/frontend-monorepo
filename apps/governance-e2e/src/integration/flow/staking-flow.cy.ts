/// <reference types="cypress" />
import {
  verifyUnstakedBalance,
  verifyStakedBalance,
  verifyEthWalletTotalAssociatedBalance,
  verifyEthWalletAssociatedBalance,
  waitForSpinner,
  navigateTo,
  navigation,
} from '../../support/common.functions';
import {
  clickOnValidatorFromList,
  closeStakingDialog,
  stakingPageAssociateTokens,
  stakingPageDisassociateAllTokens,
  stakingPageDisassociateTokens,
  stakingValidatorPageAddStake,
  stakingValidatorPageRemoveStake,
  validateValidatorListTotalStakeAndShare,
} from '../../support/staking.functions';
import { ethereumWalletConnect } from '../../support/wallet-eth.functions';
import {
  vegaWalletSetSpecifiedApprovalAmount,
  vegaWalletTeardown,
} from '../../support/wallet-teardown.functions';
const stakeValidatorListTotalStake = '[col-id="stake"] > div > span';
const stakeValidatorListTotalShare = '[col-id="stakeShare"] > div > span';
const stakeValidatorListValidatorStake = '[col-id="stake"] > div > span';
const stakeRemoveStakeRadioButton = '[data-testid="remove-stake-radio"]';
const stakeTokenAmountInputBox = '[data-testid="token-amount-input"]';
const stakeTokenSubmitButton = '[data-testid="token-input-submit-button"]';
const stakeAddStakeRadioButton = '[data-testid="add-stake-radio"]';
const stakeMaximumTokens = '[data-testid="token-amount-use-maximum"]';
const totalStake = '[data-testid="total-stake"]';
const stakeShare = '[data-testid="stake-percentage"]';
const vegaWalletPublicKeyShort = Cypress.env('vegaWalletPublicKeyShort');
const vegaWalletAssociatedBalance = '[data-testid="currency-value"]';
const vegaWalletStakedBalances =
  '[data-testid="vega-wallet-balance-staked-validators"]';
const ethWalletContainer = '[data-testid="ethereum-wallet"]';
const vegaWallet = '[data-testid="vega-wallet"]';
const txTimeout = Cypress.env('txTimeout');
const epochTimeout = Cypress.env('epochTimeout');

context(
  'Staking Tab - with eth and vega wallets connected',
  { tags: '@slow' },
  function () {
    // 2001-STKE-002, 2001-STKE-032
    before('visit staking tab and connect vega wallet', function () {
      cy.visit('/');
      vegaWalletSetSpecifiedApprovalAmount('1000');
      // this is a workaround for #2422 which can be removed once issue is resolved
      cy.associateTokenToVegaWallet();
    });

    describe('Eth wallet - contains VEGA tokens', function () {
      beforeEach(
        'teardown wallet & drill into a specific validator',
        function () {
          cy.reload();
          waitForSpinner();
          cy.connectVegaWallet();
          ethereumWalletConnect();
          vegaWalletTeardown();
          navigateTo(navigation.validators);
        }
      );

      it('Able to stake against a validator - using vega from wallet', function () {
        stakingPageAssociateTokens('3');
        verifyUnstakedBalance(3.0);
        verifyEthWalletTotalAssociatedBalance('3.0');
        verifyEthWalletAssociatedBalance('3.0');
        cy.get('button').contains('Select a validator to nominate').click();
        // 2001-STKE-031
        clickOnValidatorFromList(0);
        // 2001-STKE-033, 2001-STKE-034, 2001-STKE-037
        stakingValidatorPageAddStake('2');
        verifyUnstakedBalance(1.0);
        // 2001-STKE-039
        verifyStakedBalance(2.0);
        verifyNextEpochValue(2.0); // 2001-STKE-016 2001-STKE-038
        verifyThisEpochValue(2.0); // 2001-STKE-013
        closeStakingDialog();
        navigateTo(navigation.validators);

        // 2002-SINC-007
        validateValidatorListTotalStakeAndShare('0', '2.00', '100.00%');
      });

      it('Able to stake against a validator - using vega from vesting contract', function () {
        stakingPageAssociateTokens('3', { type: 'contract' });
        verifyUnstakedBalance(3.0);
        verifyEthWalletTotalAssociatedBalance('3.0');
        verifyEthWalletAssociatedBalance('3.0');
        cy.get('button').contains('Select a validator to nominate').click();
        clickOnValidatorFromList(0);
        stakingValidatorPageAddStake('2');
        verifyUnstakedBalance(1.0);
        verifyStakedBalance(2.0);
        verifyNextEpochValue(2.0);
        verifyThisEpochValue(2.0);
        closeStakingDialog();
        navigateTo(navigation.validators);
        validateValidatorListTotalStakeAndShare('0', '2.00', '100.00%');
      });

      it('Able to stake against a validator - using vega from both wallet and vesting contract', function () {
        stakingPageAssociateTokens('3', { type: 'contract' });
        navigateTo(navigation.validators);
        stakingPageAssociateTokens('4', { type: 'wallet' });
        verifyUnstakedBalance(7.0);
        verifyEthWalletTotalAssociatedBalance('3.0');
        verifyEthWalletTotalAssociatedBalance('4.0');
        verifyEthWalletTotalAssociatedBalance('3.0');
        verifyEthWalletTotalAssociatedBalance('4.0');
        cy.get('button').contains('Select a validator to nominate').click();
        clickOnValidatorFromList(0);
        stakingValidatorPageAddStake('6');
        verifyUnstakedBalance(1.0);
        verifyStakedBalance(6.0);
        verifyNextEpochValue(6.0);
        verifyThisEpochValue(6.0);
        closeStakingDialog();
        navigateTo(navigation.validators);
        validateValidatorListTotalStakeAndShare('0', '6.00', '100.00%');
      });

      it('Able to stake against multiple validators', function () {
        stakingPageAssociateTokens('5');
        verifyUnstakedBalance(5.0);
        cy.get('button').contains('Select a validator to nominate').click();
        clickOnValidatorFromList(0);
        stakingValidatorPageAddStake('2');
        verifyUnstakedBalance(3.0);
        cy.get(vegaWalletStakedBalances, txTimeout)
          .parent()
          .should('contain', 2.0, txTimeout);
        closeStakingDialog();
        navigateTo(navigation.validators);
        clickOnValidatorFromList(1);
        stakingValidatorPageAddStake('1');
        verifyUnstakedBalance(2.0);
        cy.get(vegaWalletStakedBalances, txTimeout)
          .should('have.length', 2, txTimeout)
          .eq(0)
          .should('contain', 2.0, txTimeout);
        cy.get(vegaWalletStakedBalances, txTimeout)
          .eq(1)
          .should('contain', 1.0, txTimeout);
        closeStakingDialog();
        navigateTo(navigation.validators);
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
          stakingPageAssociateTokens('4');
          verifyUnstakedBalance(4.0);
          cy.get('button').contains('Select a validator to nominate').click();
          clickOnValidatorFromList(0);
          stakingValidatorPageAddStake('3');
          verifyNextEpochValue(3.0);
          verifyUnstakedBalance(1.0);
          closeStakingDialog();
          navigateTo(navigation.validators);
          // 2001-STKE-040
          clickOnValidatorFromList(0);
          // 2001-STKE-044, 2001-STKE-048
          stakingValidatorPageRemoveStake('1');
          // 2001-STKE-049
          verifyNextEpochValue(2.0);
          verifyUnstakedBalance(2.0);
          verifyStakedBalance(2.0);
          verifyNextEpochValue(2.0);
          verifyThisEpochValue(2.0);
          cy.get(totalStake, epochTimeout).should('contain.text', '2');
          cy.get(stakeShare, epochTimeout).should('have.text', '100%');
          navigateTo(navigation.validators);
          validateValidatorListTotalStakeAndShare('0', '2.00', '100.00%');
        }
      );

      // 2001-STKE-045
      it('Able to remove a full stake against a validator', function () {
        stakingPageAssociateTokens('3');
        verifyUnstakedBalance(3.0);
        cy.get('button').contains('Select a validator to nominate').click();
        clickOnValidatorFromList(0);
        stakingValidatorPageAddStake('1');
        verifyUnstakedBalance(2.0);
        closeStakingDialog();
        navigateTo(navigation.validators);
        clickOnValidatorFromList(0);
        stakingValidatorPageRemoveStake('1');
        verifyNextEpochValue(0.0);
        verifyUnstakedBalance(3.0);
        verifyNextEpochValue(0.0);
        verifyThisEpochValue(0.0);
        cy.get(vegaWalletStakedBalances, txTimeout).should(
          'not.exist',
          txTimeout
        );
        navigateTo(navigation.validators);
        validateValidatorListTotalStakeAndShare('0', '0.00', '0.00%');
      });

      it('Unable to remove a stake with a negative value for a validator', function () {
        stakingPageAssociateTokens('3');
        verifyUnstakedBalance(3.0);
        cy.get('button').contains('Select a validator to nominate').click();
        clickOnValidatorFromList(0);
        stakingValidatorPageAddStake('2');
        verifyNextEpochValue(2.0);
        verifyUnstakedBalance(1.0);
        closeStakingDialog();
        navigateTo(navigation.validators);
        clickOnValidatorFromList(0);
        cy.get(stakeRemoveStakeRadioButton, txTimeout).click();
        cy.get(stakeTokenAmountInputBox).type('-0.1');
        cy.contains('Waiting for next epoch to start', epochTimeout);
        cy.get(stakeTokenSubmitButton)
          .should('be.disabled', epochTimeout)
          .and('contain', `Remove -0.1 $VEGA tokens at the end of epoch`)
          .and('be.visible');
      });

      it('Unable to remove a stake greater than staked amount next epoch for a validator', function () {
        stakingPageAssociateTokens('3');
        verifyUnstakedBalance(3.0);
        cy.get('button').contains('Select a validator to nominate').click();
        clickOnValidatorFromList(0);
        stakingValidatorPageAddStake('2');
        verifyNextEpochValue(2.0);
        verifyUnstakedBalance(3.0);
        closeStakingDialog();
        navigateTo(navigation.validators);
        clickOnValidatorFromList(0);
        cy.get(stakeRemoveStakeRadioButton).click();
        cy.get(stakeTokenAmountInputBox).type('4');
        cy.contains('Waiting for next epoch to start', epochTimeout);
        cy.get(stakeTokenSubmitButton)
          .should('be.disabled', epochTimeout)
          .and('contain', `Remove 4 $VEGA tokens at the end of epoch`)
          .and('be.visible');
      });

      it('Disassociating all wallet tokens max - removes all staked tokens', function () {
        stakingPageAssociateTokens('3');
        verifyUnstakedBalance(3.0);
        cy.get('button').contains('Select a validator to nominate').click();
        clickOnValidatorFromList(1);
        stakingValidatorPageAddStake('2');
        verifyUnstakedBalance(3.0);
        verifyStakedBalance(2.0);
        closeStakingDialog();
        stakingPageDisassociateAllTokens();
        cy.get(ethWalletContainer).within(() => {
          cy.contains(vegaWalletPublicKeyShort, txTimeout).should('not.exist');
        });
        verifyEthWalletTotalAssociatedBalance('0.0');
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
        navigateTo(navigation.validators);
        validateValidatorListTotalStakeAndShare('0', '0.00', '0.00%');
      });

      it('Disassociating all vesting contract tokens max - removes all staked tokens', function () {
        stakingPageAssociateTokens('3', { type: 'contract' });
        verifyUnstakedBalance(3.0);
        cy.get('button').contains('Select a validator to nominate').click();
        clickOnValidatorFromList(1);
        stakingValidatorPageAddStake('2');
        verifyUnstakedBalance(1.0);
        verifyStakedBalance(2.0);
        closeStakingDialog();
        stakingPageDisassociateAllTokens('contract');
        cy.get(ethWalletContainer).within(() => {
          cy.contains(vegaWalletPublicKeyShort, txTimeout).should('not.exist');
        });
        verifyEthWalletTotalAssociatedBalance('0.0');
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
        navigateTo(navigation.validators);
        validateValidatorListTotalStakeAndShare('0', '0.00', '0.00%');
      });

      it('Disassociating some tokens - prioritizes unstaked tokens', function () {
        stakingPageAssociateTokens('3');
        verifyUnstakedBalance(3.0);
        cy.get('button').contains('Select a validator to nominate').click();
        clickOnValidatorFromList(0);
        stakingValidatorPageAddStake('2');
        verifyUnstakedBalance(1.0);
        verifyStakedBalance(2.0);
        closeStakingDialog();
        stakingPageDisassociateTokens('1');
        verifyEthWalletTotalAssociatedBalance('2.0');
        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should(
            'contain',
            '2.00'
          );
        });
        verifyStakedBalance(2.0);
        navigateTo(navigation.validators);
        validateValidatorListTotalStakeAndShare('0', '2.00', '100.00%');
      });

      it('Associating wallet tokens - when some already staked - auto stakes tokens to staked validator', function () {
        // 2001-STKE-004
        stakingPageAssociateTokens('3');
        verifyUnstakedBalance(3.0);
        cy.get('button').contains('Select a validator to nominate').click();
        clickOnValidatorFromList(0);
        stakingValidatorPageAddStake('3');
        verifyStakedBalance(3.0);
        closeStakingDialog();
        stakingPageAssociateTokens('4');
        verifyUnstakedBalance(0.0);
        verifyStakedBalance(7.0);
      });

      it('Associating vesting contract tokens - when some already staked - auto stakes tokens to staked validator', function () {
        // 2001-STKE-004
        stakingPageAssociateTokens('3', { type: 'contract' });
        verifyUnstakedBalance(3.0);
        cy.get('button').contains('Select a validator to nominate').click();
        clickOnValidatorFromList(0);
        stakingValidatorPageAddStake('3');
        verifyStakedBalance(3.0);
        closeStakingDialog();
        stakingPageAssociateTokens('4', { type: 'contract' });
        verifyUnstakedBalance(0.0);
        verifyStakedBalance(7.0);
      });

      it('Associating vesting contract tokens - when wallet tokens already staked - auto stakes tokens to staked validator', function () {
        // 2001-STKE-004
        stakingPageAssociateTokens('3', { type: 'wallet' });
        verifyUnstakedBalance(3.0);
        cy.get('button').contains('Select a validator to nominate').click();
        clickOnValidatorFromList(0);
        stakingValidatorPageAddStake('3');
        verifyStakedBalance(3.0);
        closeStakingDialog();
        stakingPageAssociateTokens('4', { type: 'contract' });
        verifyUnstakedBalance(0.0);
        verifyStakedBalance(7.0);
      });

      it('Associating tokens - with multiple validators already staked - auto stakes to staked validators - abiding by existing stake ratio', function () {
        // 2001-STKE-004
        stakingPageAssociateTokens('6');
        verifyUnstakedBalance(6.0);
        cy.get('button').contains('Select a validator to nominate').click();
        clickOnValidatorFromList(0);
        stakingValidatorPageAddStake('2');
        verifyUnstakedBalance(0.0);
        closeStakingDialog();
        clickOnValidatorFromList(1);
        stakingValidatorPageAddStake('4');
        verifyUnstakedBalance(0.0);
        closeStakingDialog();
        stakingPageAssociateTokens('6');
        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should(
            'contain',
            '12.00'
          );
        });
        verifyStakedBalance(4.0);
        verifyStakedBalance(8.0);
        verifyUnstakedBalance(0.0);
      });

      it('Selecting use maximum where tokens are already staked - suggests the unstaked token amount', function () {
        stakingPageAssociateTokens('3');
        verifyUnstakedBalance(3.0);
        cy.get('button').contains('Select a validator to nominate').click();
        clickOnValidatorFromList(0);
        stakingValidatorPageAddStake('2');
        verifyUnstakedBalance(1.0);
        closeStakingDialog();
        clickOnValidatorFromList(0);
        cy.get(stakeAddStakeRadioButton).click();
        cy.get(stakeMaximumTokens, { timeout: 60000 }).click();
        cy.get(stakeTokenSubmitButton).should('contain', 'Add 1 $VEGA tokens');
      });

      after('Teardown Wallet', function () {
        vegaWalletTeardown();
      });

      function verifyNextEpochValue(amount: number) {
        cy.getByTestId('stake-next-epoch', epochTimeout)
          .contains(amount, epochTimeout)
          .should('be.visible');
      }

      function verifyThisEpochValue(amount: number) {
        cy.getByTestId('stake-this-epoch', epochTimeout) // 2001-STKE-013
          .contains(amount, epochTimeout)
          .should('be.visible');
      }
    });
  }
);
