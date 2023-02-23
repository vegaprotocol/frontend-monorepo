import { navigateTo, navigation } from '../../support/common.functions';

const tokenDetailsTable = '.token-details';
const address = '[data-testid="token-address"]';
const contract = '[data-testid="token-contract"]';
const totalSupply = '[data-testid="total-supply"]';
const circulatingSupply = '[data-testid="circulating-supply"]';
const staked = '[data-testid="staked"]';
const tranchesLink = '[data-testid="tranches-link"]';
const redeemBtn = '[data-testid="check-vesting-page-btn"]';
const getVegaWalletLink = '[data-testid="get-vega-wallet-link"]';
const associateVegaLink =
  '[data-testid="associate-vega-tokens-link-on-homepage"]';
const stakingBtn = '[data-testid="staking-button-on-homepage"]';
const governanceBtn = '[data-testid="governance-button-on-homepage"]';

const vegaTokenAddress = Cypress.env('vegaTokenAddress');
const vegaTokenContractAddress = Cypress.env('vegaTokenContractAddress');

context('Verify elements on Token page', { tags: '@smoke' }, function () {
  before('Visit token page', function () {
    cy.visit('/');
    navigateTo(navigation.token);
  });
  describe('THE $VEGA TOKEN table', function () {
    it('should have TOKEN ADDRESS', function () {
      cy.get(tokenDetailsTable).within(() => {
        cy.get(address)
          .should('be.visible')
          .invoke('text')
          .should('be.equal', vegaTokenAddress);
      });
    });
    it('should have VESTING CONTRACT', function () {
      // 1004-ASSO-001
      cy.get(tokenDetailsTable).within(() => {
        cy.get(contract)
          .should('be.visible')
          .invoke('text')
          .should('be.equal', vegaTokenContractAddress);
      });
    });
    it('should have TOTAL SUPPLY', function () {
      cy.get(tokenDetailsTable).within(() => {
        cy.get(totalSupply).should('be.visible');
      });
    });
    it('should have CIRCULATING SUPPLY', function () {
      cy.get(tokenDetailsTable).within(() => {
        cy.get(circulatingSupply).should('be.visible');
      });
    });
    it('should have STAKED $VEGA', function () {
      cy.get(tokenDetailsTable).within(() => {
        cy.get(staked).should('be.visible');
      });
    });
  });

  describe('links and buttons', function () {
    it('should have TRANCHES link', function () {
      cy.get(tranchesLink)
        .should('be.visible')
        .and('have.attr', 'href')
        .and('equal', '/token/tranches');
    });
    it('should have REDEEM button', function () {
      cy.get(redeemBtn)
        .should('be.visible')
        .parent()
        .should('have.attr', 'href')
        .and('equal', '/token/redeem');
    });
    it('should have GET VEGA WALLET link', function () {
      cy.get(getVegaWalletLink)
        .should('be.visible')
        .and('have.attr', 'href')
        .and('equal', 'https://vega.xyz/wallet');
    });
    it('should have ASSOCIATE VEGA TOKENS link', function () {
      cy.get(associateVegaLink)
        .should('be.visible')
        .and('have.attr', 'href')
        .and('equal', '/token/associate');
    });
    it('should have STAKING button', function () {
      cy.get(stakingBtn)
        .should('be.visible')
        .parent()
        .should('have.attr', 'href')
        .and('equal', '/validators');
    });
    it('should have GOVERNANCE button', function () {
      cy.get(governanceBtn)
        .should('be.visible')
        .parent()
        .should('have.attr', 'href')
        .and('equal', '/proposals');
    });
  });
});
