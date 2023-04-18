import { truncateByChars } from '@vegaprotocol/utils';
import { waitForSpinner } from '../../support/common.functions';
import { vegaWalletTeardown } from '../../support/wallet-teardown.functions';
import { vegaWalletFaucetAssetsWithoutCheck } from '../../support/wallet-vega.functions';

const walletContainer = 'aside [data-testid="vega-wallet"]';
const walletHeader = '[data-testid="wallet-header"] h1';
const connectButton = '[data-testid="connect-vega-wallet"]';
const getVegaLink = '[data-testid="link"]';
const dialog = '[role="dialog"]:visible';
const dialogHeader = '[data-testid="dialog-title"]';
const walletDialogHeader = '[data-testid="wallet-dialog-title"]';
const connectorsList = '[data-testid="connectors-list"]';
const dialogCloseBtn = '[data-testid="dialog-close"]';
const restConnectorForm = '[data-testid="rest-connector-form"]';
const restWallet = '#wallet';
const restPassphrase = '#passphrase';
const restConnectBtn = '[type="submit"]';
const accountNo = '[data-testid="vega-account-truncated"]';
const currencyTitle = '[data-testid="currency-title"]';
const currencyValue = '[data-testid="currency-value"]';
const vegaUnstaked = '[data-testid="vega-wallet-balance-unstaked"] .text-right';
const governanceBtn = '[href="/proposals"]';
const stakingBtn = '[href="/validators"]';
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
  () => {
    before('visit token home page', () => {
      cy.visit('/');
      cy.get(walletContainer, { timeout: 60000 }).should('be.visible');
    });

    describe('with wallets disconnected', () => {
      it('should have required elements visible', function () {
        cy.get(walletContainer).within(() => {
          cy.get(walletHeader)
            .should('be.visible')
            .and('have.text', 'Vega Wallet');
          cy.get(connectButton)
            .should('be.visible')
            .and('have.text', 'Connect Vega wallet to use associated $VEGA');
          cy.get(getVegaLink)
            .should('be.visible')
            .and('have.text', 'Get a Vega wallet')
            .and('have.attr', 'href', 'https://vega.xyz/wallet');
        });
      });
    });

    describe('when connect button clicked', () => {
      before('click connect vega wallet button', () => {
        cy.get(walletContainer).within(() => {
          cy.get(connectButton).click();
        });
      });

      it('should have Connect Vega header visible', () => {
        cy.get(dialog).within(() => {
          cy.get(walletDialogHeader)
            .should('be.visible')
            .and('have.text', 'Connect');
        });
      });

      it('should have jsonRpc and hosted connection options visible on list', function () {
        cy.get(connectorsList).within(() => {
          cy.getByTestId('connector-jsonRpc')
            .should('be.visible')
            .and('have.text', 'Connect Vega wallet');
          cy.getByTestId('connector-hosted')
            .should('be.visible')
            .and('have.text', 'Hosted Fairground wallet');
        });
      });

      it('should have close button visible', function () {
        cy.get(dialog).within(() => {
          cy.get(dialogCloseBtn).should('be.visible');
        });
      });
    });

    describe('when rest connector form opened', function () {
      before('click hosted wallet app button', function () {
        cy.get(connectorsList).within(() => {
          cy.getByTestId('connector-hosted').click();
        });
      });

      // 0002-WCON-002
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

      it('should have close button visible', function () {
        cy.get(dialog).within(() => {
          cy.get(dialogCloseBtn).should('be.visible');
        });
      });

      after('close dialog', function () {
        cy.get(dialogCloseBtn).click().should('not.exist');
      });
    });

    describe('when vega wallet connected', function () {
      before('connect vega wallet', function () {
        cy.visit('/');
        cy.connectVegaWallet();
        vegaWalletTeardown();
      });

      // 0002-WCON-007
      it('should have VEGA WALLET header visible', function () {
        cy.get(walletContainer).within(() => {
          cy.get(walletHeader)
            .should('be.visible')
            .and('have.text', 'Vega Wallet');
        });
      });

      // 0002-WCON-008
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

      it('should have Vega Associated currency title visible', function () {
        cy.get(walletContainer).within(() => {
          cy.get(currencyTitle)
            .should('be.visible')
            .and('contain.text', `VEGAAssociated`);
        });
      });

      it(
        'should have Vega Associated currency value visible',
        { tags: '@smoke' },
        function () {
          cy.get(walletContainer).within(() => {
            cy.get(currencyValue)
              .should('be.visible')
              .and('contain.text', `0.00`);
          });
        }
      );

      it('should have Unstaked value visible', { tags: '@smoke' }, function () {
        cy.get(walletContainer).within(() => {
          cy.get(vegaUnstaked)
            .should('be.visible')
            .invoke('text')
            .and('not.be.empty');
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

      describe('when Manage dialog opened', function () {
        before('click Manage link', function () {
          cy.get(walletContainer).within(() => {
            cy.get(manageLink).click();
          });
        });

        // 0002-WCON-025, 0002-WCON-026
        it('should have SELECT A VEGA KEY dialog title visible', function () {
          cy.get(dialog).within(() => {
            cy.get(dialogHeader)
              .should('be.visible')
              .and('have.text', 'SELECT A VEGA KEY');
          });
        });

        // 0002-WCON-027
        it('should have vega wallet public keys visible', function () {
          const truncatedPubKey1 = truncateByChars(
            Cypress.env('vegaWalletPublicKey')
          );
          const truncatedPubKey2 = truncateByChars(
            Cypress.env('vegaWalletPublicKey2')
          );

          cy.get(dialog).within(() => {
            cy.getByTestId('selected-key').should(
              'contain.text',
              truncatedPubKey1
            );
            cy.get(dialogVegaKey)
              .should('be.visible')
              .and('contain.text', truncatedPubKey1)
              .and('contain.text', truncatedPubKey2);
          });
        });

        // 0002-WCON-029
        it('should have copy public key button visible', function () {
          cy.get(dialog).within(() => {
            cy.get(copyPublicKeyBtn)
              .should('be.visible')
              .and('contain.text', 'Copy');
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

        // 0002-WCON-022
        it('should be able to disconnect all keys', function () {
          cy.get(dialog).within(() => {
            cy.get(dialogDisconnectBtn).click();
          });
          cy.get(walletContainer).within(() => {
            cy.get(connectButton).should('be.visible'); // 0002-WCON-023
          });
        });
      });

      // 2002-SINC-016
      describe('Vega wallet with assets', function () {
        const assets = [
          {
            id: 'fUSDC',
            name: 'USDC (fake)',
            amount: '1000000',
            expectedAmount: '10.00',
          },
          {
            id: 'fDAI',
            name: 'DAI (fake)',
            amount: '200000',
            expectedAmount: '2.00',
          },
          {
            id: 'fBTC',
            name: 'BTC (fake)',
            amount: '600000',
            expectedAmount: '6.00',
          },
          {
            id: 'fEURO',
            name: 'EURO (fake)',
            amount: '800000',
            expectedAmount: '8.00',
          },
        ];

        before('faucet assets to connected vega wallet', function () {
          for (const { id, amount } of assets) {
            vegaWalletFaucetAssetsWithoutCheck(id, amount, vegaWalletPublicKey);
          }
          cy.reload();
          waitForSpinner();
          cy.connectVegaWallet();
          cy.get(walletContainer).within(() => {
            cy.getByTestId('currency-title', txTimeout).should(
              'have.length.at.least',
              5
            );
          });
        });

        for (const { id, name, expectedAmount } of assets) {
          it(`should see ${id} within vega wallet`, () => {
            cy.get(walletContainer).within(() => {
              cy.get(vegaWalletCurrencyTitle)
                .contains(id, txTimeout)
                .should('be.visible');

              cy.get(vegaWalletCurrencyTitle)
                .contains(id)
                .parent()
                .siblings()
                .invoke('text')
                .then((el) => {
                  const value = parseFloat(el);
                  cy.wrap(value).should('be.gte', parseFloat(expectedAmount));
                });

              cy.get(vegaWalletCurrencyTitle)
                .contains(id)
                .parent()
                .contains(name);
            });
          });
        }
      });
    });
  }
);
