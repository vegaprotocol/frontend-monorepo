import { convertTokenValueToNumber } from '../../support/common.functions';
import { ethereumWalletConnect } from '../../support/wallet-eth.functions';

const walletContainer = 'aside [data-testid="ethereum-wallet"]';
const walletHeader = '[data-testid="wallet-header"] h1';
const connectToEthButton =
  '[data-testid="connect-to-eth-wallet-button"]:visible';
const connectorList = 'web3-connector-list';
const associate = '[href="/token/associate"]';
const disassociate = '[href="/token/disassociate"]';
const disconnect = 'disconnect-from-eth-wallet-button';
const accountNo = 'ethereum-account-truncated';
const currencyTitle = '[data-testid="currency-title"]:visible';
const currencyValue = '[data-testid="currency-value"]:visible';
const vegaInVesting = '[data-testid="vega-in-vesting-contract"]:visible';
const vegaInWallet = '[data-testid="vega-in-wallet"]:visible';
const progressBar = '[data-testid="progress-bar"]:visible';
const currencyLocked = '[data-testid="currency-locked"]:visible';
const currencyUnlocked = '[data-testid="currency-unlocked"]:visible';
const dialog = '[role="dialog"]:visible';
const dialogHeader = 'dialog-title';
const dialogCloseBtn = 'dialog-close';

