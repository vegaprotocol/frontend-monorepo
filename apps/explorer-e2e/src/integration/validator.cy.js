context('Validator page', { tags: '@smoke' }, function () {
  before('Visit validators page and obtain data', function () {
    cy.visit('/validators');
  });

  describe('Verify elements on page', function () {
    it('should be able to see validator tiles', function () {
      cy.getNodes().then((nodes) => {
        nodes.forEach((node) => {
          if (node.rankingScore.performanceScore > 0) {
            cy.get(`[validator-id="${node.id}"]`).should('be.visible');
          } else {
            cy.get(`[validator-id="${node.id}"]`).should('not.exist');
          }
        });
      });
    });
  });
});
