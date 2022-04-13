const fairgroundSet = Cypress.env('FAIRGROUND');

describe('token', () => {
  beforeEach(() => cy.visit('/'));

  it('should always have an header title based on environment', () => {
    cy.get('.nav h1').should(
      'have.text',
      `${fairgroundSet ? 'Fairground token' : '$VEGA TOKEN'}`
    );
  });
});
