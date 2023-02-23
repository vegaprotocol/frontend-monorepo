declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      get_network_parameters(): Chainable<JQuery<HTMLElement>>;
    }
  }
}

export function addGetNetworkParameters() {
  // @ts-ignore - ignoring Cypress type error which gets resolved when Cypress uses the command
  Cypress.Commands.add('get_network_parameters', () => {
    const mutation = `
  {
    networkParametersConnection {
      edges {
        node {
          key
          value
        }
      }
    }
  }`;
    cy.request({
      method: 'POST',
      url: `http://localhost:3028/query`,
      body: {
        query: mutation,
      },
      headers: { 'content-type': 'application/json' },
    })
      .its('body.data.networkParametersConnection.edges')
      .then(function (response) {
        // @ts-ignore - ignoring Cypress type error which gets resolved when Cypress uses the command
        const object = response.reduce(function (r, e) {
          const { value, key } = e.node;
          r[key] = value;
          return r;
        }, {});
        return cy.wrap(object);
      });
  });
}
