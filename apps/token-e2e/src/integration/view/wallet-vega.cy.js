import { truncateByChars } from '@vegaprotocol/react-helpers';

const walletContainer = '[data-testid="vega-wallet"]';
const walletHeader = '[data-testid="wallet-header"] h1';
const connectButton = '[data-testid="connect-vega"]';
const getVegaLink = '[data-testid="link"]';
const dialog = '[role="dialog"]';
const dialogHeader = '[data-testid="dialog-title"]';
const connectorsList = '[data-testid="connectors-list"]';
const dialogCloseBtn = '[data-testid="dialog-close"]';
const restConnectorForm = '[data-testid="rest-connector-form"]';
const restWallet = '#wallet';
const restPassphrase = '#passphrase';
const restConnectBtn = '[type="submit"]';
const accountNo = '[data-testid="vega-account-truncated"]';
const walletName = '[data-testid="wallet-name"]';
const currencyTitle = '[data-testid="currency-title"]';
const currencyValue = '[data-testid="currency-value"]';
const vegaUnstaked = '[data-testid="vega-wallet-balance-unstaked"] .text-right';
const governanceBtn = '[href="/governance"]';
const stakingBtn = '[href="/staking"]';
const manageLink = '[data-testid="manage-vega-wallet"]';
const dialogVegaKey = '[data-testid="vega-public-key-full"]';
const dialogDisconnectBtn = '[data-testid="disconnect"]';
const copyPublicKeyBtn = '[data-testid="copy-vega-public-key"]';
const vegaWalletCurrencyTitle = '[data-testid="currency-title"]';
const vegaWalletPublicKey = Cypress.env('vegaWalletPublicKey');
const txTimeout = Cypress.env('txTimeout');

