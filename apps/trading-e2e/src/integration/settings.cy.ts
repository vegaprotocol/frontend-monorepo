describe('Settings page', { tags: '@smoke' }, () => {
  beforeEach(() => {
    cy.clearLocalStorage().then(() => {
      cy.mockTradingPage();
      cy.mockSubscription();
      cy.visit('/');
      cy.getByTestId('Settings').click();
    });
  });
  it('telemetry checkbox should work well', () => {
    const telemetrySwitch = '#switch-settings-telemetry-switch';
    cy.get(telemetrySwitch).should('have.attr', 'data-state', 'unchecked');
    cy.get(telemetrySwitch).click();
    cy.get(telemetrySwitch).should('have.attr', 'data-state', 'checked');
    cy.reload();
    cy.getByTestId('Settings').click();
    cy.get(telemetrySwitch).should('have.attr', 'data-state', 'checked');
    cy.get(telemetrySwitch).click();
    cy.get(telemetrySwitch).should('have.attr', 'data-state', 'unchecked');
    cy.reload();
    cy.getByTestId('Settings').click();
    cy.get(telemetrySwitch).should('have.attr', 'data-state', 'unchecked');
  });
});
