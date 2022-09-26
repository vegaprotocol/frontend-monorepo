/// <reference types="cypress" />

const txTimeout = Cypress.env('txTimeout');
const vegaWalletContainer = '[data-testid="vega-wallet"]';
const vegaWalletCurrencyTitle = '[data-testid="currency-title"]';

context(
  'Vega wallet flow - with vega wallet connected',
  { tags: '@slow' },
  function () {
    before(
      'visit token front - send-faucet assets to connected vega wallet',
      function () {
        cy.vega_wallet_import();
        cy.vega_wallet_top_up_with_asset('USDC (fake)', '10');
        cy.vega_wallet_top_up_with_asset('BTC (fake)', '6');
        cy.vega_wallet_top_up_with_asset('EURO (fake)', '8');
        cy.vega_wallet_top_up_with_asset('DAI (fake)', '2');
        cy.visit('/');
        cy.verify_page_header('The $VEGA token');
        cy.vega_wallet_connect();
        cy.ethereum_wallet_connect();
      }
    );

    describe('Vega wallet - Check assets show', function () {
      it('Able to see fUSDC assets - within vega wallet', function () {
        let currency = { id: 'fUSDC', name: 'USDC (fake)' };
        cy.get(vegaWalletContainer).within(() => {
          cy.get(vegaWalletCurrencyTitle, txTimeout)
            .contains(currency.id)
            .should('be.visible');

          cy.get(vegaWalletCurrencyTitle)
            .contains(currency.id)
            .parent()
            .siblings()
            .within(() => cy.contains_exactly('10.00000').should('be.visible'));

          cy.get(vegaWalletCurrencyTitle)
            .contains(currency.id)
            .parent()
            .contains(currency.name);
        });
      });

      it('Able to see fBTC assets - within vega wallet', function () {
        let currency = { id: 'fBTC', name: 'BTC (fake)' };
        cy.get(vegaWalletContainer).within(() => {
          cy.get(vegaWalletCurrencyTitle, txTimeout)
            .contains(currency.id)
            .should('be.visible');

          cy.get(vegaWalletCurrencyTitle)
            .contains(currency.id)
            .parent()
            .siblings()
            .within(() => cy.contains_exactly('6.00000').should('be.visible'));

          cy.get(vegaWalletCurrencyTitle)
            .contains(currency.id)
            .parent()
            .contains(currency.name);
        });
      });

      it('Able to see fEURO assets - within vega wallet', function () {
        let currency = { id: 'fEURO', name: 'EURO (fake)' };
        cy.get(vegaWalletContainer).within(() => {
          cy.get(vegaWalletCurrencyTitle, txTimeout)
            .contains(currency.id)
            .should('be.visible');

          cy.get(vegaWalletCurrencyTitle)
            .contains(currency.id)
            .parent()
            .siblings()
            .within(() => cy.contains_exactly('8.00000').should('be.visible'));

          cy.get(vegaWalletCurrencyTitle)
            .contains(currency.id)
            .parent()
            .contains(currency.name);
        });
      });

      it('Able to see fDAI assets - within vega wallet', function () {
        let currency = { id: 'fDAI', name: 'DAI (fake)' };
        cy.get(vegaWalletContainer).within(() => {
          cy.get(vegaWalletCurrencyTitle, txTimeout)
            .contains(currency.id)
            .should('be.visible');

          cy.get(vegaWalletCurrencyTitle)
            .contains(currency.id)
            .parent()
            .siblings()
            .within(() => cy.contains_exactly('2.00000').should('be.visible'));

          cy.get(vegaWalletCurrencyTitle)
            .contains(currency.id)
            .parent()
            .contains(currency.name);
        });
      });

      after(
        'teardown environment to prevent test data bleeding into other tests',
        function () {
          if (Cypress.env('CYPRESS_TEARDOWN_NETWORK_AFTER_FLOWS')) {
            cy.restartVegacapsuleNetwork();
          }
        }
      );
    });
  }
);
