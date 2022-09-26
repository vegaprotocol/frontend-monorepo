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
        let currencyId = 'fUSDC';
        cy.get(vegaWalletContainer).within(() => {
          cy.get(vegaWalletCurrencyTitle, txTimeout)
            .contains(currencyId)
            .should('be.visible');

          cy.get(vegaWalletCurrencyTitle)
            .contains(currencyId)
            .parent()
            .siblings()
            .within(() => {
              cy.contains(`10.00000`).should('be.visible');
            });
        });
      });

      it('Able to see fBTC assets - within vega wallet', function () {
        let currencyId = 'fBTC';
        cy.get(vegaWalletContainer).within(() => {
          cy.get(vegaWalletCurrencyTitle, txTimeout)
            .contains(currencyId)
            .should('be.visible');

          cy.get(vegaWalletCurrencyTitle)
            .contains(currencyId)
            .parent()
            .siblings()
            .within(() => {
              cy.contains(`6.00000`).should('be.visible');
            });
        });
      });

      it('Able to see fEURO assets - within vega wallet', function () {
        let currencyId = 'fEURO';
        cy.get(vegaWalletContainer).within(() => {
          cy.get(vegaWalletCurrencyTitle, txTimeout)
            .contains(currencyId)
            .should('be.visible');

          cy.get(vegaWalletCurrencyTitle)
            .contains(currencyId)
            .parent()
            .siblings()
            .within(() => {
              cy.contains(`8.00000`).should('be.visible');
            });
        });
      });

      it('Able to see fDAI assets - within vega wallet', function () {
        let currencyId = 'fDAI';
        cy.get(vegaWalletContainer).within(() => {
          cy.get(vegaWalletCurrencyTitle, txTimeout)
            .contains(currencyId)
            .should('be.visible');

          cy.get(vegaWalletCurrencyTitle)
            .contains(currencyId)
            .parent()
            .siblings()
            .within(() => {
              cy.contains(`2.00000`).should('be.visible');
            });
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
