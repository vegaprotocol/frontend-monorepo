import { getNewAssetTxBody } from '../support/governance.functions';

context('Proposal page', { tags: '@smoke' }, function () {
  describe('Verify elements on page', function () {
    const proposalHeading = 'proposals-heading';
    const dateTimeRegex =
      /(\d{1,2})\/(\d{1,2})\/(\d{4}), (\d{1,2}):(\d{1,2}):(\d{1,2})/gm;

    before('Create market proposal', function () {
      cy.visit('/');
      cy.createMarket();
    });

    it('Able to view proposal', function () {
      const proposalTitle = 'Add Lorem Ipsum market';

      cy.navigate_to('governanceProposals');
      cy.getByTestId(proposalHeading).should('be.visible');
      cy.contains(proposalTitle)
        .parent()
        .parent()
        .parent()
        .within(() => {
          cy.get_element_by_col_id('title').should('have.text', proposalTitle);
          cy.get_element_by_col_id('type').should('have.text', 'NewMarket');
          cy.get_element_by_col_id('state').should('have.text', 'Enacted');
          cy.getByTestId('vote-progress').should('be.visible');
          cy.getByTestId('vote-progress-bar-for')
            .invoke('attr', 'style')
            .should('eq', 'width: 100%;');
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
      cy.getByTestId('icon-cross').click();
    });

    it.skip('Proposal page displayed on mobile', function () {
      const proposalTitle = 'Add Lorem Ipsum market';

      cy.common_switch_to_mobile_and_click_toggle();
      cy.navigate_to('governanceProposals', true);
      cy.getByTestId(proposalHeading).should('be.visible');
      cy.get('[row-index="0"]').within(() => {
        cy.get_element_by_col_id('title').should('have.text', proposalTitle);
      });
    });

    it('Able to view new asset proposal', function () {
      const proposalTitle = 'Test new asset proposal';
      const newAssetProposalBody = getNewAssetTxBody();
      cy.VegaWalletSubmitProposal(newAssetProposalBody);

      cy.visit('/');
      cy.navigate_to('governanceProposals');
      cy.contains(proposalTitle)
        .parent()
        .parent()
        .parent()
        .within(() => {
          cy.get_element_by_col_id('title').should('have.text', proposalTitle);
          cy.get_element_by_col_id('type').should('have.text', 'NewAsset');
          cy.get_element_by_col_id('state').should(
            'have.text',
            'Waiting for Node Vote'
          );
          cy.getByTestId('vote-progress').should('be.visible');
          cy.getByTestId('vote-progress-bar-against')
            .invoke('attr', 'style')
            .should('eq', 'width: 100%;');
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
    });
  });
});
