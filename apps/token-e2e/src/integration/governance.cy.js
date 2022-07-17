const noProposals = '[data-testid="no-proposals"]';

context('Governance Page - verify elements on page', function () {
  before('navigate to governance page', function () {
    cy.visit('/').navigate_to('governance');
  });

  describe('with no network change proposals', function () {
    it('should have governance tab highlighted', function () {
      cy.verify_tab_highlighted('governance');
    });

    it('should have GOVERNANCE header visible', function () {
      cy.verify_page_header('Governance');
    });

    it('should have information box visible', function () {
      cy.get(noProposals)
        .should('be.visible')
        .and('have.text', 'There are no active network change proposals');
    });
  });
});
