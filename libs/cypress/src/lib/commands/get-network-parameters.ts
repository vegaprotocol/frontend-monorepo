
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      interface Chainable<Subject> {
        get_network_parameters(): void;
      }
    }
  }
  
  export function addGetNetworkParameters() {
    // @ts-ignore - ignoring Cypress type error which gets resolved when Cypress uses the command
    Cypress.Commands.add('get_network_parameters', () => {
        
        const mutation = '{networkParameters {key value}}';
        cy.request({
            method: 'POST',
            url: `http://localhost:3028/query`,
            body: {
                query: mutation,
            },
            headers: { 'content-type': 'application/json' },
        })
            .its('body.data.networkParameters')
            .then(function (response) {
            // @ts-ignore - ignoring Cypress type error which gets resolved when Cypress uses the command
            const object = response.reduce(function (r, e) {
                r[e.key] = e.value;
                return r;
            }, {});
            return object;
        });
    });
  }