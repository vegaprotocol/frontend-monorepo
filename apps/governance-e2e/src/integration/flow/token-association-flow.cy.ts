import {
  verifyEthWalletTotalAssociatedBalance,
  verifyEthWalletAssociatedBalance,
  waitForSpinner,
  navigateTo,
  navigation,
  turnTelemetryOff,
} from '../../support/common.functions';
import {
  stakingPageAssociateTokens,
  stakingPageDisassociateAllTokens,
  stakingPageDisassociateTokens,
  validateWalletCurrency,
} from '../../support/staking.functions';
import { ethereumWalletConnect } from '../../support/wallet-eth.functions';
import {
  vegaWalletAssociate,
  vegaWalletDisassociate,
  vegaWalletSetSpecifiedApprovalAmount,
  vegaWalletTeardown,
} from '../../support/wallet-teardown.functions';

const ethWalletContainer = '[data-testid="ethereum-wallet"]';
const vegaWalletAssociatedBalance = '[data-testid="currency-value"]';
const vegaWalletUnstakedBalance =
  '[data-testid="vega-wallet-balance-unstaked"]';
const txTimeout = Cypress.env('txTimeout');
const vegaWalletPublicKeyShort = Cypress.env('vegaWalletPublicKeyShort');
const ethWalletAssociateButton = '[data-testid="associate-btn"]:visible';
const associateWalletRadioButton = '[data-testid="associate-radio-wallet"]';
const tokenAmountInputBox = '[data-testid="token-amount-input"]';
const tokenSubmitButton = '[data-testid="token-input-submit-button"]';
const ethWalletDissociateButton = '[href="/token/disassociate"]:visible';
const vestingContractSection = '[data-testid="vega-in-vesting-contract"]';
const vegaInWalletSection = '[data-testid="vega-in-wallet"]';
const connectedVegaKey = '[data-testid="connected-vega-key"]';
const associatedKey = '[data-testid="associated-key"]';
const associatedAmount = '[data-testid="associated-amount"]';
const associateCompleteText = '[data-testid="transaction-complete-body"]';
const disassociationWarning = '[data-testid="disassociation-warning"]';
const vegaWallet = 'aside [data-testid="vega-wallet"]';

