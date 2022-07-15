import navigation from '../locators/navigation.locators';
import governance from '../locators/governance.locators';

context('Governance Page - verify elements on page', function () {
  before('navigate to governance page', function () {
    cy.visit('/')
      .get(navigation.section)
      .within(() => {
        cy.get(navigation.governance).click();
      });
  });

  describe('with no network change proposals', function () {
    it('should have governance tab highlighted', function () {
      cy.get(navigation.section).within(() => {
        cy.get(navigation.governance).should('have.attr', 'aria-current');
      });
    });

    it('should have GOVERNANCE header visible', function () {
      cy.get(governance.pageHeader)
        .should('be.visible')
        .and('have.text', 'Governance');
    });

    it('should have information box visible', function () {
      cy.get(governance.noOpenProposals)
        .should('be.visible')
        .and('have.text', 'There are no open or yet to enact proposals');
      cy.get(governance.noClosedProposals)
        .should('be.visible')
        .and('have.text', 'There are no enacted or rejected proposals');
    });
  });
});
