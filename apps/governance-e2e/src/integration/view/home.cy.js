context('Home Page - verify elements on page', { tags: '@smoke' }, function () {
  before('visit token home page', function () {
    cy.visit('/');
    cy.get('nav', { timeout: 10000 }).should('be.visible');
  });

  describe('with wallets disconnected', function () {
    describe('Links and buttons', function () {
      it('should have link for proposal page', function () {
        cy.getByTestId('home-proposals').within(() => {
          cy.get('[href="/proposals"]')
            .should('exist')
            .and('have.text', 'Browse, vote, and propose');
        });
      });
      it('should show open or enacted proposals with proposal summary', function () {
        cy.get('body').then(($body) => {
          if (!$body.find('[data-testid="proposals-list-item"]').length) {
            cy.createMarket();
            cy.reload();
            cy.wait_for_spinner();
          }
        });
        cy.getByTestId('proposals-list-item')
          .should('have.length.at.least', 1)
          .first()
          .within(() => {
            cy.getByTestId('proposal-title')
              .invoke('text')
              .should('not.be.empty');
            cy.getByTestId('proposal-type')
              .invoke('text')
              .should('not.be.empty');
            cy.getByTestId('proposal-description')
              .invoke('text')
              .should('not.be.empty');
            cy.getByTestId('proposal-details')
              .invoke('text')
              .should('not.be.empty');
            cy.getByTestId('proposal-status')
              .invoke('text')
              .should('not.be.empty');
            cy.getByTestId('vote-details')
              .invoke('text')
              .should('not.be.empty');
            cy.getByTestId('view-proposal-btn').should('be.visible');
          });
      });
      it('should have external link for governance', function () {
        cy.getByTestId('home-proposals').within(() => {
          cy.getByTestId('external-link')
            .should('have.attr', 'href')
            .and('contain', 'https://vega.xyz/governance');
        });
      });
      it('should have link for validator page', function () {
        cy.getByTestId('home-validators').within(() => {
          cy.get('[href="/validators"]')
            .first()
            .should('exist')
            .and('have.text', 'Browse, and stake');
        });
      });
      it('should have external link for validators', function () {
        cy.getByTestId('home-validators').within(() => {
          cy.getByTestId('external-link')
            .should('have.attr', 'href')
            .and(
              'contain',
              'https://community.vega.xyz/c/mainnet-validator-candidates'
            );
        });
      });
      it('should have information on active nodes', function () {
        cy.getByTestId('node-information')
          .first()
          .should('contain.text', '2')
          .and('contain.text', 'active nodes');
      });
      it('should have information on consensus nodes', function () {
        cy.getByTestId('node-information')
          .last()
          .should('contain.text', '2')
          .and('contain.text', 'consensus nodes');
      });
      it('should contain link to specific validators', function () {
        cy.getByTestId('validators')
          .should('have.length', '2')
          .each(($validator) => {
            cy.wrap($validator).find('a').should('have.attr', 'href');
          });
      });
      it('should have link for rewards page', function () {
        cy.getByTestId('home-rewards').within(() => {
          cy.get('[href="/rewards"]')
            .first()
            .should('exist')
            .and('have.text', 'See rewards');
        });
      });
      it('should have link for withdrawal page', function () {
        cy.getByTestId('home-vega-token').within(() => {
          cy.get('[href="/token/withdraw"]')
            .first()
            .should('exist')
            .and('have.text', 'Manage tokens');
        });
      });
    });
  });
});
