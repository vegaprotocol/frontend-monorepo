declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      updateCapsuleMultiSig(): Chainable<Subject>;
    }
  }
}

export function addUpdateCapsuleMultiSig() {
  Cypress.Commands.add('updateCapsuleMultiSig', () => {
    Cypress.on('uncaught:exception', () => {
      return false;
    });
    cy.log('Adding validators to multisig');
    cy.exec('vegacapsule ethereum multisig init', { failOnNonZeroExit: false })
      .its('stderr')
      .should('contain', 'Updated multisig threshold');
  });
}
