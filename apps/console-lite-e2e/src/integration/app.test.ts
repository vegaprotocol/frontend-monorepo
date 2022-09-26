describe('simple trading app', { tags: '@smoke' }, () => {
  beforeEach(() => cy.visit('/'));

  it('render', () => {
    cy.get('#root').should('exist');
  });
});
