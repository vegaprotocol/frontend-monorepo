const noOpenProposals = '[data-testid="no-open-proposals"]';
const noClosedProposals = '[data-testid="no-closed-proposals"]';

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

    it('should have information visible', function () {
      cy.get(noOpenProposals)
        .should('be.visible')
        .and('have.text', 'There are no open or yet to enact proposals');
      cy.get(noClosedProposals)
        .should('be.visible')
        .and('have.text', 'There are no enacted or rejected proposals');
    });
  });
});