context(
  'Token association flow - with eth and vega wallets connected',
  { tags: '@slow' },
  function () {
    before('visit staking tab and connect vega wallet', function () {
      cy.visit('/');
      // 0005-ETXN-001
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
          vegaWalletTeardown();
        }
      );

      it('Able to associate tokens - from wallet', function () {
        //1004-ASSO-003
        //1004-ASSO-005
        //1004-ASSO-009
        //1004-ASSO-030
        //1004-ASSO-012
        //1004-ASSO-013
        //1004-ASSO-014
        //1004-ASSO-015
        //1004-ASSO-030
        //0005-ETXN-006
        //0005-ETXN-003
        //0005-ETXN-005
        stakingPageAssociateTokens('2', { skipConfirmation: true });
        validateWalletCurrency('Associated', '0.00');
        validateWalletCurrency('Pending association', '2.00');
        validateWalletCurrency('Total associated after pending', '2.00');
        // 0005-ETXN-002
        verifyEthWalletAssociatedBalance('2.0');
        verifyEthWalletTotalAssociatedBalance('2.0');
        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should('contain', 2.0);
        });
        cy.get(vegaWalletUnstakedBalance, txTimeout).should('contain', 2.0);
      });

      it('Able to disassociate all associated tokens - manually', function () {
        // 1004-ASSO-025
        // 1004-ASSO-027
        // 1004-ASSO-028
        // 1004-ASSO-029
        // 1004-ASSO-031
        vegaWalletTeardown();
        stakingPageAssociateTokens('2');
        verifyEthWalletAssociatedBalance('2.0');
        verifyEthWalletTotalAssociatedBalance('6,002.00');
        cy.get('button').contains('Select a validator to nominate').click();
        cy.getByTestId('epoch-countdown').should('be.visible');
        stakingPageDisassociateTokens('2');
        validateWalletCurrency('Associated', '2.00');
        validateWalletCurrency('Pending association', '2.00');
        validateWalletCurrency('Total associated after pending', '0.00');
        cy.get(
          '[data-testid="eth-wallet-associated-balances"]:visible',
          txTimeout
        ).should('have.length', 2);
        verifyEthWalletTotalAssociatedBalance('6,000.00');
      });

      it('Able to associate more tokens than the approved amount of 1000 - requires re-approval', function () {
        //1004-ASSO-011
        stakingPageAssociateTokens('1001', { approve: true });
        verifyEthWalletAssociatedBalance('1,001.00');
        verifyEthWalletTotalAssociatedBalance('7,001.00');
        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should(
            'contain',
            '1,001.00'
          );
        });
      });

      it('Able to disassociate a partial amount of tokens currently associated', function () {
        stakingPageAssociateTokens('2');
        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should('contain', 2.0);
        });
        cy.get('button').contains('Select a validator to nominate').click();
        cy.getByTestId('epoch-countdown').should('be.visible');
        stakingPageDisassociateTokens('1');
        verifyEthWalletAssociatedBalance('1.0');
        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should('contain', 1.0);
        });
      });

      it('Able to disassociate all tokens - using max', function () {
        // 1004-ASSO-026
        const warningText =
          'Warning: Any tokens that have been nominated to a node will sacrifice rewards they are due for the current epoch. If you do not wish to sacrifice these, you should remove stake from a node at the end of an epoch before disassociation.';
        stakingPageAssociateTokens('2');
        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should('contain', 2.0);
        });
        cy.get('button').contains('Select a validator to nominate').click();
        cy.getByTestId('epoch-countdown').should('be.visible');
        cy.get(ethWalletDissociateButton).click();
        cy.get(disassociationWarning).should('contain', warningText);
        stakingPageDisassociateAllTokens();
        cy.get(ethWalletContainer)
          .first()
          .within(() => {
            cy.contains(vegaWalletPublicKeyShort, { timeout: 20000 }).should(
              'not.exist'
            );
          });
        cy.get(ethWalletContainer)
          .first()
          .within(() => {
            cy.contains(vegaWalletPublicKeyShort, { timeout: 20000 }).should(
              'not.exist'
            );
          });
        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should('contain', 0.0);
        });
      });

      it('Able to associate and disassociate vesting contract tokens', function () {
        // 1004-ASSO-006
        // 1004-ASSO-007
        // 1004-ASSO-018
        // 1004-ASSO-024
        // 1004-ASSO-023
        // 1004-ASSO-032

        stakingPageAssociateTokens('2', {
          type: 'contract',
          skipConfirmation: true,
        });
        validateWalletCurrency('Associated', '0.00');
        validateWalletCurrency('Pending association', '2.00');
        validateWalletCurrency('Total associated after pending', '2.00');
        verifyEthWalletAssociatedBalance('2.0');
        verifyEthWalletTotalAssociatedBalance('2.0');
        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should('contain', 2.0);
        });
        cy.get(vegaWalletUnstakedBalance, txTimeout).should('contain', 2.0);
        stakingPageDisassociateTokens('1', {
          type: 'contract',
          skipConfirmation: true,
        });
        validateWalletCurrency('Associated', '2.00');
        validateWalletCurrency('Pending association', '1.00');
        validateWalletCurrency('Total associated after pending', '1.00');
        verifyEthWalletAssociatedBalance('1.0');
        verifyEthWalletTotalAssociatedBalance('1.0');
      });

      it('Able to associate & disassociate both wallet and vesting contract tokens', function () {
        // 1004-ASSO-019
        // 1004-ASSO-020
        // 1004-ASSO-021
        // 1004-ASSO-022
        stakingPageAssociateTokens('21', { type: 'wallet' });
        cy.get('button').contains('Select a validator to nominate').click();
        cy.getByTestId('epoch-countdown').should('be.visible');
        stakingPageAssociateTokens('37', { type: 'contract' });
        cy.get(vestingContractSection)
          .first()
          .within(() => {
            cy.get(associatedKey).should(
              'contain',
              Cypress.env('vegaWalletPublicKeyShort')
            );
            cy.get(associatedAmount, txTimeout).should('contain', 37);
          });
        cy.get(vegaInWalletSection)
          .first()
          .within(() => {
            cy.get(associatedKey).should(
              'contain',
              Cypress.env('vegaWalletPublicKeyShort')
            );
            cy.get(associatedAmount, txTimeout).should('contain', 21);
          });
        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should('contain', 58);
        });
        stakingPageDisassociateTokens('6', { type: 'contract' });
        cy.get(vestingContractSection)
          .first()
          .within(() => {
            cy.get(associatedAmount, txTimeout).should('contain', 31);
          });
        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should('contain', 52);
        });
        navigateTo(navigation.validators);
        stakingPageDisassociateTokens('9', { type: 'wallet' });
        cy.get(vegaInWalletSection)
          .first()
          .within(() => {
            cy.get(associatedAmount, txTimeout).should('contain', 12);
          });
        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should('contain', 43);
        });
      });

      it('Not able to associate more tokens than owned', function () {
        // 1004-ASSO-008
        // 1004-ASSO-010
        // No warning visible as described in AC, but the button is disabled
        cy.get(ethWalletAssociateButton).click();
        cy.get(associateWalletRadioButton, { timeout: 30000 }).click();
        cy.get(tokenSubmitButton, txTimeout).should('be.disabled'); // button disabled with no input
        cy.get(tokenAmountInputBox, { timeout: 10000 }).type('6500000');
        cy.get(tokenSubmitButton, txTimeout).should('be.disabled');
      });

      // 1004-ASSO-004
      it('Pending association outside of app is shown', function () {
        vegaWalletAssociate('2');
        validateWalletCurrency('Associated', '0.00');
        validateWalletCurrency('Pending association', '2.00');
        validateWalletCurrency('Total associated after pending', '2.00');
        validateWalletCurrency('Associated', '2.00');
      });

      it('Disassociation outside of app is shown', function () {
        stakingPageAssociateTokens('2');
        cy.wrap(validateWalletCurrency('Associated', '2.00')).then(() => {
          vegaWalletDisassociate('2');
        });
        validateWalletCurrency('Associated', '2.00');
        validateWalletCurrency('Pending association', '2.00');
        validateWalletCurrency('Total associated after pending', '0.00');
        validateWalletCurrency('Associated', '0.00');
      });

      it('Able to associate tokens to different public key of connected vega wallet', function () {
        cy.get(ethWalletAssociateButton).click();
        cy.get(associateWalletRadioButton).click();
        cy.get(connectedVegaKey).should(
          'have.text',
          Cypress.env('vegaWalletPublicKey')
        );

        cy.get('[data-testid="manage-vega-wallet"]:visible').click();
        cy.get('[data-testid="select-keypair-button"]').eq(0).click();
        cy.get(connectedVegaKey).should(
          'have.text',
          Cypress.env('vegaWalletPublicKey2')
        );
        stakingPageAssociateTokens('2');
        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should('contain', 2.0);
        });
        cy.get(associateCompleteText).should(
          'have.text',
          `Vega key ${Cypress.env(
            'vegaWalletPublicKey2Short'
          )} can now participate in governance and nominate a validator with your associated $VEGA.`
        );
        stakingPageDisassociateAllTokens();
      });
    });
  }
);
