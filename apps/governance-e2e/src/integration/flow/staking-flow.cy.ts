/// <reference types="cypress" />
import {
  verifyUnstakedBalance,
  verifyStakedBalance,
  verifyEthWalletTotalAssociatedBalance,
  verifyEthWalletAssociatedBalance,
  waitForSpinner,
  navigateTo,
  navigation,
  turnTelemetryOff,
} from '../../support/common.functions';
import {
  clickOnValidatorFromList,
  closeStakingDialog,
  ensureSpecifiedUnstakedTokensAreAssociated,
  stakingPageAssociateTokens,
  stakingPageDisassociateAllTokens,
  stakingPageDisassociateTokens,
  stakingValidatorPageAddStake,
  stakingValidatorPageRemoveStake,
  validateValidatorListTotalStakeAndShare,
  waitForBeginningOfEpoch,
} from '../../support/staking.functions';
import { ethereumWalletConnect } from '../../support/wallet-eth.functions';
import {
  vegaWalletSetSpecifiedApprovalAmount,
  vegaWalletTeardown,
} from '../../support/wallet-functions';
const stakeValidatorListTotalStake = 'total-stake';
const stakeValidatorListTotalShare = 'total-stake-share';
const stakeValidatorListStakePercentage = 'stake-percentage';
const userStakeBtn = 'my-stake-btn';
const userStake = 'user-stake';
const userStakeShare = 'user-stake-share';
const viewAllValidatorsToggle = 'validators-view-toggle-all';
const viewStakedByMeToggle = 'validators-view-toggle-myStake';
const stakeRemoveStakeRadioButton = 'remove-stake-radio';
const stakeTokenAmountInputBox = 'token-amount-input';
const stakeTokenSubmitButton = 'token-input-submit-button';
const stakeAddStakeRadioButton = 'add-stake-radio';
const stakeMaximumTokens = 'token-amount-use-maximum';
const vegaWalletAssociatedBalance = 'currency-value';
const vegaWalletStakedBalances = 'vega-wallet-balance-staked-validators';
const ethWallet = 'ethereum-wallet';
const vegaWallet = 'vega-wallet';
const vegaWalletPublicKeyShort = Cypress.env('vegaWalletPublicKeyShort');
const txTimeout = Cypress.env('txTimeout');
const epochTimeout = Cypress.env('epochTimeout');

const getEthereumWallet = () => cy.get(`[data-testid="${ethWallet}"]:visible`);
const getVegaWallet = () => cy.get(`[data-testid="${vegaWallet}"]:visible`);

