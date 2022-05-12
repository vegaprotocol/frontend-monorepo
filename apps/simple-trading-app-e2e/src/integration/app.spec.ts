describe('stats', () => {
  beforeEach(() => cy.visit('/'));

  it('render', () => {
    cy.get('#root').should('exist');
  });
});
