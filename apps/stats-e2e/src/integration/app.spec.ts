const textToCheck = process.env['NX_VEGA_ENV'];

describe('stats', () => {
  beforeEach(() => cy.visit('/'));

  it('should display header based on environment name', () => {
    cy.get('h3').should('have.text', `/ ${textToCheck}`);
  });
});
