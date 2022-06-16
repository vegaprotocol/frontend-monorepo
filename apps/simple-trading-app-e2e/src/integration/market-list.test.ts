describe('market list', () => {
  describe('simple url', () => {
    beforeEach(() => cy.visit('/markets'));

    it('selects menus', () => {
      cy.get('.MuiDrawer-root [aria-current]').should('have.text', 'Markets');
      cy.get('select[name="states"]').should('have.value', 'Active');
      cy.get('[data-testid="market-assets-menu"] button.font-bold').should(
        'have.text',
        'All'
      );
    });

    it('navigation should make possibly shortest url', () => {
      cy.location('pathname').should('equal', '/markets');

      cy.get('select[name="states"]').select('All');
      cy.location('pathname').should('equal', '/markets/all');
      cy.getByTestId('market-assets-menu').children().contains('tEURO').click();
      cy.location('pathname').should('equal', '/markets/all/tEURO');

      cy.get('button').contains('Future').click();
      cy.location('pathname').should('equal', '/markets/all/tEURO/Future');

      cy.get('button').contains('All Markets').click();
      cy.location('pathname').should('equal', '/markets/all/tEURO');

      cy.getByTestId('market-assets-menu')
        .children()
        .find('button')
        .contains('All')
        .click();
      cy.location('pathname').should('equal', '/markets/all');

      cy.get('select[name="states"]').select('Active');
      cy.location('pathname').should('equal', '/markets');
    });
  });

  describe('url params should select filters', () => {
    it('suspended status', () => {
      cy.visit('/markets/Suspended');
      cy.get('select[name="states"]').should('have.value', 'Suspended');
    });

    it('tBTC asset', () => {
      cy.visit('/markets/Suspended/tBTC');
      cy.getByTestId('market-assets-menu')
        .find('button.font-bold')
        .should('have.text', 'tBTC');
    });

    it('Future product', () => {
      cy.visit('/markets/Suspended/tBTC/Future');
      cy.getByTestId('market-products-menu')
        .find('button.active')
        .should('have.text', 'Future');
    });
  });
});
