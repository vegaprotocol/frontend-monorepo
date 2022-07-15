const guideLink = '[data-testid="staking-guide-link"]';
const step1 = '[data-testid="staking-step-1"]';
const step2 = '[data-testid="staking-step-2"]';
const step3 = '[data-testid="staking-step-3"]';
const sectionHeader = 'h2';
const connectToEthBtn = '[data-testid="connect-to-eth-btn"]';
const connectToVegaBtn = '[data-testid="connect-to-vega-wallet-btn"]';
const link = '[data-testid="link"]';
const warning = '[data-testid="callout"]';

context('Staking Page - verify elements on page', function () {
  before('navigate to staking page', function () {
    cy.visit('/').navigate_to('staking');
  });

  describe('with wallets disconnected', function () {
    describe('description section', function () {
      it('should have staking tab highlighted', function () {
        cy.verify_tab_highlighted('staking');
      });

      it('should have STAKING ON VEGA header visible', function () {
        cy.verify_page_header('Staking on Vega');
      });

      it('should have Staking Guide link visible', function () {
        cy.get(guideLink)
          .should('be.visible')
          .and('have.text', 'Read more about staking on Vega')
          .and(
            'have.attr',
            'href',
            'https://docs.vega.xyz/docs/mainnet/concepts/vega-chain/#staking-on-vega'
          );
      });
    });

    describe('step 1 section', function () {
      it('should have header visible', function () {
        cy.get(step1).within(() => {
          cy.get(sectionHeader)
            .should('be.visible')
            .and('have.text', 'Step 1. Connect to a Vega Wallet');
        });
      });

      it('should have text visible', function () {
        cy.get(step1).within(() => {
          cy.get(link)
            .should('be.visible')
            .and('have.text', 'Vega Wallet')
            .and('have.attr', 'href', 'https://vega.xyz/wallet');
        });
      });

      it('should have connect to eth button visible', function () {
        cy.get(step1).within(() => {
          cy.get(connectToEthBtn)
            .should('be.visible')
            .and('have.text', 'Connect Ethereum wallet');
        });
      });

      it('should have connect to vega button visible', function () {
        cy.get(step1).within(() => {
          cy.get(connectToVegaBtn)
            .should('be.visible')
            .and('have.text', 'Connect Vega wallet');
        });
      });
    });

    describe('step 2 section', function () {
      it('should have header visible', function () {
        cy.get(step2).within(() => {
          cy.get(sectionHeader)
            .should('be.visible')
            .and('have.text', 'Step 2. Associate tokens with a Vega Wallet');
        });
      });

      it('should have warning visible', function () {
        cy.get(step2).within(() => {
          cy.get(warning)
            .should('be.visible')
            .and(
              'have.text',
              'You need to connect to an Ethereum wallet first'
            );
        });
      });
    });

    describe('step 3 section', function () {
      it('should have header visible', function () {
        cy.get(step3).within(() => {
          cy.get(sectionHeader)
            .should('be.visible')
            .and(
              'have.text',
              "Step 3. Select the validator you'd like to nominate"
            );
        });
      });
    });
  });
});
