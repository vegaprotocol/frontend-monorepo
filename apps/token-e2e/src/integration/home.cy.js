const navigation = {
  section: 'nav',
  home: '[href="/"]',
  vesting: '[href="/vesting"]',
  staking: '[href="/staking"]',
  rewards: '[href="/rewards"]',
  withdraw: '[href="/withdraw"]',
  governance: '[href="/governance"]',
};

const locator = {
  tokenDetailsTable: '.token-details',
  address: '[data-testid="token-address"]',
  contract: '[data-testid="token-contract"]',
  totalSupply: '[data-testid="total-supply"]',
  circulatingSupply: '[data-testid="circulating-supply"]',
  staked: '[data-testid="staked"]',
  tranchesLink: '[data-testid="tranches-link"]',
  redeemBtn: '[data-testid="check-vesting-page-btn"]',
  getVegaWalletLink: '[data-testid="get-vega-wallet-link"]',
  associateVegaLink: '[data-testid="associate-vega-tokens-link-on-homepage"]',
  stakingBtn: '[data-testid="staking-button-on-homepage"]',
  governanceBtn: '[data-testid="governance-button-on-homepage"]',
};

const vegaTokenAddress = Cypress.env('vegaTokenAddress');
const vegaTokenContractAddress = Cypress.env('vegaTokenContractAddress');

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
        cy.get(locator.tokenDetailsTable).within(() => {
          cy.get(locator.address)
            .should('be.visible')
            .invoke('text')
            .should('be.equal', vegaTokenAddress);
        });
      });
      it('should have VESTING CONTRACT', function () {
        cy.get(locator.tokenDetailsTable).within(() => {
          cy.get(locator.contract)
            .should('be.visible')
            .invoke('text')
            .should('be.equal', vegaTokenContractAddress);
        });
      });
      it('should have TOTAL SUPPLY', function () {
        cy.get(locator.tokenDetailsTable).within(() => {
          cy.get(locator.totalSupply).should('be.visible');
        });
      });
      it('should have CIRCULATING SUPPLY', function () {
        cy.get(locator.tokenDetailsTable).within(() => {
          cy.get(locator.circulatingSupply).should('be.visible');
        });
      });
      it('should have STAKED $VEGA', function () {
        cy.get(locator.tokenDetailsTable).within(() => {
          cy.get(locator.staked).should('be.visible');
        });
      });
    });

    describe('links and buttons', function () {
      it('should have TRANCHES link', function () {
        cy.get(locator.tranchesLink)
          .should('be.visible')
          .and('have.attr', 'href')
          .and('equal', '/tranches');
      });
      it('should have REDEEM button', function () {
        cy.get(locator.redeemBtn)
          .should('be.visible')
          .parent()
          .should('have.attr', 'href')
          .and('equal', '/vesting');
      });
      it('should have GET VEGA WALLET link', function () {
        cy.get(locator.getVegaWalletLink)
          .should('be.visible')
          .and('have.attr', 'href')
          .and('equal', 'https://vega.xyz/wallet');
      });
      it('should have ASSOCIATE VEGA TOKENS link', function () {
        cy.get(locator.associateVegaLink)
          .should('be.visible')
          .and('have.attr', 'href')
          .and('equal', '/staking/associate');
      });
      it('should have STAKING button', function () {
        cy.get(locator.stakingBtn)
          .should('be.visible')
          .parent()
          .should('have.attr', 'href')
          .and('equal', '/staking');
      });
      it('should have GOVERNANCE button', function () {
        cy.get(locator.governanceBtn)
          .should('be.visible')
          .parent()
          .should('have.attr', 'href')
          .and('equal', '/governance');
      });
    });
  });
});
