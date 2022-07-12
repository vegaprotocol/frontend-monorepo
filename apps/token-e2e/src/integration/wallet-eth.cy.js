const locator = {
  walletContainer: '[data-testid="ethereum-wallet"]',
  walletHeader: '[data-testid="wallet-header"] h1',
  connectToEthButton: '[data-testid="connect-to-eth-wallet-button"]',
  connectorList: '[data-testid="web3-connector-list"]',
  connectorCapsule: '[data-testid="web3-connector-Unknown"]',
  associate: '[href="/staking/associate"]',
  disassociate: '[href="/staking/disassociate"]',
  disconnect: '[data-testid="disconnect-from-eth-wallet-button"]',
  accountNo: '[data-testid="ethereum-account-truncated"]',
  currencyTitle: '[data-testid="currency-title"]',
  currencyValue: '[data-testid="currency-value"]',
  vegaInVesting: '[data-testid="vega-in-vesting-contract"]',
  vegaInWallet: '[data-testid="vega-in-wallet"]',
  progressBar: '[data-testid="progress-bar"]',
  currencyLocked: '[data-testid="currency-locked"]',
  currencyUnlocked: '[data-testid="currency-unlocked"]',
  dialog: '[role="dialog"]',
  dialogHeader: '[data-testid="dialog-title"]',
  dialogCloseBtn: '[data-testid="dialog-close"]',
};

