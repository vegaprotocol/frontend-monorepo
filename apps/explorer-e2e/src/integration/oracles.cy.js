context('Oracle page', { tags: '@smoke' }, () => {
  describe('Verify elements on page', () => {
    before('create market and navigate to oracle page', () => {
      cy.createMarket();
      cy.visit('/oracles');
    });
    it('should see oracle data', () => {
      cy.getByTestId('oracle-details').should('have.length.at.least', 2);
      cy.getByTestId('oracle-details')
        .should('exist')
        .eq(0)
        .within(() => {
          cy.get('tr')
            .eq(0)
            .within(() => {
              cy.get('th').should('have.text', 'ID');
              cy.get('a').invoke('text').should('have.length', 64);
              cy.get('a')
                .should('have.attr', 'href')
                .and('contain', '/oracles/');
            });
          cy.get('tr')
            .eq(1)
            .within(() => {
              cy.get('th').should('have.text', 'Type');
              cy.get('td').should('have.text', 'External data');
            });
          cy.get('tr')
            .eq(2)
            .within(() => {
              cy.get('th').should('have.text', 'Signer');
              cy.getByTestId('keytype').should('have.text', 'Vega');
              cy.get('a').invoke('text').should('have.length', 64);
              cy.get('a')
                .should('have.attr', 'href')
                .and('contain', '/parties/');
            });
          cy.get('tr')
            .eq(3)
            .within(() => {
              cy.get('th').should('have.text', 'Settlement for');
              cy.get('a').invoke('text').should('have.length', 64);
              cy.get('a')
                .should('have.attr', 'href')
                .and('contain', '/markets/');
            });
          cy.get('tr')
            .eq(4)
            .within(() => {
              cy.get('th').should('have.text', 'Matched data');
              cy.get('td').should('have.text', '❌');
            });
          cy.get('details')
            .eq(0)
            .within(() => {
              cy.contains('Filter').click();
              cy.get('.language-json').should('exist');
            });
          cy.get('details')
            .eq(1)
            .within(() => {
              cy.contains('JSON').click();
              cy.get('.language-json').should('exist');
            });
        });
    });
  });
});
