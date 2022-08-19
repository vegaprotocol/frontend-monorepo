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
        cy.staking_page_associate_tokens('1001', true);

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
        cy.staking_page_associate_tokens('2');

        cy.get(vegaWalletAssociatedBalance, txTimeout).should('contain', 2.0);

        cy.get('button').contains('Select a validator to nominate').click();

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
    });
  }
);
