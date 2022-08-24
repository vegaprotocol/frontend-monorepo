const textToCheck = Cypress.env('VEGA_ENV');
// breaking changes fail
describe('stats', () => {
  beforeEach(() => cy.visit('/'));

  it('should display header based on environment name', () => {
    cy.get('h3').should('have.text', `/ ${textToCheck}`);
  });
});
