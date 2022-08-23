const validatorsGrid = '[data-testid="validators-grid"]';
const ethWalletContainer = '[data-testid="ethereum-wallet"]';
const ethWalletAssociatedBalances =
  '[data-testid="eth-wallet-associated-balances"]';
const ethWalletTotalAssociatedBalance = '[data-testid="currency-locked"]';
const vegaWalletAssociatedBalance = '[data-testid="currency-value"]';
const vegaWalletUnstakedBalance =
  '[data-testid="vega-wallet-balance-unstaked"]';
const txTimeout = { timeout: 40000 };
const vegaWalletPublicKeyShort = Cypress.env('vegaWalletPublicKeyShort');
const ethWalletAssociateButton = '[href="/staking/associate"]';
const associateWalletRadioButton = '[data-testid="associate-radio-wallet"]';
const tokenAmountInputBox = '[data-testid="token-amount-input"]';
const tokenSubmitButton = '[data-testid="token-input-submit-button"]';
const ethWalletDissociateButton = '[href="/staking/disassociate"]';
const vestingContractSection = '[data-testid="vega-in-vesting-contract"]';
const vegaInWalletSection = '[data-testid="vega-in-wallet"]';
const associatedKey = '[data-test-id="associated-key"]';
const associatedAmount = '[data-test-id="associated-amount"]';

