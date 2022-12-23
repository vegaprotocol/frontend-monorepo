describe('simple trading app', { tags: '@smoke' }, () => {
  beforeEach(() => {
    cy.mockConsole();
    cy.visit('/');
  });

  it('render', () => {
    cy.get('#root').should('exist');
  });
});
