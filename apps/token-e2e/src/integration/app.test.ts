const fairgroundSet = Cypress.env('FAIRGROUND');

describe('token', () => {
  beforeEach(() => cy.visit('/'));

  it('should always have a header title based on environment', () => {
    cy.get('[data-testid="header-title"]').should(
      'have.text',
      `${fairgroundSet ? 'Fairground token' : '$VEGA TOKEN'}`
    );
  });
});
