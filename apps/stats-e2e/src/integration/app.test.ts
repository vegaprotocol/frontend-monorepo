const textToCheck = Cypress.env('VEGA_ENV');
// breaking changes fail
describe('stats', { tags: '@smoke' }, () => {
  beforeEach(() => cy.visit('/'));

  it.skip('should display header based on environment name', () => {
    cy.get('h3', { timeout: 10000 }).should('have.text', `/ ${textToCheck}`);
  });
  it('should fail', () => {
    expect(true).to.equal(false);
  });
});
