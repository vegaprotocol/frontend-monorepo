const locator = {
  noProposals: '[data-testid="no-proposals"]',
};

context('Governance Page - verify elements on page', function () {
  before('navigate to governance page', function () {
    cy.visit('/').navigateTo('governance');
  });

  describe('with no network change proposals', function () {
    it('should have governance tab highlighted', function () {
      cy.verifyTabHighlighted('governance');
    });

    it('should have GOVERNANCE header visible', function () {
      cy.pageHeader().should('be.visible').and('have.text', 'Governance');
    });

    it('should have information box visible', function () {
      cy.get(locator.noProposals)
        .should('be.visible')
        .and('have.text', 'There are no active network change proposals');
    });
  });
});
