import {
  verifyEthWalletTotalAssociatedBalance,
  verifyEthWalletAssociatedBalance,
  waitForSpinner,
} from '../../support/common.functions';

const ethWalletContainer = '[data-testid="ethereum-wallet"]';
const vegaWalletAssociatedBalance = '[data-testid="currency-value"]';
const vegaWalletUnstakedBalance =
  '[data-testid="vega-wallet-balance-unstaked"]';
const txTimeout = Cypress.env('txTimeout');
const vegaWalletPublicKeyShort = Cypress.env('vegaWalletPublicKeyShort');
const ethWalletAssociateButton = '[href="/token/associate"]';
const associateWalletRadioButton = '[data-testid="associate-radio-wallet"]';
const tokenAmountInputBox = '[data-testid="token-amount-input"]';
const tokenSubmitButton = '[data-testid="token-input-submit-button"]';
const ethWalletDissociateButton = '[href="/token/disassociate"]';
const vestingContractSection = '[data-testid="vega-in-vesting-contract"]';
const vegaInWalletSection = '[data-testid="vega-in-wallet"]';
const connectedVegaKey = '[data-testid="connected-vega-key"]';
const associatedKey = '[data-testid="associated-key"]';
const associatedAmount = '[data-testid="associated-amount"]';
const associateCompleteText = '[data-testid="transaction-complete-body"]';
const disassociationWarning = '[data-testid="disassociation-warning"]';
const vegaWallet = '[data-testid="vega-wallet"]';

