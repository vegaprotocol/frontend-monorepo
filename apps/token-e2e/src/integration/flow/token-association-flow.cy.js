const stakingPageLink = '[href="/staking"]';
const pageSpinner = 'splash-loader';
const menuBar = 'nav';
const validatorList = '[data-testid="node-list-item-name"]';
const ethWalletContainer = '[data-testid="ethereum-wallet"]';
const ethWalletAssociateButton = '[href="/staking/associate"]';
const ethWalletDissociateButton = '[href="/staking/disassociate"]';
const associateWalletRadioButton = '[data-testid="associate-radio-wallet"]';
const vegaWalletPublicKeyShort = Cypress.env('vegaWalletPublicKeyShort');

context(
  'Token association flow - with eth and vega wallets connected',
  function () {
    
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
    });

    describe('Eth wallet - contains VEGA tokens', function () {
      beforeEach(
        'teardown wallet & drill into a specific validator',
        function () {
          cy.vega_wallet_teardown();
          cy.get(stakingPageLink).first().click();
          cy.get(pageSpinner, { timeout: 20000 }).should('not.exist');
        }
      );

      it('Able to associate tokens', function () {
        cy.staking_page_associate_tokens('2');
        cy.ethereum_wallet_check_associated_vega_key_value_is(
          vegaWalletPublicKeyShort,
          '2.000000000000000000'
        );
        cy.ethereum_wallet_check_associated_value_is('2.0');
        cy.vega_wallet_check_associated_value_is('2.000000000000000000');
        cy.vega_wallet_check_unstaked_value_is('2.000000000000000000');
      });

      it('Able to disassociate tokens', function () {
        cy.staking_page_associate_tokens('2');
        cy.ethereum_wallet_check_associated_vega_key_value_is(
          vegaWalletPublicKeyShort,
          '2.000000000000000000'
        );
        cy.vega_wallet_check_associated_value_is('2.000000000000000000');
        cy.get('button').contains('Select a validator to nominate').click();
        cy.staking_page_disassociate_tokens('1');
        cy.ethereum_wallet_check_associated_vega_key_value_is(
          vegaWalletPublicKeyShort,
          '1.000000000000000000'
        );
        cy.ethereum_wallet_check_associated_value_is('1.0');
        cy.vega_wallet_check_associated_value_is('1.000000000000000000');
      });

      it('Able to associate more tokens than the approved amount of 1000 - requires re-approval', function () {
        cy.staking_page_associate_tokens('1001', true);
        cy.ethereum_wallet_check_associated_vega_key_value_is(
          vegaWalletPublicKeyShort,
          '1,001.000000000000000000'
        );
        cy.ethereum_wallet_check_associated_value_is('1,001.00');
        cy.vega_wallet_check_associated_value_is('1,001.000000000000000000');
      });

      it('Able to disassociate a partial amount of tokens currently associated', function () {
        cy.staking_page_associate_tokens('2');
        cy.vega_wallet_check_associated_value_is('2.000000000000000000');
        cy.get('button').contains('Select a validator to nominate').click();
        cy.staking_page_disassociate_tokens('1');
        cy.ethereum_wallet_check_associated_vega_key_value_is(
          vegaWalletPublicKeyShort,
          '1.000000000000000000'
        );
        cy.ethereum_wallet_check_associated_value_is('1.0');
        cy.vega_wallet_check_associated_value_is('1.000000000000000000');
      });

      it('Able to disassociate all tokens', function () {
        cy.staking_page_associate_tokens('2');
        cy.vega_wallet_check_associated_value_is('2.000000000000000000');
        cy.get('button').contains('Select a validator to nominate').click();
        cy.staking_page_disassociate_all_tokens();
        cy.ethereum_wallet_check_associated_vega_key_is_no_longer_showing(
          vegaWalletPublicKeyShort
        );
        cy.ethereum_wallet_check_associated_value_is('0.0');
        cy.vega_wallet_check_associated_value_is('0.000000000000000000');
      });
    });
  }
);
