describe('market list', () => {
  describe('simple url', () => {
    beforeEach(() => {
      cy.visit('/markets');
    });

    it('selects menus', () => {
      cy.get('[aria-label="Sidebar Navigation Menu"] [aria-current]').should(
        'have.text',
        'Markets'
      );
      cy.getByTestId('state-trigger').should('have.text', 'Active');
      cy.get('[aria-label="Future"]').click();
      cy.get('[data-testid="market-assets-menu"] a.active').should(
        'have.text',
        'All'
      );
    });

    it('navigation should make possibly shortest url', () => {
      cy.location('pathname').should('equal', '/markets');

      cy.getByTestId('state-trigger').click();
      cy.get('[role=menuitemcheckbox]').contains('All').click();
      cy.location('pathname').should('equal', '/markets/all');

      cy.get('[aria-label="Future"]').click();
      cy.location('pathname').should('eq', '/markets/all/Future');
      let asset = '';
      cy.getByTestId('market-assets-menu')
        .children()
        .then((children) => {
          if (children.length > 1) {
            asset = children[1].innerText;
            if (asset) {
              cy.wrap(children[1]).click();
              cy.location('pathname').should(
                'match',
                new RegExp(`/markets/all/Future/${asset}`, 'i')
              );
              cy.get('a').contains('All Markets').click();
              cy.location('pathname').should('eq', '/markets/all');
            }
          }
        });

      cy.getByTestId('state-trigger').click();
      cy.get('[role=menuitemcheckbox]').contains('Active').click();
      cy.location('pathname').should('equal', '/markets');
    });
  });

  describe('url params should select filters', () => {
    it('suspended status', () => {
      cy.visit('/markets/Suspended');
      cy.getByTestId('state-trigger').should('have.text', 'Suspended');
    });

    it('last asset (if exists)', () => {
      cy.intercept('POST', '/query').as('Filters');
      cy.visit('/markets');
      cy.wait('@Filters').then((filters) => {
        if (filters?.response?.body.data.markets.length) {
          const asset =
            filters.response.body.data.markets[0].tradableInstrument.instrument
              .product.settlementAsset.symbol;
          cy.visit(`/markets/Suspended/Future/${asset}`);
          cy.getByTestId('market-assets-menu')
            .find('a.active')
            .should('have.text', asset);
        }
      });
    });

    it('Future product', () => {
      cy.visit('/markets/Suspended/Future');
      cy.getByTestId('market-products-menu')
        .find('a.active')
        .should('have.text', 'Future');
    });
  });
});
