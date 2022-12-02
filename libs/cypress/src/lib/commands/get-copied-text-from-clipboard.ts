declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      getCopiedTextFromClipboard(clipboard: string): void;
      // Must first setup with cy.monitorClipboard().as('clipboard')
      // This function then chained off a cy.get('@clipboard')
    }
  }
}

export function addGetCopiedTextFromClipboard() {
  Cypress.Commands.add(
    'getCopiedTextFromClipboard',
    { prevSubject: true },
    (clipboard) => {
      return clipboard.args[0][1];
    }
  );
}
