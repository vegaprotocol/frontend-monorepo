const noOpenProposals = '[data-testid="no-open-proposals"]';
const noClosedProposals = '[data-testid="no-closed-proposals"]';
const proposalDocumentationLink = '[data-testid="external-link"]';
const newProposalLink = '[data-testid="new-proposal-link"]';
const governanceDocsUrl = 'https://vega.xyz/governance';

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

    it('should be able to see a working link for - find out more about Vega governance', function () {
      // 1004-VOTE-001
      cy.get(proposalDocumentationLink)
        .should('be.visible')
        .and('have.text', 'Find out more about Vega governance')
        .and('have.attr', 'href')
        .and('equal', governanceDocsUrl);

      cy.request(governanceDocsUrl)
        .its('body')
        .then((body) => {
          if (!body.includes('Govern the network')) {
            assert.include(
              body,
              'Govern the network',
              `Checking that governance link includes 'Govern the network' text`
            );
          }
        });
    });

    it('should be able to see button for - new proposal', function () {
      // 1004-VOTE-002
      cy.get(newProposalLink)
        .should('be.visible')
        .and('have.text', 'New proposal')
        .and('have.attr', 'href')
        .and('equal', '/governance/propose');
    });

    it('should be able to see that no proposals exist', function () {
      // 1004-VOTE-003
      cy.get(noOpenProposals)
        .should('be.visible')
        .and('have.text', 'There are no open or yet to enact proposals');
      cy.get(noClosedProposals)
        .should('be.visible')
        .and('have.text', 'There are no enacted or rejected proposals');
    });
  });
});
