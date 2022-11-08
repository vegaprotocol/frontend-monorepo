const textToCheck = Cypress.env('VEGA_ENV');
// breaking changes fail
describe('stats', () => {
  beforeEach(() => cy.visit('/'));

  it.skip('should display header based on environment name', () => {
    console.log('test');
    cy.get('h3', { timeout: 10000 }).should('have.text', `/ ${textToCheck}`);
  });
});
