describe('Settings page', { tags: '@smoke' }, () => {
  beforeEach(() => {
    cy.clearLocalStorage();

    cy.mockTradingPage();
    cy.mockSubscription();
    cy.visit('/');

    // Only click if not already active otherwise sidebar will close
    cy.get('[data-testid="sidebar-content"]').then(($sidebarContent) => {
      if ($sidebarContent.find('h2').text() !== 'Settings') {
        cy.get('[data-testid="sidebar"] [data-testid="Settings"]').click();
      }
    });
  });

  it('telemetry checkbox should work well', () => {
    const telemetrySwitch = '#switch-settings-telemetry-switch';
    cy.get(telemetrySwitch).should('have.attr', 'data-state', 'unchecked');
    cy.get(telemetrySwitch).click();
    cy.get(telemetrySwitch).should('have.attr', 'data-state', 'checked');
    cy.reload();
    cy.get(telemetrySwitch).should('have.attr', 'data-state', 'checked');
    cy.get(telemetrySwitch).click();
    cy.get(telemetrySwitch).should('have.attr', 'data-state', 'unchecked');
    cy.reload();
    cy.get(telemetrySwitch).should('have.attr', 'data-state', 'unchecked');
  });
});
