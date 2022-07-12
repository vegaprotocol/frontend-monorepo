const locator = {
  guideLink: '[data-testid="staking-guide-link"]',
  step1: '[data-testid="staking-step-1"]',
  step2: '[data-testid="staking-step-2"]',
  step3: '[data-testid="staking-step-3"]',
  sectionHeader: 'h2',
  connectToEthBtn: '[data-testid="connect-to-eth-btn"]',
  connectToVegaBtn: '[data-testid="connect-to-vega-wallet-btn"]',
  link: '[data-testid="link"]',
  warning: '[data-testid="callout"]',
};

context('Staking Page - verify elements on page', function () {
  before('navigate to staking page', function () {
    cy.visit('/').navigateTo('staking');
  });

  describe('with wallets disconnected', function () {
    describe('description section', function () {
      it('should have staking tab highlighted', function () {
        cy.verifyTabHighlighted('staking');
      });

      it('should have STAKING ON VEGA header visible', function () {
        cy.pageHeader()
          .should('be.visible')
          .and('have.text', 'Staking on Vega');
      });

      it('should have Staking Guide link visible', function () {
        cy.get(locator.guideLink)
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
        cy.get(locator.step1).within(() => {
          cy.get(locator.sectionHeader)
            .should('be.visible')
            .and('have.text', 'Step 1. Connect to a Vega Wallet');
        });
      });

      it('should have text visible', function () {
        cy.get(locator.step1).within(() => {
          cy.get(locator.link)
            .should('be.visible')
            .and('have.text', 'Vega Wallet')
            .and('have.attr', 'href', 'https://vega.xyz/wallet');
        });
      });

      it('should have connect to eth button visible', function () {
        cy.get(locator.step1).within(() => {
          cy.get(locator.connectToEthBtn)
            .should('be.visible')
            .and('have.text', 'Connect Ethereum wallet');
        });
      });

      it('should have connect to vega button visible', function () {
        cy.get(locator.step1).within(() => {
          cy.get(locator.connectToVegaBtn)
            .should('be.visible')
            .and('have.text', 'Connect Vega wallet');
        });
      });
    });

    describe('step 2 section', function () {
      it('should have header visible', function () {
        cy.get(locator.step2).within(() => {
          cy.get(locator.sectionHeader)
            .should('be.visible')
            .and('have.text', 'Step 2. Associate tokens with a Vega Wallet');
        });
      });

      it('should have warning visible', function () {
        cy.get(locator.step2).within(() => {
          cy.get(locator.warning)
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
        cy.get(locator.step3).within(() => {
          cy.get(locator.sectionHeader)
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