context(
  'Token association flow - with eth and vega wallets connected',
  function () {
    before('visit staking tab and connect vega wallet', function () {
      cy.vega_wallet_import();
      cy.visit('/');
      cy.verify_page_header('The $VEGA token');
      cy.vega_wallet_connect();
      cy.vega_wallet_set_specified_approval_amount('1000');
      cy.reload();
      cy.verify_page_header('The $VEGA token');
      cy.ethereum_wallet_connect();
      cy.navigate_to('staking');
      cy.wait_for_spinner();
      cy.get(validatorsGrid).should('be.visible');
    });

    describe('Eth wallet - contains VEGA tokens', function () {
      beforeEach(
        'teardown wallet & drill into a specific validator',
        function () {
          cy.vega_wallet_teardown();
          cy.navigate_to('staking');
          cy.wait_for_spinner();
        }
      );

      it('Able to associate tokens', function () {
        //1000-ASSO-0008
        //1000-ASSO-0009
        //1000-ASSO-0030
        //1000-ASSO-0012
        //1000-ASSO-0014
        //1000-ASSO-0015
        //1000-ASSO-0030
        cy.staking_page_associate_tokens('2');

        cy.get(ethWalletAssociatedBalances, txTimeout)
          .contains(vegaWalletPublicKeyShort)
          .parent(txTimeout)
          .should('contain', 2.0);

        cy.get(ethWalletTotalAssociatedBalance, txTimeout)
          .contains('2.0', txTimeout)
          .should('be.visible');

        cy.get(vegaWalletAssociatedBalance, txTimeout).should('contain', 2.0);

        cy.get(vegaWalletUnstakedBalance, txTimeout).should('contain', 2.0);
      });

      it('Able to disassociate tokens', function () {
        // 1000-ASSO-0025
        // 1000-ASSO-0027
        // 1000-ASSO-0028
        // 1000-ASSO-0029

        cy.staking_page_associate_tokens('2');

        cy.get(ethWalletAssociatedBalances, txTimeout)
          .contains(vegaWalletPublicKeyShort)
          .parent(txTimeout)
          .should('contain', 2.0);

        cy.get(ethWalletTotalAssociatedBalance, txTimeout)
          .contains('2.0', txTimeout)
          .should('be.visible');

        cy.get('button').contains('Select a validator to nominate').click();

        cy.staking_page_disassociate_tokens('1');

        cy.get(ethWalletAssociatedBalances, txTimeout)
          .contains(vegaWalletPublicKeyShort)
          .parent(txTimeout)
          .should('contain', 1.0);

        cy.get(ethWalletTotalAssociatedBalance, txTimeout)
          .contains('1.0', txTimeout)
          .should('be.visible');
      });

      it('Able to associate more tokens than the approved amount of 1000 - requires re-approval', function () {
        //1000-ASSO-0011
        cy.staking_page_associate_tokens('1001', { approve: true });

        cy.get(ethWalletAssociatedBalances, txTimeout)
          .contains(vegaWalletPublicKeyShort)
          .parent()
          .should('contain', '1,001.000000000000000000', txTimeout);

        cy.get(ethWalletTotalAssociatedBalance, txTimeout)
          .contains('1,001.00', txTimeout)
          .should('be.visible');

        cy.get(vegaWalletAssociatedBalance, txTimeout).should(
          'contain',
          '1,001.000000000000000000'
        );
      });

      it('Able to disassociate a partial amount of tokens currently associated', function () {
        cy.staking_page_associate_tokens('2');

        cy.get(vegaWalletAssociatedBalance, txTimeout).should('contain', 2.0);

        cy.get('button').contains('Select a validator to nominate').click();

        cy.staking_page_disassociate_tokens('1');

        cy.get(ethWalletAssociatedBalances, txTimeout)
          .contains(vegaWalletPublicKeyShort)
          .parent(txTimeout)
          .should('contain', 1.0);

        cy.get(ethWalletAssociatedBalances, txTimeout)
          .contains(vegaWalletPublicKeyShort)
          .parent(txTimeout)
          .should('contain', 1.0);

        cy.get(vegaWalletAssociatedBalance, txTimeout).should('contain', 1.0);
      });

      it('Able to disassociate all tokens', function () {
        // 1000-ASSO-0026
        cy.staking_page_associate_tokens('2');

        cy.get(vegaWalletAssociatedBalance, txTimeout).should('contain', 2.0);

        cy.get('button').contains('Select a validator to nominate').click();

        cy.get(ethWalletDissociateButton).click();
        cy.contains(
          'If you disassociate tokens that have been nominated to a node, you will sacrifice any rewards they are due for the current epoch. If you do not wish to sacrifice rewards, remove your stake from a node at the end of an epoch before disassociating.'
        ).should('be.visible');

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

        cy.get(vegaWalletAssociatedBalance, txTimeout).should('contain', 0.0);
      });

      it('Able to associate and disassociate vesting contract tokens', function () {
        // 1000-ASSO-0006
        // 1000-ASSO-0024
        // 1000-ASSO-0023

        cy.staking_page_associate_tokens('2', { type: 'contract' });

        cy.get(ethWalletAssociatedBalances, txTimeout)
          .contains(vegaWalletPublicKeyShort)
          .parent(txTimeout)
          .should('contain', 2.0);

        cy.get(ethWalletTotalAssociatedBalance, txTimeout)
          .contains('2.0', txTimeout)
          .should('be.visible');

        cy.get(vegaWalletAssociatedBalance, txTimeout).should('contain', 2.0);

        cy.get(vegaWalletUnstakedBalance, txTimeout).should('contain', 2.0);
        cy.staking_page_disassociate_tokens('1', { type: 'contract' });

        cy.get(ethWalletAssociatedBalances, txTimeout)
          .contains(vegaWalletPublicKeyShort)
          .parent(txTimeout)
          .should('contain', 1.0);

        cy.get(ethWalletTotalAssociatedBalance, txTimeout)
          .contains('1.0', txTimeout)
          .should('be.visible');
      });

      it('Associate both wallet and vesting contract tokens', function () {
        // 1000-ASSO-0019
        // 1000-ASSO-0020
        // 1000-ASSO-0021
        // 1000-ASSO-0022

        cy.staking_page_associate_tokens('21', { type: 'wallet' });
        cy.get('button').contains('Select a validator to nominate').click();
        cy.staking_page_associate_tokens('37', { type: 'contract' });

        cy.get(vestingContractSection).within(() => {
          cy.get(associatedKey).should(
            'contain',
            Cypress.env('vegaWalletPublicKeyShort')
          );
          cy.get(associatedAmount).should('contain', '37');
        });

        cy.get(vegaInWalletSection).within(() => {
          cy.get(associatedKey).should(
            'contain',
            Cypress.env('vegaWalletPublicKeyShort')
          );
          cy.get(associatedAmount).should('contain', '21');
        });
      });

      it('Not able to associate more tokens than owned', function () {
        // 1000-ASSO-0010
        // No warning visible as described in AC, but the button is disabled

        cy.get(ethWalletAssociateButton).first().click();
        cy.get(associateWalletRadioButton, { timeout: 30000 }).click();
        cy.get(tokenAmountInputBox, { timeout: 10000 }).type(6500000);
        cy.get(tokenSubmitButton, txTimeout).should('be.disabled');
      });
    });
  }
);
