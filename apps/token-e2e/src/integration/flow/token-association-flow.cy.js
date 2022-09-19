const ethWalletContainer = '[data-testid="ethereum-wallet"]';
const ethWalletAssociatedBalances =
  '[data-testid="eth-wallet-associated-balances"]';
const ethWalletTotalAssociatedBalance = '[data-testid="currency-locked"]';
const vegaWalletAssociatedBalance = '[data-testid="currency-value"]';
const vegaWalletUnstakedBalance =
  '[data-testid="vega-wallet-balance-unstaked"]';
const txTimeout = Cypress.env('txTimeout');
const vegaWalletPublicKeyShort = Cypress.env('vegaWalletPublicKeyShort');
const ethWalletAssociateButton = '[href="/staking/associate"]';
const associateWalletRadioButton = '[data-testid="associate-radio-wallet"]';
const tokenAmountInputBox = '[data-testid="token-amount-input"]';
const tokenSubmitButton = '[data-testid="token-input-submit-button"]';
const ethWalletDissociateButton = '[href="/staking/disassociate"]';
const vestingContractSection = '[data-testid="vega-in-vesting-contract"]';
const vegaInWalletSection = '[data-testid="vega-in-wallet"]';
const associatedAmount = '[data-test-id="associated-amount"]';
const disassocitiationWarning = '[data-testid="disassociation-warning"]';
const vegaWallet = '[data-testid="vega-wallet"]';

context(
  'Token association flow - with eth and vega wallets connected',
  function () {
    before('visit staking tab and connect vega wallet', function () {
      cy.vega_wallet_import();
      cy.visit('/');
      cy.verify_page_header('The $VEGA token');
      cy.vega_wallet_set_specified_approval_amount('1000');
      cy.vega_wallet_connect();
      cy.navigate_to('staking');
      cy.wait_for_spinner();
    });

    describe('Eth wallet - contains VEGA tokens', function () {
      it('Able to associate tokens - from wallet', function () {
        //1000-ASSO-0008
        //1000-ASSO-0009
        //1000-ASSO-0030
        //1000-ASSO-0012
        //1000-ASSO-0013
        //1000-ASSO-0014
        //1000-ASSO-0015
        //1000-ASSO-0030
        cy.set_up_tokens();

        cy.staking_page_associate_tokens('2');

        cy.get(ethWalletAssociatedBalances, txTimeout)
          .contains(vegaWalletPublicKeyShort)
          .parent(txTimeout)
          .should('contain', 2.0);

        cy.get(ethWalletTotalAssociatedBalance, txTimeout)
          .contains('2.0', txTimeout)
          .should('be.visible');

        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should('contain', 2.0);
        });

        cy.get(vegaWalletUnstakedBalance, txTimeout).should('contain', 2.0);
      });

      it('Able to disassociate all associated tokens - manually', function () {
        // 1000-ASSO-0025
        // 1000-ASSO-0027
        // 1000-ASSO-0028
        // 1000-ASSO-0029

        cy.set_up_tokens(10);

        cy.staking_page_disassociate_tokens('10');

        cy.get(ethWalletAssociatedBalances, txTimeout).should('not.exist');

        cy.get(ethWalletTotalAssociatedBalance, txTimeout)
          .contains('0.00', txTimeout)
          .should('be.visible');
      });

      it('Able to associate more tokens than the approved amount of 1000 - requires re-approval', function () {
        //1000-ASSO-0011

        cy.set_up_tokens();

        cy.staking_page_associate_tokens('1001', { approve: true });

        cy.get(ethWalletAssociatedBalances, txTimeout)
          .contains(vegaWalletPublicKeyShort)
          .parent()
          .should('contain', '1,001.000000000000000000', txTimeout);

        cy.get(ethWalletTotalAssociatedBalance, txTimeout)
          .contains('1,001.00', txTimeout)
          .should('be.visible');

        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should(
            'contain',
            '1,001.000000000000000000'
          );
        });
      });

      it('Able to disassociate a partial amount of tokens currently associated', function () {
        cy.set_up_tokens(8);

        cy.staking_page_disassociate_tokens('1');

        cy.get(ethWalletAssociatedBalances, txTimeout)
          .contains(vegaWalletPublicKeyShort)
          .parent(txTimeout)
          .should('contain', 7.0);

        cy.get(ethWalletAssociatedBalances, txTimeout)
          .contains(vegaWalletPublicKeyShort)
          .parent(txTimeout)
          .should('contain', 7.0);

        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should('contain', 7.0);
        });
      });

      it('Able to disassociate all tokens - using max', function () {
        // 1000-ASSO-0026
        const warningText =
          'Warning: Any tokens that have been nominated to a node will sacrifice rewards they are due for the current epoch. If you do not wish to sacrifice these, you should remove stake from a node at the end of an epoch before disassociation.';

        cy.set_up_tokens(13);

        cy.get(ethWalletDissociateButton).click();
        cy.get(disassocitiationWarning).should('contain', warningText);

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
        // 1000-ASSO-0006
        // 1000-ASSO-0024
        // 1000-ASSO-0023

        cy.staking_page_associate_tokens('4', { type: 'contract' });

        cy.get(ethWalletAssociatedBalances, txTimeout)
          .contains(vegaWalletPublicKeyShort)
          .parent(txTimeout)
          .should('contain', 4.0);

        cy.get(ethWalletTotalAssociatedBalance, txTimeout)
          .contains('4.0', txTimeout)
          .should('be.visible');

        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should('contain', 4.0);
        });

        cy.get(vegaWalletUnstakedBalance, txTimeout).should('contain', 4.0);
        cy.staking_page_disassociate_tokens('1', { type: 'contract' });

        cy.get(ethWalletAssociatedBalances, txTimeout)
          .contains(vegaWalletPublicKeyShort)
          .parent(txTimeout)
          .should('contain', 3.0);

        cy.get(ethWalletTotalAssociatedBalance, txTimeout)
          .contains('3.0', txTimeout)
          .should('be.visible');
      });

      it('Able disassociate both wallet and vesting contract tokens', function () {
        // 1000-ASSO-0019
        // 1000-ASSO-0020
        // 1000-ASSO-0021
        // 1000-ASSO-0022

        cy.set_up_tokens(21, 37);

        cy.staking_page_disassociate_tokens('6', { type: 'wallet' });

        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should('contain', 52);
        });

        cy.navigate_to('staking');

        cy.staking_page_disassociate_tokens('9', { type: 'contract' });

        cy.get(vegaInWalletSection).within(() => {
          cy.get(associatedAmount, txTimeout).should('contain', 15);
        });

        cy.get(vestingContractSection).within(() => {
          cy.get(associatedAmount, txTimeout).should('contain', 28);
        });

        cy.get(vegaWallet).within(() => {
          cy.get(vegaWalletAssociatedBalance, txTimeout).should('contain', 43);
        });
      });

      it('Not able to associate more tokens than owned', function () {
        // 1000-ASSO-0010
        // No warning visible as described in AC, but the button is disabled

        cy.set_up_tokens();

        cy.get(ethWalletAssociateButton).first().click();
        cy.get(associateWalletRadioButton, { timeout: 30000 }).click();
        cy.get(tokenAmountInputBox, { timeout: 10000 }).type(6500000);
        cy.get(tokenSubmitButton, txTimeout).should('be.disabled');
      });

      after(
        'teardown environment to prevent test data bleeding into other tests',
        function () {
          if (Cypress.env('CYPRESS_TEARDOWN_NETWORK_AFTER_FLOWS') === 'true') {
            cy.restartVegacapsuleNetwork();
          }
        }
      );
    });
  }
);