context(
  'Ethereum Wallet - verify elements on widget',
  { tags: '@smoke' },
  function () {
    before('visit token home page', function () {
      cy.visit('/');
    });

    describe('with wallets disconnected', function () {
      before('wait for widget to load', function () {
        cy.get(walletContainer, { timeout: 10000 }).should('be.visible');
      });

      it('should have ETHEREUM KEY header visible', function () {
        cy.get(walletContainer).within(() => {
          cy.get(walletHeader)
            .should('be.visible')
            .and('have.text', 'Ethereum key');
        });
      });

      it('should have Connect Ethereum button visible', function () {
        cy.get(walletContainer).within(() => {
          cy.get(connectToEthButton)
            .should('be.visible')
            .and('have.text', 'Connect Ethereum wallet to associate $VEGA');
        });
      });
    });

    describe('when Connect Ethereum clicked', function () {
      // 1004-ASSO-002
      before('', function () {
        cy.get(connectToEthButton).click();
      });

      it('should have Connect Ethereum header visible', function () {
        cy.get(dialog).within(() => {
          cy.getByTestId(dialogHeader)
            .should('be.visible')
            .and('have.text', 'Connect to your Ethereum wallet');
        });
      });

      it('should have connector list visible', function () {
        const connectList = [
          'Unknown',
          'MetaMask',
          'Coinbase',
          'WalletConnect',
          'WalletConnect Legacy',
        ];
        cy.getByTestId(connectorList).within(() => {
          cy.get('button').each(($btn, i) => {
            cy.wrap($btn).should('be.visible').and('have.text', connectList[i]);
          });
        });
      });

      after('close popup', function () {
        cy.get(dialog)
          .within(() => {
            cy.getByTestId(dialogCloseBtn).click();
          })
          .should('not.exist');
      });
    });

    // 0004-EWAL-001 0004-EWAL-002
    describe('when Ethereum wallet connected', function () {
      before('connect to Ethereum wallet', function () {
        ethereumWalletConnect();
      });

      it('should have ETHEREUM KEY header visible', function () {
        cy.get(walletContainer).within(() => {
          cy.get(walletHeader)
            .should('be.visible')
            .and('have.text', 'Ethereum key');
        });
      });

      // 0004-EWAL-005
      it('should have account number visible', function () {
        cy.get(walletContainer).within(() => {
          cy.getByTestId(accountNo)
            .should('be.visible')
            .and('have.text', Cypress.env('ethWalletPublicKeyTruncated'));
        });
      });

      it('should have Associate button visible', function () {
        cy.get(walletContainer).within(() => {
          cy.get(associate).should('be.visible').and('have.text', 'Associate');
        });
      });

      it('should have Disassociate button visible', function () {
        cy.get(walletContainer).within(() => {
          cy.get(disassociate)
            .should('be.visible')
            .and('have.text', 'Disassociate');
        });
      });

      // 0004-EWAL-007
      it('should have Disconnect button visible', function () {
        cy.get(walletContainer).within(() => {
          cy.getByTestId(disconnect)
            .should('be.visible')
            .and('have.text', 'Disconnect');
        });
      });

      describe('VEGA IN VESTING CONTRACT', function () {
        // 1004-ASSO-007
        it('should have currency title visible', function () {
          cy.get(vegaInVesting).within(() => {
            cy.get(currencyTitle)
              .should('be.visible')
              .and('have.text', 'VEGAIn vesting contract');
          });
        });

        it('should have currency value visible', function () {
          cy.get(vegaInVesting).within(() => {
            cy.get(currencyValue)
              .should('be.visible')
              .invoke('text')
              .should('match', /\d{0,3}(,\d{3})*\.\d{2}$/);
          });
        });

        it('should have progress bar visible', function () {
          cy.get(vegaInVesting).within(() => {
            cy.get(progressBar).should('be.visible');
          });
        });

        it('should have locked currency visible', function () {
          cy.get(vegaInVesting).within(() => {
            cy.get(currencyLocked)
              .should('be.visible')
              .invoke('text')
              .should('match', /\d{0,3}(,\d{3})*\.\d{2}$/);
          });
        });

        it('should have unlocked currency visible', function () {
          cy.get(vegaInVesting).within(() => {
            cy.get(currencyUnlocked)
              .should('be.visible')
              .invoke('text')
              .should('match', /\d{0,3}(,\d{3})*\.\d{2}$/);
          });
        });

        it('should match total & locked/unlocked currency value', function () {
          cy.get(vegaInVesting)
            .within(() => {
              cy.get(currencyValue)
                .invoke('text')
                .then((currencyValueTxt) => {
                  convertTokenValueToNumber(currencyValueTxt).as('value');
                });
              cy.get(currencyLocked)
                .invoke('text')
                .then((currencyLockedTxt) => {
                  convertTokenValueToNumber(currencyLockedTxt).as('locked');
                });
              cy.get(currencyUnlocked)
                .invoke('text')
                .then((currencyUnlockedTxt) => {
                  convertTokenValueToNumber(currencyUnlockedTxt).as('unlocked');
                });
            })
            .then(function () {
              expect(parseFloat(this.value).toFixed(1)).to.equal(
                (Math.round((this.locked + this.unlocked) * 100) / 100).toFixed(
                  1
                )
              );
            });
        });
      });

      describe('VEGA IN WALLET', function () {
        // 1004-ASSO-007
        it('should have currency title visible', function () {
          cy.get(vegaInWallet).within(() => {
            cy.get(currencyTitle)
              .should('be.visible')
              .and('have.text', 'VEGAIn Wallet');
          });
        });

        it('should have currency value visible', function () {
          cy.get(vegaInWallet).within(() => {
            cy.get(currencyValue)
              .should('be.visible')
              .invoke('text')
              .should('match', /\d{0,3}(,\d{3})*\.\d{2}$/);
          });
        });

        it('should have progress bar visible', function () {
          cy.get(vegaInWallet).within(() => {
            cy.get(progressBar).should('be.visible');
          });
        });

        it('should have locked currency visible', function () {
          cy.get(vegaInWallet).within(() => {
            cy.get(currencyLocked)
              .should('be.visible')
              .invoke('text')
              .should('match', /\d{0,3}(,\d{3})*\.\d{2}$/);
          });
        });

        it('should have unlocked currency visible', function () {
          cy.get(vegaInWallet).within(() => {
            cy.get(currencyUnlocked)
              .should('be.visible')
              .invoke('text')
              .should('match', /\d{0,3}(,\d{3})*\.\d{2}$/);
          });
        });

        it('should match total & locked/unlocked currency value', function () {
          cy.get(vegaInWallet)
            .within(() => {
              cy.get(currencyValue)
                .invoke('text')
                .then((currencyValueTxt) => {
                  convertTokenValueToNumber(currencyValueTxt).as('value');
                });
              cy.get(currencyLocked)
                .invoke('text')
                .then((currencyLockedTxt) => {
                  convertTokenValueToNumber(currencyLockedTxt).as('locked');
                });
              cy.get(currencyUnlocked)
                .invoke('text')
                .then((currencyUnlockedTxt) => {
                  convertTokenValueToNumber(currencyUnlockedTxt).as('unlocked');
                });
            })
            .then(function () {
              expect(this.value).to.equal(this.locked + this.unlocked);
            });
        });
      });
    });
  }
);
