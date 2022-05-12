describe('simple trading app', () => {
  beforeEach(() => cy.visit('/'));

  it('render', () => {
    cy.get('#root').should('exist');
  });
});