context(
  'Vega Wallet - verify elements on widget',
  { tags: '@regression' },
  function () {
    before('visit token home page', function () {
      cy.visit('/');
    });

    describe('with wallets disconnected', function () {
      before('wait for widget to load', function () {
        cy.get(walletContainer, { timeout: 10000 }).should('be.visible');
      });

      it('should have VEGA WALLET header visible', function () {
        cy.get(walletContainer).within(() => {
          cy.get(walletHeader)
            .should('be.visible')
            .and('have.text', 'Vega Wallet');
        });
      });

      it('should have Connect Vega button visible', function () {
        cy.get(walletContainer).within(() => {
          cy.get(connectButton)
            .should('be.visible')
            .and('have.text', 'Connect Vega wallet to use associated $VEGA');
        });
      });

      it('should have Get a Vega wallet link visible', function () {
        cy.get(walletContainer).within(() => {
          cy.get(getVegaLink)
            .should('be.visible')
            .and('have.text', 'Get a Vega wallet')
            .and('have.attr', 'href', 'https://vega.xyz/wallet');
        });
      });
    });

    describe('when connect button clicked', function () {
      before('click connect vega wallet button', function () {
        cy.get(walletContainer).within(() => {
          cy.get(connectButton).click();
        });
      });

      it('should have Connect Vega header visible', function () {
        cy.get(dialog).within(() => {
          cy.get(dialogHeader)
            .should('be.visible')
            .and('have.text', 'Connect to your Vega Wallet');
        });
      });

      it('should have REST connector visible on list', function () {
        cy.get(connectorsList).within(() => {
          cy.get('button')
            .should('be.visible')
            .and('have.text', 'rest provider');
        });
      });

      it('should have close button visible', function () {
        cy.get(dialog).within(() => {
          cy.get(dialogCloseBtn).should('be.visible');
        });
      });
    });

    describe('when rest connector form opened', function () {
      before('click rest provider link', function () {
        cy.get(connectorsList).within(() => {
          cy.get('button').click();
        });
      });

      it('should have wallet field visible', function () {
        cy.get(restConnectorForm).within(() => {
          cy.get(restWallet).should('be.visible');
        });
      });

      it('should have password field visible', function () {
        cy.get(restConnectorForm).within(() => {
          cy.get(restPassphrase).should('be.visible');
        });
      });

      it('should have connect button visible', function () {
        cy.get(restConnectorForm).within(() => {
          cy.get(restConnectBtn)
            .should('be.visible')
            .and('have.text', 'Connect');
        });
      });

      it('should have Connect Vega header visible', function () {
        cy.get(dialog).within(() => {
          cy.get(dialogHeader)
            .should('be.visible')
            .and('have.text', 'Connect to your Vega Wallet');
        });
      });

      it('should have close button visible', function () {
        cy.get(dialog).within(() => {
          cy.get(dialogCloseBtn).should('be.visible');
        });
      });

      // after('close dialog', function () {
      //   cy.get(dialogCloseBtn).click().should('not.exist');
      // }); - to be changed when dialog state is fixed - https://github.com/vegaprotocol/frontend-monorepo/issues/838
    });

    describe('when vega wallet connected', function () {
      before('connect vega wallet', function () {
        cy.vega_wallet_import();
        cy.visit('/');
        cy.get(walletContainer).within(() => {
          cy.get(connectButton).click();
        });
        cy.get(connectorsList).within(() => {
          cy.get('button').click();
        });
        //   cy.vega_wallet_connect();  - to be changed when dialog state is fixed - https://github.com/vegaprotocol/frontend-monorepo/issues/838
        // then code below can be removed
        cy.get(restConnectorForm).within(() => {
          cy.get('#wallet').click().type(Cypress.env('vegaWalletName'));
          cy.get('#passphrase')
            .click()
            .type(Cypress.env('vegaWalletPassphrase'));
          cy.get('button').contains('Connect').click();
        });
      });

      it('should have VEGA WALLET header visible', function () {
        cy.get(walletContainer).within(() => {
          cy.get(walletHeader)
            .should('be.visible')
            .and('have.text', 'Vega Wallet');
        });
      });

      it(
        'should have truncated account number visible',
        { tags: '@smoke' },
        function () {
          cy.get(walletContainer).within(() => {
            cy.get(accountNo)
              .should('be.visible')
              .and('have.text', Cypress.env('vegaWalletPublicKeyShort'));
          });
        }
      );

      it.skip('should have wallet name visible', function () {
        cy.get(walletContainer).within(() => {
          cy.get(walletName)
            .should('be.visible')
            .and('have.text', `${Cypress.env('vegaWalletName')} key 1`);
        });
      });

      it('should have Vega Associated currency title visible', function () {
        cy.get(walletContainer).within(() => {
          cy.get(currencyTitle)
            .should('be.visible')
            .and('have.text', `VEGAAssociated`);
        });
      });

      it(
        'should have Vega Associated currency value visible',
        { tags: '@smoke' },
        function () {
          cy.get(walletContainer).within(() => {
            cy.get(currencyValue)
              .should('be.visible')
              .and('have.text', `0.000000000000000000`);
          });
        }
      );

      it('should have Unstaked value visible', { tags: '@smoke' }, function () {
        cy.get(walletContainer).within(() => {
          cy.get(vegaUnstaked)
            .should('be.visible')
            .and('have.text', `0.000000000000000000`);
        });
      });

      it('should have Governance button visible', function () {
        cy.get(walletContainer).within(() => {
          cy.get(governanceBtn)
            .should('be.visible')
            .and('have.text', 'Governance');
        });
      });

      it('should have Staking button visible', function () {
        cy.get(walletContainer).within(() => {
          cy.get(stakingBtn).should('be.visible').and('have.text', 'Staking');
        });
      });

      it('should have Manage link visible', function () {
        cy.get(walletContainer).within(() => {
          cy.get(manageLink).should('be.visible').and('have.text', 'Manage');
        });
      });
    });

    describe('when Manage dialog opened', function () {
      before('click Manage link', function () {
        cy.get(walletContainer).within(() => {
          cy.get(manageLink).click();
        });
      });

      it('should have SELECT A VEGA KEY dialog title visible', function () {
        cy.get(dialog).within(() => {
          cy.get(dialogHeader)
            .should('be.visible')
            .and('have.text', 'SELECT A VEGA KEY');
        });
      });

      it.skip('should have vega wallet public key and name visible', function () {
        cy.get(dialog).within(() => {
          cy.get(dialogVegaKey)
            .should('be.visible')
            .and(
              'have.text',
              `${Cypress.env('vegaWalletName')} key 1 ${truncateByChars(
                Cypress.env('vegaWalletPublicKey')
              )}`
            );
        });
      });

      it('should have copy public key button visible', function () {
        cy.get(dialog).within(() => {
          cy.get(copyPublicKeyBtn)
            .should('be.visible')
            .and('have.text', 'Copy');
        });
      });

      it('should have close button visible', function () {
        cy.get(dialog).within(() => {
          cy.get(dialogCloseBtn).should('be.visible');
        });
      });

      it('should have vega Disconnect all keys button visible', function () {
        cy.get(dialog).within(() => {
          cy.get(dialogDisconnectBtn)
            .should('be.visible')
            .and('have.text', 'Disconnect all keys');
        });
      });

      it('should be able to disconnect all keys', function () {
        cy.get(dialog).within(() => {
          cy.get(dialogDisconnectBtn).click();
        });
        cy.get(walletContainer).within(() => {
          cy.get(connectButton).should('be.visible');
        });
      });
    });

    describe('when assets exist in vegawallet', function () {
      before('send-faucet assets to connected vega wallet', function () {
        cy.vega_wallet_receive_fauceted_asset(
          'USDC (fake)',
          '10',
          vegaWalletPublicKey
        );
        cy.vega_wallet_receive_fauceted_asset(
          'BTC (fake)',
          '6',
          vegaWalletPublicKey
        );
        cy.vega_wallet_receive_fauceted_asset(
          'EURO (fake)',
          '8',
          vegaWalletPublicKey
        );
        cy.vega_wallet_receive_fauceted_asset(
          'DAI (fake)',
          '2',
          vegaWalletPublicKey
        );
        //   cy.vega_wallet_connect();  - to be changed when dialog state is fixed - https://github.com/vegaprotocol/frontend-monorepo/issues/838
        // then code below can be removed
        cy.get(walletContainer).within(() => {
          cy.get('button')
            .contains('Connect Vega wallet to use associated $VEGA')
            .should('be.enabled')
            .and('be.visible')
            .click({ force: true });
        });
        cy.get(restConnectorForm).within(() => {
          cy.get('#wallet').click().type(Cypress.env('vegaWalletName'));
          cy.get('#passphrase')
            .click()
            .type(Cypress.env('vegaWalletPassphrase'));
          cy.get('button').contains('Connect').click();
        });
        cy.ethereum_wallet_connect();
      });

      it('should see fUSDC assets - within vega wallet', function () {
        let currency = { id: 'fUSDC', name: 'USDC (fake)' };
        cy.get(walletContainer).within(() => {
          cy.get(vegaWalletCurrencyTitle)
            .contains(currency.id, txTimeout)
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

      it('should see fBTC assets - within vega wallet', function () {
        let currency = { id: 'fBTC', name: 'BTC (fake)' };
        cy.get(walletContainer).within(() => {
          cy.get(vegaWalletCurrencyTitle)
            .contains(currency.id, txTimeout)
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

      it('should see fEURO assets - within vega wallet', function () {
        let currency = { id: 'fEURO', name: 'EURO (fake)' };
        cy.get(walletContainer).within(() => {
          cy.get(vegaWalletCurrencyTitle)
            .contains(currency.id, txTimeout)
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

      it('should see fDAI assets - within vega wallet', function () {
        let currency = { id: 'fDAI', name: 'DAI (fake)' };
        cy.get(walletContainer).within(() => {
          cy.get(vegaWalletCurrencyTitle)
            .contains(currency.id, txTimeout)
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
            cy.restart_vegacapsule_network();
          }
        }
      );
    });
  }
);
