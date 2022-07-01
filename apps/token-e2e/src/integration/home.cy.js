import navigation from '../locators/navigation.locators';
import home from '../locators/home.locators';
import vegaToken from '../fixtures/vegaToken.json';

context('Home Page - verify elements on page', function () {
  before('visit token home page', function () {
    cy.visit('/');
  });

  describe('with wallets disconnected', function () {
    before('wait for page to load', function () {
      cy.get(navigation.section, { timeout: 10000 }).should('be.visible');
    });

    describe('Navigation tabs', function () {
      it('should have HOME tab', function () {
        cy.get(navigation.section).within(() => {
          cy.get(navigation.home).should('be.visible');
        });
      });
      it('should have VESTING tab', function () {
        cy.get(navigation.section).within(() => {
          cy.get(navigation.vesting).should('be.visible');
        });
      });
      it('should have STAKING tab', function () {
        cy.get(navigation.section).within(() => {
          cy.get(navigation.staking).should('be.visible');
        });
      });
      it('should have REWARDS tab', function () {
        cy.get(navigation.section).within(() => {
          cy.get(navigation.rewards).should('be.visible');
        });
      });
      it('should have WITHDRAW tab', function () {
        cy.get(navigation.section).within(() => {
          cy.get(navigation.withdraw).should('be.visible');
        });
      });
      it('should have GOVERNANCE tab', function () {
        cy.get(navigation.section).within(() => {
          cy.get(navigation.governance).should('be.visible');
        });
      });
    });

    describe('THE $VEGA TOKEN table', function () {
      it('should have TOKEN ADDRESS', function () {
        cy.get(home.tokenDetailsTable).within(() => {
          cy.get(home.address)
            .should('be.visible')
            .invoke('text')
            .should('be.equal', vegaToken.tokenAddress);
        });
      });
      it('should have VESTING CONTRACT', function () {
        cy.get(home.tokenDetailsTable).within(() => {
          cy.get(home.contract)
            .should('be.visible')
            .invoke('text')
            .should('be.equal', vegaToken.vestingContract);
        });
      });
      it('should have TOTAL SUPPLY', function () {
        cy.get(home.tokenDetailsTable).within(() => {
          cy.get(home.totalSupply).should('be.visible');
        });
      });
      it('should have CIRCULATING SUPPLY', function () {
        cy.get(home.tokenDetailsTable).within(() => {
          cy.get(home.circulatingSupply).should('be.visible');
        });
      });
      it('should have STAKED $VEGA', function () {
        cy.get(home.tokenDetailsTable).within(() => {
          cy.get(home.staked).should('be.visible');
        });
      });
    });

    describe('links and buttons', function () {
      it('should have TRANCHES link', function () {
        cy.get(home.tranchesLink)
          .should('be.visible')
          .and('have.attr', 'href')
          .and('equal', '/tranches');
      });
      it('should have REDEEM button', function () {
        cy.get(home.redeemBtn)
          .should('be.visible')
          .parent()
          .should('have.attr', 'href')
          .and('equal', '/vesting');
      });
      it('should have GET VEGA WALLET link', function () {
        cy.get(home.getVegaWalletLink)
          .should('be.visible')
          .and('have.attr', 'href')
          .and('equal', 'https://vega.xyz/wallet');
      });
      it('should have ASSOCIATE VEGA TOKENS link', function () {
        cy.get(home.associateVegaLink)
          .should('be.visible')
          .and('have.attr', 'href')
          .and('equal', '/staking/associate');
      });
      it('should have STAKING button', function () {
        cy.get(home.stakingBtn)
          .should('be.visible')
          .parent()
          .should('have.attr', 'href')
          .and('equal', '/staking');
      });
      it('should have GOVERNANCE button', function () {
        cy.get(home.governanceBtn)
          .should('be.visible')
          .parent()
          .should('have.attr', 'href')
          .and('equal', '/governance');
      });
    });
  });
});