context(
  'Token association flow - with eth and vega wallets connected',
  { tags: '@slow' },
  function () {
    before('visit staking tab and connect vega wallet', function () {
      cy.visit('/');
      // 0005-ETXN-001
      cy.vega_wallet_set_specified_approval_amount('1000');
    });

    describe('Eth wallet - contains VEGA tokens', function () {
      beforeEach(
        'teardown wallet & drill into a specific validator',
        function () {
          cy.reload();
          waitForSpinner();
          cy.ethereum_wallet_connect();
          cy.connectVegaWallet();
          cy.vega_wallet_teardown();
          cy.navigate_to('validators');
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
        cy.staking_page_associate_tokens('2', { skipConfirmation: true });

        cy.getByTestId('currency-title', txTimeout).should(
          'have.length.above',
          3
        );
        cy.validate_wallet_currency('Associated', '0.00');
        cy.validate_wallet_currency('Pending association', '2.00');
        cy.validate_wallet_currency('Total associated after pending', '2.00');
        cy.getByTestId('currency-title', txTimeout).should('have.length', 3);

        // 0005-ETXN-002
        verifyEthWalletAssociatedBalance(2.0);

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

        cy.staking_page_associate_tokens('2');
        verifyEthWalletAssociatedBalance(2.0);
        verifyEthWalletTotalAssociatedBalance('2.0');
        cy.get('button').contains('Select a validator to nominate').click();
        cy.staking_page_disassociate_tokens('2');
        cy.getByTestId('currency-title', txTimeout).should(
          'have.length.above',
          3
        );
        cy.validate_wallet_currency('Associated', '2.00');
        cy.validate_wallet_currency('Pending association', '2.00');
        cy.validate_wallet_currency('Total associated after pending', '0.00');
        cy.getByTestId('currency-title', txTimeout).should('have.length', 3);
        cy.getByTestId('eth-wallet-associated-balances', txTimeout).should(
          'not.exist'
        );
        verifyEthWalletTotalAssociatedBalance('0.00');
      });

      it('Able to associate more tokens than the approved amount of 1000 - requires re-approval', function () {
        //1004-ASSO-011
        cy.staking_page_associate_tokens('1001', { approve: true });
        verifyEthWalletAssociatedBalance('1,001.00');
        verifyEthWalletTotalAssociatedBalance('1,001.00');
        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should(
            'contain',
            '1,001.00'
          );
        });
      });

      it('Able to disassociate a partial amount of tokens currently associated', function () {
        cy.staking_page_associate_tokens('2');
        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should('contain', 2.0);
        });

        cy.get('button').contains('Select a validator to nominate').click();
        cy.staking_page_disassociate_tokens('1');
        verifyEthWalletAssociatedBalance(1.0);
        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should('contain', 1.0);
        });
      });

      it('Able to disassociate all tokens - using max', function () {
        // 1004-ASSO-026
        const warningText =
          'Warning: Any tokens that have been nominated to a node will sacrifice rewards they are due for the current epoch. If you do not wish to sacrifice these, you should remove stake from a node at the end of an epoch before disassociation.';
        cy.staking_page_associate_tokens('2');
        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should('contain', 2.0);
        });
        cy.get('button').contains('Select a validator to nominate').click();
        cy.get(ethWalletDissociateButton).click();
        cy.get(disassociationWarning).should('contain', warningText);
        cy.staking_page_disassociate_all_tokens();
        cy.get(ethWalletContainer).within(() => {
          cy.contains(vegaWalletPublicKeyShort, { timeout: 20000 }).should(
            'not.exist'
          );
        });
        cy.get(ethWalletContainer).within(() => {
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

        cy.staking_page_associate_tokens('2', {
          type: 'contract',
          skipConfirmation: true,
        });

        cy.getByTestId('currency-title', txTimeout).should(
          'have.length.above',
          3
        );
        cy.validate_wallet_currency('Associated', '0.00');
        cy.validate_wallet_currency('Pending association', '2.00');
        cy.validate_wallet_currency('Total associated after pending', '2.00');
        cy.getByTestId('currency-title', txTimeout).should('have.length', 3);
        verifyEthWalletAssociatedBalance(2.0);
        verifyEthWalletTotalAssociatedBalance('2.0');
        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should('contain', 2.0);
        });
        cy.get(vegaWalletUnstakedBalance, txTimeout).should('contain', 2.0);
        cy.staking_page_disassociate_tokens('1', {
          type: 'contract',
          skipConfirmation: true,
        });
        cy.getByTestId('currency-title', txTimeout).should(
          'have.length.above',
          3
        );
        cy.validate_wallet_currency('Associated', '2.00');
        cy.validate_wallet_currency('Pending association', '1.00');
        cy.validate_wallet_currency('Total associated after pending', '1.00');
        cy.getByTestId('currency-title', txTimeout).should('have.length', 3);
        verifyEthWalletAssociatedBalance(1.0);
        verifyEthWalletTotalAssociatedBalance('1.0');
      });

      it('Able to associate & disassociate both wallet and vesting contract tokens', function () {
        // 1004-ASSO-019
        // 1004-ASSO-020
        // 1004-ASSO-021
        // 1004-ASSO-022
        cy.staking_page_associate_tokens('21', { type: 'wallet' });
        cy.get('button').contains('Select a validator to nominate').click();
        cy.staking_page_associate_tokens('37', { type: 'contract' });
        cy.get(vestingContractSection).within(() => {
          cy.get(associatedKey).should(
            'contain',
            Cypress.env('vegaWalletPublicKeyShort')
          );
          cy.get(associatedAmount, txTimeout).should('contain', 37);
        });
        cy.get(vegaInWalletSection).within(() => {
          cy.get(associatedKey).should(
            'contain',
            Cypress.env('vegaWalletPublicKeyShort')
          );
          cy.get(associatedAmount, txTimeout).should('contain', 21);
        });
        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should('contain', 58);
        });
        cy.staking_page_disassociate_tokens('6', { type: 'contract' });
        cy.get(vestingContractSection).within(() => {
          cy.get(associatedAmount, txTimeout).should('contain', 31);
        });
        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should('contain', 52);
        });
        cy.navigate_to('validators');
        cy.staking_page_disassociate_tokens('9', { type: 'wallet' });
        cy.get(vegaInWalletSection).within(() => {
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
        cy.get(ethWalletAssociateButton).first().click();
        cy.get(associateWalletRadioButton, { timeout: 30000 }).click();
        cy.get(tokenSubmitButton, txTimeout).should('be.disabled'); // button disabled with no input
        cy.get(tokenAmountInputBox, { timeout: 10000 }).type(6500000);
        cy.get(tokenSubmitButton, txTimeout).should('be.disabled');
      });

      // 1004-ASSO-004

      it('Pending association outside of app is shown', function () {
        cy.vega_wallet_associate('2');
        cy.getByTestId('currency-title', txTimeout).should(
          'have.length.above',
          3
        );
        cy.validate_wallet_currency('Associated', '0.00');
        cy.validate_wallet_currency('Pending association', '2.00');
        cy.validate_wallet_currency('Total associated after pending', '2.00');
        cy.getByTestId('currency-title', txTimeout).should('have.length', 3);
        cy.validate_wallet_currency('Associated', '2.00');
      });

      it('Disassociation outside of app is shown', function () {
        cy.staking_page_associate_tokens('2');
        cy.validate_wallet_currency('Associated', '2.00');
        cy.vega_wallet_disassociate('2');
        cy.getByTestId('currency-title', txTimeout).should(
          'have.length.above',
          3
        );
        cy.validate_wallet_currency('Associated', '2.00');
        cy.validate_wallet_currency('Pending association', '2.00');
        cy.validate_wallet_currency('Total associated after pending', '0.00');
        cy.getByTestId('currency-title', txTimeout).should('have.length', 3);
        cy.validate_wallet_currency('Associated', '0.00');
      });

      it('Able to associate tokens to different public key of connected vega wallet', function () {
        cy.get(ethWalletAssociateButton).first().click();
        cy.get(associateWalletRadioButton).click();
        cy.get(connectedVegaKey).should(
          'have.text',
          Cypress.env('vegaWalletPublicKey')
        );

        cy.get('[data-testid="manage-vega-wallet"]').click();
        cy.get('[data-testid="select-keypair-button"]').eq(0).click();
        cy.get(connectedVegaKey).should(
          'have.text',
          Cypress.env('vegaWalletPublicKey2')
        );
        cy.staking_page_associate_tokens('2');
        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should('contain', 2.0);
        });
        cy.get(associateCompleteText).should(
          'have.text',
          `Vega key ${Cypress.env(
            'vegaWalletPublicKey2Short'
          )} can now participate in governance and nominate a validator with your associated $VEGA.`
        );
        cy.staking_page_disassociate_all_tokens();
      });
    });
  }
);
