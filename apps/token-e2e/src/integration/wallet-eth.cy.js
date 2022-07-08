import ethWallet from '../locators/wallet-eth.locators';
import '../support/wallet-eth.functions';

context('Ethereum Wallet - verify elements on widget', function () {
  before('visit token home page', function () {
    cy.visit('/');
  });

  describe('with wallets disconnected', function () {
    before('wait for widget to load', function () {
      cy.get(ethWallet.walletContainer, { timeout: 10000 }).should(
        'be.visible'
      );
    });

    it('should have ETHEREUM KEY header visible', function () {
      cy.get(ethWallet.walletContainer).within(() => {
        cy.get(ethWallet.walletHeader)
          .should('be.visible')
          .and('have.text', 'Ethereum key');
      });
    });

    it('should have Connect Ethereum button visible', function () {
      cy.get(ethWallet.walletContainer).within(() => {
        cy.get(ethWallet.connectToEthButton)
          .should('be.visible')
          .and('have.text', 'Connect Ethereum wallet to associate $VEGA');
      });
    });
  });

  describe('when Connect Ethereum clicked', function () {
    before('', function () {
      cy.get(ethWallet.connectToEthButton).click();
    });

    it('should have Connect Ethereum header visible', function () {
      cy.get(ethWallet.dialog).within(() => {
        cy.get(ethWallet.dialogHeader)
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
      cy.get(ethWallet.connectorList).within(() => {
        cy.get('button').each(($btn, i) => {
          cy.wrap($btn).should('be.visible').and('have.text', connectList[i]);
        });
      });
    });

    after('close popup', function () {
      cy.get(ethWallet.dialog)
        .within(() => {
          cy.get(ethWallet.dialogCloseBtn).click();
        })
        .should('not.exist');
    });
  });

  describe('when Ethereum wallet connected', function () {
    before('connect to Ethereum wallet', function () {
      cy.ethereum_wallet_connect();
    });

    it('should have ETHEREUM KEY header visible', function () {
      cy.get(ethWallet.walletContainer).within(() => {
        cy.get(ethWallet.walletHeader)
          .should('be.visible')
          .and('have.text', 'Ethereum key');
      });
    });

    it('should have account number visible', function () {
      cy.get(ethWallet.walletContainer).within(() => {
        cy.get(ethWallet.accountNo)
          .should('be.visible')
          .and('have.text', Cypress.env('ethWalletPublicKeyTruncated'));
      });
    });

    it('should have Associate button visible', function () {
      cy.get(ethWallet.walletContainer).within(() => {
        cy.get(ethWallet.associate)
          .should('be.visible')
          .and('have.text', 'Associate');
      });
    });

    it('should have Disassociate button visible', function () {
      cy.get(ethWallet.walletContainer).within(() => {
        cy.get(ethWallet.disassociate)
          .should('be.visible')
          .and('have.text', 'Disassociate');
      });
    });

    it('should have Disconnect button visible', function () {
      cy.get(ethWallet.walletContainer).within(() => {
        cy.get(ethWallet.disconnect)
          .should('be.visible')
          .and('have.text', 'Disconnect');
      });
    });

    describe('VEGA IN VESTING CONTRACT', function () {
      it('should have currency title visible', function () {
        cy.get(ethWallet.vegaInVesting).within(() => {
          cy.get(ethWallet.currencyTitle)
            .should('be.visible')
            .and('have.text', 'VEGAIn vesting contract');
        });
      });

      it('should have currency value visible', function () {
        cy.get(ethWallet.vegaInVesting).within(() => {
          cy.get(ethWallet.currencyValue)
            .should('be.visible')
            .invoke('text')
            .should('match', /\d{0,3}(,\d{3})*\.\d{18}$/);
        });
      });

      it('should have progress bar visible', function () {
        cy.get(ethWallet.vegaInVesting).within(() => {
          cy.get(ethWallet.progressBar).should('be.visible');
        });
      });

      it('should have locked currency visible', function () {
        cy.get(ethWallet.vegaInVesting).within(() => {
          cy.get(ethWallet.currencyLocked)
            .should('be.visible')
            .invoke('text')
            .should('match', /\d{0,3}(,\d{3})*\.\d{2}$/);
        });
      });

      it('should have unlocked currency visible', function () {
        cy.get(ethWallet.vegaInVesting).within(() => {
          cy.get(ethWallet.currencyUnlocked)
            .should('be.visible')
            .invoke('text')
            .should('match', /\d{0,3}(,\d{3})*\.\d{2}$/);
        });
      });

      it('should match total & locked/unlocked currency value', function () {
        cy.get(ethWallet.vegaInVesting)
          .within(() => {
            [
              [ethWallet.currencyValue, 'currencyValue'],
              [ethWallet.currencyLocked, 'currencyLocked'],
              [ethWallet.currencyUnlocked, 'currencyUnlocked'],
            ].forEach(([element, alias]) => {
              cy.get(element).invoke('text').as(alias);
            });
          })
          .then(function () {
            const [value, locked, unlocked] = [
              this.currencyValue,
              this.currencyLocked,
              this.currencyUnlocked,
            ].map((v) => parseFloat(v.replace(/,/g, '')));
            expect(value).to.equal(locked + unlocked);
          });
      });
    });

    describe('VEGA IN WALLET', function () {
      it('should have currency title visible', function () {
        cy.get(ethWallet.vegaInWallet).within(() => {
          cy.get(ethWallet.currencyTitle)
            .should('be.visible')
            .and('have.text', 'VEGAIn Wallet');
        });
      });

      it('should have currency value visible', function () {
        cy.get(ethWallet.vegaInWallet).within(() => {
          cy.get(ethWallet.currencyValue)
            .should('be.visible')
            .invoke('text')
            .should('match', /\d{0,3}(,\d{3})*\.\d{18}$/);
        });
      });

      it('should have progress bar visible', function () {
        cy.get(ethWallet.vegaInWallet).within(() => {
          cy.get(ethWallet.progressBar).should('be.visible');
        });
      });

      it('should have locked currency visible', function () {
        cy.get(ethWallet.vegaInWallet).within(() => {
          cy.get(ethWallet.currencyLocked)
            .should('be.visible')
            .invoke('text')
            .should('match', /\d{0,3}(,\d{3})*\.\d{2}$/);
        });
      });

      it('should have unlocked currency visible', function () {
        cy.get(ethWallet.vegaInWallet).within(() => {
          cy.get(ethWallet.currencyUnlocked)
            .should('be.visible')
            .invoke('text')
            .should('match', /\d{0,3}(,\d{3})*\.\d{2}$/);
        });
      });

      it('should match total & locked/unlocked currency value', function () {
        cy.get(ethWallet.vegaInWallet)
          .within(() => {
            [
              [ethWallet.currencyValue, 'currencyValue'],
              [ethWallet.currencyLocked, 'currencyLocked'],
              [ethWallet.currencyUnlocked, 'currencyUnlocked'],
            ].forEach(([element, alias]) => {
              cy.get(element).invoke('text').as(alias);
            });
          })
          .then(function () {
            const [value, locked, unlocked] = [
              this.currencyValue,
              this.currencyLocked,
              this.currencyUnlocked,
            ].map((v) => parseFloat(v.replace(/,/g, '')));
            expect(value).to.equal(locked + unlocked);
          });
      });
    });
  });
});
