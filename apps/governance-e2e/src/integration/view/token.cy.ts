import { navigateTo, navigation } from '../../support/common.functions';

const tokenDetailsTable = '.token-details';
const address = 'token-address';
const contract = 'token-contract';
const totalSupply = 'total-supply';
const circulatingSupply = 'circulating-supply';
const staked = 'staked';
const tranchesLink = 'tranches-link';
const redeemBtn = 'check-vesting-page-btn';
const getVegaWalletLink = 'get-vega-wallet-link';
const associateVegaLink = 'associate-vega-tokens-link-on-homepage';
const stakingBtn = 'staking-button-on-homepage';
const governanceBtn = 'governance-button-on-homepage';

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
        cy.getByTestId(address)
          .should('be.visible')
          .invoke('text')
          .should('be.equal', vegaTokenAddress);
      });
    });
    it('should have VESTING CONTRACT', function () {
      // 1004-ASSO-001
      cy.get(tokenDetailsTable).within(() => {
        cy.getByTestId(contract)
          .should('be.visible')
          .invoke('text')
          .should('be.equal', vegaTokenContractAddress);
      });
    });
    it('should have TOTAL SUPPLY', function () {
      cy.get(tokenDetailsTable).within(() => {
        cy.getByTestId(totalSupply).should('be.visible');
      });
    });
    it('should have CIRCULATING SUPPLY', function () {
      cy.get(tokenDetailsTable).within(() => {
        cy.getByTestId(circulatingSupply).should('be.visible');
      });
    });
    it('should have STAKED $VEGA', function () {
      cy.get(tokenDetailsTable).within(() => {
        cy.getByTestId(staked).should('be.visible');
      });
    });
  });

  describe('links and buttons', function () {
    it('should have TRANCHES link', function () {
      cy.getByTestId(tranchesLink)
        .should('be.visible')
        .and('have.attr', 'href')
        .and('equal', '/token/tranches');
    });
    it('should have REDEEM button', function () {
      cy.getByTestId(redeemBtn)
        .should('be.visible')
        .parent()
        .should('have.attr', 'href')
        .and('equal', '/token/redeem');
    });
    it('should have GET VEGA WALLET link', function () {
      cy.getByTestId(getVegaWalletLink)
        .should('be.visible')
        .and('have.attr', 'href')
        .and('equal', 'https://vega.xyz/wallet');
    });
    it('should have ASSOCIATE VEGA TOKENS link', function () {
      cy.getByTestId(associateVegaLink)
        .should('be.visible')
        .and('have.attr', 'href')
        .and('equal', '/token/associate');
    });
    it('should have STAKING button', function () {
      cy.getByTestId(stakingBtn)
        .should('be.visible')
        .parent()
        .should('have.attr', 'href')
        .and('equal', '/validators');
    });
    it('should have GOVERNANCE button', function () {
      cy.getByTestId(governanceBtn)
        .should('be.visible')
        .parent()
        .should('have.attr', 'href')
        .and('equal', '/proposals');
    });
  });
});
