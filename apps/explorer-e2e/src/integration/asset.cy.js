context('Asset page', { tags: '@regression' }, () => {
  const columns = ['symbol', 'name', 'id', 'type', 'status', 'actions'];
  const hiddenOnMobile = ['id', 'type', 'status'];
  describe('Verify elements on page', () => {
    before('Navigate to assets page', () => {
      cy.visit('/assets');
    });

    it('should be able to see full assets list', () => {
      cy.getAssets().then((assets) => {
        assets.forEach((asset) => {
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
        assets.forEach((asset) => {
          cy.get(`[row-id="${asset.id}"]`).should('be.visible');
        });
      });
    });

    it.skip('should open details page when clicked on "View details"', () => {
      cy.getAssets().then((assets) => {
        assets.forEach((asset) => {
          cy.get(`[row-id="${asset.id}"] [col-id="actions"] button`)
            .eq(0)
            .should('contain.text', 'View details');
          cy.get(`[row-id="${asset.id}"] [col-id="actions"] button`)
            .eq(0)
            .click();
          cy.getByTestId('asset-header').should('have.text', asset.name);
          cy.go('back');
        });
      });
    });
  });
});
