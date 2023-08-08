import { truncateByChars } from '@vegaprotocol/utils';
import { waitForSpinner } from '../../support/common.functions';
import {
  vegaWalletFaucetAssetsWithoutCheck,
  vegaWalletTeardown,
} from '../../support/wallet-functions';

const walletContainer = 'aside [data-testid="vega-wallet"]';
const walletHeader = '[data-testid="wallet-header"] h1';
const connectButton = 'connect-vega-wallet';
const getVegaLink = 'link';
const dialog = '[role="dialog"]:visible';
const dialogHeader = 'dialog-title';
const walletDialogHeader = 'wallet-dialog-title';
const connectorsList = 'connectors-list';
const dialogCloseBtn = 'dialog-close';
const restConnectorForm = 'rest-connector-form';
const restWallet = '#wallet';
const restPassphrase = '#passphrase';
const restConnectBtn = '[type="submit"]';
const accountNo = 'vega-account-truncated';
const currencyTitle = 'currency-title';
const currencyValue = 'currency-value';
const vegaUnstaked = '[data-testid="vega-wallet-balance-unstaked"] .text-right';
const governanceBtn = '[href="/proposals"]';
const stakingBtn = '[href="/validators"]';
const manageLink = 'manage-vega-wallet';
const dialogVegaKey = 'vega-public-key-full';
const dialogDisconnectBtn = 'disconnect';
const copyPublicKeyBtn = 'copy-vega-public-key';
const vegaWalletCurrencyTitle = 'currency-title';
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
          cy.getByTestId(connectButton)
            .should('be.visible')
            .and('have.text', 'Connect Vega wallet to use associated $VEGA');
          cy.getByTestId(getVegaLink)
            .should('be.visible')
            .and('have.text', 'Get a Vega wallet')
            .and('have.attr', 'href', 'https://vega.xyz/wallet');
        });
      });
    });

    describe('when connect button clicked', () => {
      before('click connect vega wallet button', () => {
        cy.get(walletContainer).within(() => {
          cy.getByTestId(connectButton).click();
        });
      });

      it('should have Connect Vega header visible', () => {
        cy.get(dialog).within(() => {
          cy.getByTestId(walletDialogHeader)
            .should('be.visible')
            .and('have.text', 'Get a Vega wallet');
        });
      });

      it('should have jsonRpc and hosted connection options visible on list', function () {
        cy.getByTestId(connectorsList).within(() => {
          cy.getByTestId('connector-jsonRpc')
            .should('be.visible')
            .and('have.text', 'Use the Desktop App/CLI');
        });
      });

      it('should have close button visible', function () {
        cy.get(dialog).within(() => {
          cy.getByTestId(dialogCloseBtn).should('be.visible');
        });
      });
    });

    describe('when rest connector form opened', function () {
      before('click hosted wallet app button', function () {
        cy.getByTestId(connectorsList).within(() => {
          cy.getByTestId('connector-rest').click();
        });
      });

      // 0002-WCON-002
      it('should have wallet field visible', function () {
        cy.getByTestId(restConnectorForm).within(() => {
          cy.get(restWallet).should('be.visible');
        });
      });

      it('should have password field visible', function () {
        cy.getByTestId(restConnectorForm).within(() => {
          cy.get(restPassphrase).should('be.visible');
        });
      });

      it('should have connect button visible', function () {
        cy.getByTestId(restConnectorForm).within(() => {
          cy.get(restConnectBtn)
            .should('be.visible')
            .and('have.text', 'Connect');
        });
      });

      it('should have close button visible', function () {
        cy.get(dialog).within(() => {
          cy.getByTestId(dialogCloseBtn).should('be.visible');
        });
      });

      after('close dialog', function () {
        cy.getByTestId(dialogCloseBtn).click().should('not.exist');
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
            cy.getByTestId(accountNo)
              .should('be.visible')
              .and('have.text', Cypress.env('vegaWalletPublicKeyShort'));
          });
        }
      );

      it('should have Vega Associated currency title visible', function () {
        cy.get(walletContainer).within(() => {
          cy.getByTestId(currencyTitle)
            .should('be.visible')
            .and('contain.text', `VEGAAssociated`);
        });
      });

      it(
        'should have Vega Associated currency value visible',
        { tags: '@smoke' },
        function () {
          cy.get(walletContainer).within(() => {
            cy.getByTestId(currencyValue)
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
          cy.getByTestId(manageLink)
            .should('be.visible')
            .and('have.text', 'Manage');
        });
      });

      describe('when Manage dialog opened', function () {
        before('click Manage link', function () {
          cy.get(walletContainer).within(() => {
            cy.getByTestId(manageLink).click();
          });
        });

        // 0002-WCON-025, 0002-WCON-026
        it('should have SELECT A VEGA KEY dialog title visible', function () {
          cy.get(dialog).within(() => {
            cy.getByTestId(dialogHeader)
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
            cy.getByTestId(dialogVegaKey)
              .should('be.visible')
              .and('contain.text', truncatedPubKey1)
              .and('contain.text', truncatedPubKey2);
          });
        });

        // 0002-WCON-029
        it('should have copy public key button visible', function () {
          cy.get(dialog).within(() => {
            cy.getByTestId(copyPublicKeyBtn)
              .should('be.visible')
              .and('contain.text', 'Copy');
          });
        });

        it('should have close button visible', function () {
          cy.get(dialog).within(() => {
            cy.getByTestId(dialogCloseBtn).should('be.visible');
          });
        });

        it('should have vega Disconnect all keys button visible', function () {
          cy.get(dialog).within(() => {
            cy.getByTestId(dialogDisconnectBtn)
              .should('be.visible')
              .and('have.text', 'Disconnect all keys');
          });
        });

        // 0002-WCON-022
        it('should be able to disconnect all keys', function () {
          cy.get(dialog).within(() => {
            cy.getByTestId(dialogDisconnectBtn).click();
          });
          cy.get(walletContainer).within(() => {
            cy.getByTestId(connectButton).should('be.visible'); // 0002-WCON-023
          });
        });
      });

      // 2002-SINC-016
      describe('Vega wallet with assets', function () {
        const assets = [
          {
            id: '816af99af60d684502a40824758f6b5377e6af48e50a9ee8ef478ecb879ea8bc',
            name: 'USDC (fake)',
            symbol: 'fUSDC',
            amount: '1000000',
            expectedAmount: 10.0,
          },
          {
            id: '8566db7257222b5b7ef2886394ad28b938b28680a54a169bbc795027b89d6665',
            name: 'DAI (fake)',
            symbol: 'fDAI',
            amount: '200000',
            expectedAmount: 2.0,
          },
          {
            id: '73174a6fb1d5802ba0ac7bd7ab79e0a3a4837b262de0a4e80815a55442692bd0',
            name: 'BTC (fake)',
            symbol: 'fBTC',
            amount: '600000',
            expectedAmount: 6.0,
          },
          {
            id: 'e02d4c15d790d1d2dffaf2dcd1cf06a1fe656656cf4ed18c8ce99f9e83643567',
            name: 'EURO (fake)',
            symbol: 'fEURO',
            amount: '800000',
            expectedAmount: 8.0,
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

        for (const { name, symbol, expectedAmount } of assets) {
          it(`should see ${name} within vega wallet`, () => {
            cy.get(walletContainer).within(() => {
              cy.getByTestId(vegaWalletCurrencyTitle)
                .contains(name, txTimeout)
                .should('be.visible');

              cy.getByTestId(vegaWalletCurrencyTitle)
                .contains(name)
                .parent()
                .siblings(txTimeout)
                .should((elementAmount) => {
                  const displayedAmount = parseFloat(elementAmount.text());
                  expect(displayedAmount).be.gte(expectedAmount);
                });

              cy.getByTestId(vegaWalletCurrencyTitle)
                .contains(name)
                .parent()
                .contains(symbol);
            });
          });
        }
      });
    });
  }
);
