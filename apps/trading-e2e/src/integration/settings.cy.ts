describe('Settings page', { tags: '@smoke' }, () => {
  beforeEach(() => {
    cy.clearLocalStorage().then(() => {
      cy.mockTradingPage();
      cy.mockSubscription();
      cy.visit('/');
      cy.get('[aria-label="cog icon"]').click();
    });
  });
  it('telemetry checkbox should work well', () => {
    cy.location('hash').should('equal', '#/settings');
    cy.getByTestId('telemetry-approval').should(
      'have.attr',
      'data-state',
      'unchecked'
    );
    cy.get('[for="telemetry-approval"]').click();
    cy.getByTestId('telemetry-approval').should(
      'have.attr',
      'data-state',
      'checked'
    );
    cy.reload();
    cy.getByTestId('telemetry-approval').should(
      'have.attr',
      'data-state',
      'checked'
    );
    cy.get('[for="telemetry-approval"]').click();
    cy.getByTestId('telemetry-approval').should(
      'have.attr',
      'data-state',
      'unchecked'
    );
    cy.reload();
    cy.getByTestId('telemetry-approval').should(
      'have.attr',
      'data-state',
      'unchecked'
    );
  });
});