context(
  'Staking Tab - with eth and vega wallets connected',
  { tags: '@slow' },
  function () {
    // 1002-STKE-002, 1002-STKE-032
    before('visit staking tab and connect vega wallet', function () {
      cy.visit('/');
      ethereumWalletConnect();
      vegaWalletSetSpecifiedApprovalAmount('1000');
    });

    describe('Eth wallet - contains VEGA tokens', function () {
      beforeEach(
        'teardown wallet & drill into a specific validator',
        function () {
          cy.clearLocalStorage();
          turnTelemetryOff();
          cy.reload();
          waitForSpinner();
          cy.connectVegaWallet();
          ethereumWalletConnect();
          navigateTo(navigation.validators);
        }
      );

      // 1002-STKE-035 1002-STKE-036
      it('Unable to stake against a validator with less than minimum and more than associated amount', function () {
        ensureSpecifiedUnstakedTokensAreAssociated('3');
        verifyUnstakedBalance(3.0);
        verifyEthWalletTotalAssociatedBalance('3.0');
        verifyEthWalletAssociatedBalance('3.0');
        cy.get('button').contains('Select a validator to nominate').click();
        clickOnValidatorFromList(0);
        cy.getByTestId(stakeAddStakeRadioButton, epochTimeout).click({
          force: true,
        });
        cy.getByTestId(stakeTokenAmountInputBox).type('0.001');
        cy.getByTestId(stakeTokenSubmitButton).should('be.disabled');
        cy.getByTestId(stakeTokenAmountInputBox).clear().type('4');
        cy.getByTestId(stakeTokenSubmitButton).should('be.disabled');
      });
      it('Able to stake against a validator - using vega from wallet', function () {
        ensureSpecifiedUnstakedTokensAreAssociated('3');
        verifyUnstakedBalance(3.0);
        verifyEthWalletTotalAssociatedBalance('3.0');
        verifyEthWalletAssociatedBalance('3.0');
        cy.get('button').contains('Select a validator to nominate').click();
        // 1002-STKE-031
        clickOnValidatorFromList(0);
        // 1002-STKE-033, 1002-STKE-034, 1002-STKE-037
        stakingValidatorPageAddStake('2');
        verifyUnstakedBalance(1.0);
        // 1002-STKE-039
        verifyStakedBalance(2.0);
        verifyNextEpochValue(2.0); // 1002-STKE-016 1002-STKE-038
        verifyThisEpochValue(2.0); // 1002-STKE-013
        closeStakingDialog();
        navigateTo(navigation.validators);

        // 2002-SINC-007 1002-STKE-015 1002-STKE-017 1002-STKE-052
        validateValidatorListTotalStakeAndShare('0', '3,002.00', '50.02%');
      });

      it('Able to view validators staked by me', function () {
        ensureSpecifiedUnstakedTokensAreAssociated('4');
        cy.get('button').contains('Select a validator to nominate').click();
        clickOnValidatorFromList(0);
        stakingValidatorPageAddStake('2');
        closeStakingDialog();
        navigateTo(navigation.validators);
        cy.getByTestId(userStake, epochTimeout)
          .first()
          .should('have.text', '2.00');
        waitForBeginningOfEpoch();
        cy.getByTestId('total-stake').first().realHover();
        cy.getByTestId('staked-by-user-tooltip')
          .first()
          .should('have.text', 'Staked by me: 2.00');
        cy.getByTestId('total-pending-stake').first().realHover();
        cy.getByTestId('pending-user-stake-tooltip')
          .first()
          .should('have.text', 'My pending stake: 0.00');
        cy.getByTestId(userStakeShare).invoke('text').should('not.be.empty'); // Adjust when #3286 is resolved
        cy.getByTestId(userStakeBtn).should('exist').click();
        verifyThisEpochValue(2.0);
        navigateTo(navigation.validators);
        cy.getByTestId(viewStakedByMeToggle).click();
        cy.getByTestId(userStakeBtn).should('have.length', 1);
        cy.getByTestId(viewAllValidatorsToggle).click();
        clickOnValidatorFromList(1);
        stakingValidatorPageAddStake('2');
        closeStakingDialog();
        navigateTo(navigation.validators);
        cy.getByTestId(viewStakedByMeToggle).click();
        cy.getByTestId(userStakeBtn).should('have.length', 2);
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
        validateValidatorListTotalStakeAndShare('0', '3,002.00', '50.02%');
      });

      it('Able to stake against a validator - using vega from both wallet and vesting contract', function () {
        vegaWalletTeardown();
        stakingPageAssociateTokens('3', { type: 'contract' });
        navigateTo(navigation.validators);
        stakingPageAssociateTokens('4', { type: 'wallet' });
        verifyUnstakedBalance(7.0);
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
        validateValidatorListTotalStakeAndShare('0', '3,006.00', '50.05%');
      });

      it('Able to stake against multiple validators', function () {
        vegaWalletTeardown();
        stakingPageAssociateTokens('5');
        verifyUnstakedBalance(5.0);
        cy.get('button').contains('Select a validator to nominate').click();
        clickOnValidatorFromList(0);
        stakingValidatorPageAddStake('2');
        verifyUnstakedBalance(3.0);
        cy.getByTestId(vegaWalletStakedBalances, txTimeout)
          .parent()
          .should('contain', 2.0, txTimeout);
        closeStakingDialog();
        navigateTo(navigation.validators);
        clickOnValidatorFromList(1);
        stakingValidatorPageAddStake('1');
        verifyUnstakedBalance(2.0);
        cy.getByTestId(vegaWalletStakedBalances, txTimeout)
          .should('have.length', 4, txTimeout)
          .eq(0)
          .should('contain', 2.0, txTimeout);
        cy.getByTestId(vegaWalletStakedBalances, txTimeout)
          .eq(1)
          .should('contain', 1.0, txTimeout);
        closeStakingDialog();
        navigateTo(navigation.validators);
        cy.get(`[row-id="${0}"]`)
          .eq(1)
          .within(() => {
            cy.getByTestId(stakeValidatorListTotalStake)
              .should('have.text', '3,002.00')
              .and('be.visible');
            cy.getByTestId(stakeValidatorListTotalShare)
              .should('have.text', '50.01%')
              .and('be.visible');
          });
        cy.get(`[row-id="${1}"]`)
          .eq(1)
          .within(() => {
            cy.getByTestId(stakeValidatorListTotalStake)
              .scrollIntoView()
              .should('have.text', '3,001.00')
              .and('be.visible');
            cy.getByTestId(stakeValidatorListTotalShare)
              .should('have.text', '49.99%')
              .and('be.visible');
          });
      });

      // 1002-STKE-041 1002-STKE-053
      it(
        'Able to remove part of a stake against a validator',
        { tags: '@smoke' },
        function () {
          ensureSpecifiedUnstakedTokensAreAssociated('4');
          navigateTo(navigation.validators);
          clickOnValidatorFromList(0);
          stakingValidatorPageAddStake('3');
          verifyNextEpochValue(3.0);
          verifyUnstakedBalance(1.0);
          closeStakingDialog();
          navigateTo(navigation.validators);
          // 1002-STKE-040
          clickOnValidatorFromList(0);
          // 1002-STKE-044, 1002-STKE-048
          stakingValidatorPageRemoveStake('1');
          // 1002-STKE-049
          verifyNextEpochValue(2.0);
          verifyUnstakedBalance(2.0);
          verifyStakedBalance(2.0);
          verifyNextEpochValue(2.0);
          verifyThisEpochValue(2.0);
          cy.getByTestId(stakeValidatorListTotalStake, epochTimeout).should(
            'contain.text',
            '2'
          );
          waitForBeginningOfEpoch();
          cy.getByTestId(stakeValidatorListStakePercentage).should(
            'have.text',
            '50.02%'
          );
          navigateTo(navigation.validators);
          validateValidatorListTotalStakeAndShare('0', '3,002.00', '50.02%');
        }
      );

      // 1002-STKE-045
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
        cy.getByTestId(vegaWalletStakedBalances, txTimeout).should(
          'not.exist',
          txTimeout
        );
        navigateTo(navigation.validators);
        validateValidatorListTotalStakeAndShare('0', '3,000.00', '50.00%');

        cy.getByTestId(userStakeBtn).should('not.exist');
        cy.getByTestId(userStake).should('not.exist');
        cy.getByTestId(userStakeShare).should('not.exist');
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
        cy.getByTestId(stakeRemoveStakeRadioButton, txTimeout).click();
        cy.getByTestId(stakeTokenAmountInputBox).type('-0.1');
        cy.contains('Waiting for next epoch to start', epochTimeout);
        cy.getByTestId(stakeTokenSubmitButton)
          .should('be.disabled', epochTimeout)
          .and('contain', `Remove -0.1 $VEGA tokens at the end of epoch`)
          .and('be.visible');
      });

      // 1002-STKE-046 1002-STKE-047
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
        cy.getByTestId(stakeRemoveStakeRadioButton).click();
        cy.getByTestId(stakeTokenAmountInputBox).type('4');
        cy.contains('Waiting for next epoch to start', epochTimeout);
        cy.getByTestId(stakeTokenSubmitButton)
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
        getEthereumWallet().within(() => {
          cy.contains(vegaWalletPublicKeyShort, txTimeout).should('not.exist');
        });
        verifyEthWalletTotalAssociatedBalance('0.0');
        getVegaWallet().within(() => {
          cy.getByTestId(vegaWalletAssociatedBalance, txTimeout).should(
            'contain',
            '0.00'
          );
        });
        cy.getByTestId(vegaWalletStakedBalances, txTimeout).should(
          'not.exist',
          txTimeout
        );
        navigateTo(navigation.validators);
        validateValidatorListTotalStakeAndShare('0', '3,000.00', '50.00%');
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
        getEthereumWallet().within(() => {
          cy.contains(vegaWalletPublicKeyShort, txTimeout).should('not.exist');
        });
        verifyEthWalletTotalAssociatedBalance('0.0');
        getVegaWallet().within(() => {
          cy.getByTestId(vegaWalletAssociatedBalance, txTimeout).should(
            'contain',
            '0.00'
          );
        });
        cy.getByTestId(vegaWalletStakedBalances, txTimeout).should(
          'not.exist',
          txTimeout
        );
        navigateTo(navigation.validators);
        validateValidatorListTotalStakeAndShare('0', '3,000.00', '50.00%');
      });

      it('Disassociating some tokens - prioritizes unstaked tokens', function () {
        vegaWalletSetSpecifiedApprovalAmount('1000');
        cy.reload();
        ethereumWalletConnect();
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
        getVegaWallet().within(() => {
          cy.getByTestId(vegaWalletAssociatedBalance, txTimeout).should(
            'contain',
            '2.00'
          );
        });
        verifyStakedBalance(2.0);
        navigateTo(navigation.validators);
        validateValidatorListTotalStakeAndShare('0', '3,002.00', '50.02%');
      });

      it('Associating wallet tokens - when some already staked - auto stakes tokens to staked validator', function () {
        // 1002-STKE-004
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
        // 1002-STKE-004
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
        // 1002-STKE-004
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
        // 1002-STKE-004
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
        getVegaWallet().within(() => {
          cy.getByTestId(vegaWalletAssociatedBalance, txTimeout).should(
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
        cy.getByTestId(stakeAddStakeRadioButton).click();
        cy.getByTestId(stakeMaximumTokens, { timeout: 60000 }).click();
        cy.getByTestId(stakeTokenSubmitButton).should(
          'contain',
          'Add 1 $VEGA tokens'
        );
      });

      afterEach('Teardown Wallet', function () {
        navigateTo(navigation.home);
        vegaWalletTeardown();
      });

      function verifyNextEpochValue(amount: number) {
        cy.getByTestId('stake-next-epoch', epochTimeout)
          .contains(amount, epochTimeout)
          .should('be.visible');
      }

      function verifyThisEpochValue(amount: number) {
        cy.getByTestId('stake-this-epoch', epochTimeout) // 1002-STKE-013
          .contains(amount, epochTimeout)
          .should('be.visible');
      }
    });
  }
);
