describe('market list', () => {
  describe('simple url', () => {
    beforeEach(() => cy.visit('/markets'));

    it('selects menus', () => {
      cy.get('.MuiDrawer-root [aria-current]').should('have.text', 'Markets');
      cy.getByTestId('state-trigger').should('have.text', 'Active');
      cy.get('[data-testid="market-assets-menu"] button.active').should(
        'have.text',
        'All'
      );
    });

    it('navigation should make possibly shortest url', () => {
      cy.location('pathname').should('equal', '/markets');

      cy.getByTestId('state-trigger').click();
      cy.get('[role=menuitemcheckbox]').contains('All').click();
      cy.location('pathname').should('equal', '/markets/all');

      let asset = '';
      cy.getByTestId('market-assets-menu')
        .children()
        .then((children) => {
          if (children.length > 1) {
            asset = children[1].innerText;
            if (asset) {
              cy.wrap(children[1]).click();
              cy.location('pathname').should('equal', `/markets/all/${asset}`);
            }
          }
        });
      if (asset) {
        cy.get('button').contains('Future').click();
        cy.location('pathname').should('equal', `/markets/all/${asset}/Future`);

        cy.get('button').contains('All Markets').click();
        cy.location('pathname').should('equal', `/markets/all/${asset}`);
      }
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

    it('last asset (if exists)', () => {
      cy.intercept('POST', '/query').as('Filters');
      cy.visit('/markets');
      cy.wait('@Filters').then((filters) => {
        if (filters?.response?.body.data.markets.length) {
          const asset =
            filters?.response?.body.data.markets[0].tradableInstrument
              .instrument.product.settlementAsset.symbol;
          cy.visit(`/markets/Suspended/${asset}`);
          cy.getByTestId('market-assets-menu')
            .find('button.font-bold')
            .should('have.text', asset);
        }
      });
    });

    it('Future product', () => {
      cy.visit('/markets/Suspended/all/Future');
      cy.getByTestId('market-products-menu')
        .find('button.active')
        .should('have.text', 'Future');
    });
  });
});
