import navigation from '../locators/navigation.locators';
import staking from '../locators/staking.locators';

context('Staking Page - verify elements on page', function () {
  before('navigate to staking page', function () {
    cy.visit('/')
      .get(navigation.section)
      .within(() => {
        cy.get(navigation.staking).click();
      });
  });

  describe('with wallets disconnected', function () {
    describe('description section', function () {
      it('should have staking tab highlighted', function () {
        cy.get(navigation.section).within(() => {
          cy.get(navigation.staking).should('have.attr', 'aria-current');
        });
      });

      it('should have STAKING ON VEGA header visible', function () {
        cy.get(staking.pageHeader)
          .should('be.visible')
          .and('have.text', 'Staking on Vega');
      });

      it('should have Staking Guide link visible', function () {
        cy.get(staking.guideLink)
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
        cy.get(staking.step1).within(() => {
          cy.get(staking.sectionHeader)
            .should('be.visible')
            .and('have.text', 'Step 1. Connect to a Vega Wallet');
        });
      });

      it('should have text visible', function () {
        cy.get(staking.step1).within(() => {
          cy.get(staking.link)
            .should('be.visible')
            .and('have.text', 'Vega Wallet')
            .and('have.attr', 'href', 'https://vega.xyz/wallet');
        });
      });

      it('should have connect to eth button visible', function () {
        cy.get(staking.step1).within(() => {
          cy.get(staking.connectToEthBtn)
            .should('be.visible')
            .and('have.text', 'Connect Ethereum wallet');
        });
      });
      it('should have connect to vega button visible', function () {
        cy.get(staking.step1).within(() => {
          cy.get(staking.connectToVegaBtn)
            .should('be.visible')
            .and('have.text', 'Connect Vega wallet');
        });
      });
    });
    describe('step 2 section', function () {
      it('should have header visible', function () {
        cy.get(staking.step2).within(() => {
          cy.get(staking.sectionHeader)
            .should('be.visible')
            .and('have.text', 'Step 2. Associate tokens with a Vega Wallet');
        });
      });
      it('should have warning visible', function () {
        cy.get(staking.step2).within(() => {
          cy.get(staking.warning)
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
        cy.get(staking.step3).within(() => {
          cy.get(staking.sectionHeader)
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
