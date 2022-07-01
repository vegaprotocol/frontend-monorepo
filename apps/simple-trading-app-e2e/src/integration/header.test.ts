describe('console lite header', () => {
  beforeEach(() => {
    window.localStorage.setItem('theme', 'dark');
    cy.visit('/');
  });

  it('logo should linked home', () => {
    cy.get('span').contains('Markets').click();
    cy.location('pathname').should('eq', '/markets');
    cy.getByTestId('header').find('a').click();
    cy.location('pathname').should('eq', '/');
  });

  it('theme switcher should switch theme', () => {
    cy.get('#root').children().eq(0).as('Container');
    cy.get('@Container').should('have.css', 'background-color', 'rgb(8, 8, 8)');
    cy.getByTestId('theme-switcher').click();
    cy.get('@Container').should(
      'have.css',
      'background-color',
      'rgb(255, 255, 255)'
    );
  });

  it('wallet connector should open a dialog', () => {
    cy.get('[role="dialog"]').should('not.exist');
    cy.getByTestId('connect-vega-wallet').click();
    cy.get('[role="dialog"]').should('be.visible');
  });
});
