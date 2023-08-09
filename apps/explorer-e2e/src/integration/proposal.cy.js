context('Proposal page', { tags: '@smoke' }, function () {
  describe('Verify elements on page', function () {
    const proposalHeading = 'proposals-heading';
    const dateTimeRegex =
      /(\d{1,2})\/(\d{1,2})\/(\d{4}), (\d{1,2}):(\d{1,2}):(\d{1,2})/gm;
    const proposalTitle = 'Add Lorem Ipsum market';

    before('Create market proposal', function () {
      cy.visit('/');
      cy.createMarket();
    });

    it('Able to view proposal', function () {
      cy.navigate_to('governanceProposals');
      cy.getByTestId(proposalHeading).should('be.visible');
      // get first proposal in list
      cy.get('[row-index="0"]').within(() => {
        cy.get_element_by_col_id('title').should('have.text', proposalTitle);
        cy.get_element_by_col_id('type').should('have.text', 'NewMarket');
        cy.get_element_by_col_id('state').should('have.text', 'Enacted');
        cy.getByTestId('vote-progress').should('be.visible');
        cy.get('[col-id="cDate"]')
          .invoke('text')
          .should('match', dateTimeRegex);
        cy.get('[col-id="eDate"]')
          .invoke('text')
          .should('match', dateTimeRegex);
        cy.getByTestId('external-link')
          .should('have.attr', 'href')
          .and('contains', 'https://governance.fairground.wtf/proposals/');
        cy.contains('View terms').should('exist').click();
      });
      cy.getByTestId('dialog-title').should('have.text', proposalTitle);
      cy.get('.language-json').should('exist');
    });

    it('Proposal page displayed on mobile', function () {
      cy.common_switch_to_mobile_and_click_toggle();
      cy.navigate_to('governanceProposals', true);
      cy.getByTestId(proposalHeading).should('be.visible');
      cy.get('[row-index="0"]').within(() => {
        cy.get_element_by_col_id('title').should('have.text', proposalTitle);
      });
    });
  });
});
