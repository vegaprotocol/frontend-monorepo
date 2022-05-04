export default class AccountsList {
  accountSymbolColId = 'asset.symbol';
  accountTypeColId = 'type';
  accountMarketNameColId = 'market.name';
  accountBalanceColId = 'balance';

  verifyAccountsDisplayed() {
    cy.get(`[col-id='${this.accountSymbolColId}']`).each(($accountSymbol) => {
      cy.wrap($accountSymbol).invoke('text').should('not.be.empty');
    });
    cy.get(`[col-id='${this.accountTypeColId}']`).each(($accountType) => {
      cy.wrap($accountType).invoke('text').should('not.be.empty');
    });
    cy.get(`[col-id='${this.accountMarketNameColId}']`).each(
      ($accountMarketName) => {
        cy.wrap($accountMarketName).invoke('text').should('not.be.empty');
      }
    );
    cy.get(`[col-id='${this.accountBalanceColId}']`).each(($accountBalance) => {
      cy.wrap($accountBalance).invoke('text').should('not.be.empty');
    });
  }

  verifySingleAccountDisplayed(
    accountRowId: string,
    accountSymbol: string,
    accountType: string,
    accountMarketName: string,
    accountBalance: string
  ) {
    cy.get(`[row-id='${accountRowId}']`)
      .find(`[col-id='${this.accountSymbolColId}']`)
      .should('have.text', accountSymbol);
    cy.get(`[row-id='${accountRowId}']`)
      .find(`[col-id='${this.accountTypeColId}']`)
      .should('have.text', accountType);
    cy.get(`[row-id='${accountRowId}']`)
      .find(`[col-id='${this.accountMarketNameColId}']`)
      .should('have.text', accountMarketName);
    cy.get(`[row-id='${accountRowId}']`)
      .find(`[col-id='${this.accountBalanceColId}']`)
      .should('have.text', accountBalance);
  }
}
