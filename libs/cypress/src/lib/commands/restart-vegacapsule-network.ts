declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      restart_vegacapsule_network(): void;
    }
  }
}

export function addRestartVegacapsuleNetwork() {
  Cypress.Commands.add('restart_vegacapsule_network', () => {
    Cypress.on('uncaught:exception', () => {
      // stopping the network causes errors with pending transactions
      // This stops those errors from preventing the teardown
      return false;
    });
    cy.log('Destroying capsule network');
    // We stop the network twice - since it does not always shutdown correctly on first attempt
    cy.exec('vegacapsule network destroy', { failOnNonZeroExit: false });
    cy.exec('vegacapsule network destroy', { failOnNonZeroExit: false })
      .its('stderr')
      .should('contain', 'Network has been successfully cleaned up');

    cy.log('Bootstrapping network');
    cy.exec(
      'vegacapsule network bootstrap --config-path=../../vegacapsule/config.hcl --force',
      { failOnNonZeroExit: false, timeout: 100000 }
    )
      .its('stderr')
      .then((response) => {
        if (!response.includes('Network successfully started')) {
          cy.log('Bootstrapping network second time');
          cy.exec('vegacapsule network destroy', { failOnNonZeroExit: false })
            .its('stderr')
            .should('contain', 'Network has been successfully cleaned up');
          cy.exec(
            'vegacapsule network bootstrap --config-path=../../vegacapsule/config.hcl --force',
            { failOnNonZeroExit: false, timeout: 100000 }
          )
            .its('stderr')
            .then((response) => {
              return response;
            });
        }
      })
      .should('contain', 'Network successfully started');
  });
}
