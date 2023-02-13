context('Asset page', { tags: '@regression' }, () => {
  const columns = ['symbol', 'name', 'id', 'type', 'status', 'actions'];
  const hiddenOnMobile = ['id', 'type', 'status'];
  describe('Verify elements on page', () => {
    before('Navigate to assets page', () => {
      cy.visit('/assets');

      // Check we have enough enough assets
      cy.getAssets().then((assets) => {
        assert.isAtLeast(
          Object.keys(assets).length,
          5,
          'Ensuring we have at least 5 assets to test'
        );
      });
    });

    it('should be able to see full assets list', () => {
      cy.getAssets().then((assets) => {
        Object.values(assets).forEach((asset) => {
          cy.get(`[row-id="${asset.id}"]`).should('be.visible');
        });
      });
      columns.forEach((col) => {
        cy.get(`[col-id="${col}"]`).should('be.visible');
      });
    });

    it('should be able to see assets page displayed in mobile', () => {
      cy.switchToMobile();

      hiddenOnMobile.forEach((col) => {
        cy.get(`[col-id="${col}"]`).should('have.length', 0);
      });

      cy.getAssets().then((assets) => {
        Object.values(assets).forEach((asset) => {
          cy.get(`[row-id="${asset.id}"]`).should('be.visible');
        });
      });
    });

    it('should open details dialog when clicked on "View details"', () => {
      cy.getAssets().then((assets) => {
        Object.values(assets).forEach((asset) => {
          cy.get(`[row-id="${asset.id}"] [col-id="actions"] button`)
            .eq(0)
            .should('contain.text', 'View details');
          cy.get(`[row-id="${asset.id}"] [col-id="actions"] button`)
            .eq(0)
            .click();
          cy.getByTestId('dialog-content').should('be.visible');
          cy.getByTestId('dialog-close').click();
        });
      });
    });
  });
});
