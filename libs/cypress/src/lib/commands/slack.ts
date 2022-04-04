// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    slack(message: string): void;
  }
}

export function addSlackCommand() {
  // @ts-ignore - ignoring Cypress type error which gets resolved when Cypress uses the command
  Cypress.Commands.add('slack', (message) => {
    const text = `${message}: ${JSON.stringify(Cypress.spec)}`;

    cy.log('NOTIFYING SLACK');

    const webhook = Cypress.env('slackWebhook');

    if (!webhook) {
      return;
    }

    cy.request('POST', webhook, {
      text,
    });
  });
}