context('Ethereum Wallet - verify elements on widget', function () {
  before('visit token home page', function () {
    cy.visit('/');
  });

  describe('with wallets disconnected', function () {
    before('wait for widget to load', function () {
      cy.get(locator.walletContainer, { timeout: 10000 }).should('be.visible');
    });

    it('should have ETHEREUM KEY header visible', function () {
      cy.get(locator.walletContainer).within(() => {
        cy.get(locator.walletHeader)
          .should('be.visible')
          .and('have.text', 'Ethereum key');
      });
    });

    it('should have Connect Ethereum button visible', function () {
      cy.get(locator.walletContainer).within(() => {
        cy.get(locator.connectToEthButton)
          .should('be.visible')
          .and('have.text', 'Connect Ethereum wallet to associate $VEGA');
      });
    });
  });

  describe('when Connect Ethereum clicked', function () {
    before('', function () {
      cy.get(locator.connectToEthButton).click();
    });

    it('should have Connect Ethereum header visible', function () {
      cy.get(locator.dialog).within(() => {
        cy.get(locator.dialogHeader)
          .should('be.visible')
          .and('have.text', 'Connect to your Ethereum wallet');
      });
    });

    it('should have connector list visible', function () {
      const connectList = [
        'Unknown',
        'MetaMask, Brave or other injected web wallet',
        'WalletConnect',
      ];
      cy.get(locator.connectorList).within(() => {
        cy.get('button').each(($btn, i) => {
          cy.wrap($btn).should('be.visible').and('have.text', connectList[i]);
        });
      });
    });

    after('close popup', function () {
      cy.get(locator.dialog)
        .within(() => {
          cy.get(locator.dialogCloseBtn).click();
        })
        .should('not.exist');
    });
  });

  describe('when Ethereum wallet connected', function () {
    before('connect to Ethereum wallet', function () {
      cy.ethereum_wallet_connect();
    });

    it('should have ETHEREUM KEY header visible', function () {
      cy.get(locator.walletContainer).within(() => {
        cy.get(locator.walletHeader)
          .should('be.visible')
          .and('have.text', 'Ethereum key');
      });
    });

    it('should have account number visible', function () {
      cy.get(locator.walletContainer).within(() => {
        cy.get(locator.accountNo)
          .should('be.visible')
          .and('have.text', Cypress.env('ethWalletPublicKeyTruncated'));
      });
    });

    it('should have Associate button visible', function () {
      cy.get(locator.walletContainer).within(() => {
        cy.get(locator.associate)
          .should('be.visible')
          .and('have.text', 'Associate');
      });
    });

    it('should have Disassociate button visible', function () {
      cy.get(locator.walletContainer).within(() => {
        cy.get(locator.disassociate)
          .should('be.visible')
          .and('have.text', 'Disassociate');
      });
    });

    it('should have Disconnect button visible', function () {
      cy.get(locator.walletContainer).within(() => {
        cy.get(locator.disconnect)
          .should('be.visible')
          .and('have.text', 'Disconnect');
      });
    });

    describe('VEGA IN VESTING CONTRACT', function () {
      it('should have currency title visible', function () {
        cy.get(locator.vegaInVesting).within(() => {
          cy.get(locator.currencyTitle)
            .should('be.visible')
            .and('have.text', 'VEGAIn vesting contract');
        });
      });

      it('should have currency value visible', function () {
        cy.get(locator.vegaInVesting).within(() => {
          cy.get(locator.currencyValue)
            .should('be.visible')
            .invoke('text')
            .should('match', /\d{0,3}(,\d{3})*\.\d{18}$/);
        });
      });

      it('should have progress bar visible', function () {
        cy.get(locator.vegaInVesting).within(() => {
          cy.get(locator.progressBar).should('be.visible');
        });
      });

      it('should have locked currency visible', function () {
        cy.get(locator.vegaInVesting).within(() => {
          cy.get(locator.currencyLocked)
            .should('be.visible')
            .invoke('text')
            .should('match', /\d{0,3}(,\d{3})*\.\d{2}$/);
        });
      });

      it('should have unlocked currency visible', function () {
        cy.get(locator.vegaInVesting).within(() => {
          cy.get(locator.currencyUnlocked)
            .should('be.visible')
            .invoke('text')
            .should('match', /\d{0,3}(,\d{3})*\.\d{2}$/);
        });
      });

      it('should match total & locked/unlocked currency value', function () {
        cy.get(locator.vegaInVesting)
          .within(() => {
            cy.get(locator.currencyValue)
              .invoke('text')
              .convertTokenValueToNumber()
              .as('value');
            cy.get(locator.currencyLocked)
              .invoke('text')
              .convertTokenValueToNumber()
              .as('locked');
            cy.get(locator.currencyUnlocked)
              .invoke('text')
              .convertTokenValueToNumber()
              .as('unlocked');
          })
          .then(function () {
            expect(this.value).to.equal(this.locked + this.unlocked);
          });
      });
    });

    describe('VEGA IN WALLET', function () {
      it('should have currency title visible', function () {
        cy.get(locator.vegaInWallet).within(() => {
          cy.get(locator.currencyTitle)
            .should('be.visible')
            .and('have.text', 'VEGAIn Wallet');
        });
      });

      it('should have currency value visible', function () {
        cy.get(locator.vegaInWallet).within(() => {
          cy.get(locator.currencyValue)
            .should('be.visible')
            .invoke('text')
            .should('match', /\d{0,3}(,\d{3})*\.\d{18}$/);
        });
      });

      it('should have progress bar visible', function () {
        cy.get(locator.vegaInWallet).within(() => {
          cy.get(locator.progressBar).should('be.visible');
        });
      });

      it('should have locked currency visible', function () {
        cy.get(locator.vegaInWallet).within(() => {
          cy.get(locator.currencyLocked)
            .should('be.visible')
            .invoke('text')
            .should('match', /\d{0,3}(,\d{3})*\.\d{2}$/);
        });
      });

      it('should have unlocked currency visible', function () {
        cy.get(locator.vegaInWallet).within(() => {
          cy.get(locator.currencyUnlocked)
            .should('be.visible')
            .invoke('text')
            .should('match', /\d{0,3}(,\d{3})*\.\d{2}$/);
        });
      });

      it('should match total & locked/unlocked currency value', function () {
        cy.get(locator.vegaInWallet)
          .within(() => {
            cy.get(locator.currencyValue)
              .invoke('text')
              .convertTokenValueToNumber()
              .as('value');
            cy.get(locator.currencyLocked)
              .invoke('text')
              .convertTokenValueToNumber()
              .as('locked');
            cy.get(locator.currencyUnlocked)
              .invoke('text')
              .convertTokenValueToNumber()
              .as('unlocked');
          })
          .then(function () {
            expect(this.value).to.equal(this.locked + this.unlocked);
          });
      });
    });
  });
});
