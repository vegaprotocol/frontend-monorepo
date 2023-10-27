const nodeErrorType = 'node-error-type';
const nodeErrorMsg = 'node-error-message';
const nodeId = 'node-url-0';
const customNodeBtn = 'custom-node';

context.skip('Node switcher', { tags: '@regression' }, function () {
  beforeEach('visit home page', function () {
    cy.intercept('GET', 'https://static.vega.xyz/assets/capsule-network.json', {
      hosts: ['http://localhost:3008/graphql'],
    }).as('nodeData');
    cy.visit('/');
    cy.wait('@nodeData');
    cy.getByTestId('git-network-data').within(() => {
      cy.getByTestId('link').should('be.visible').click();
    });
  });

  describe('form validations and responses', function () {
    it('node data is displayed', function () {
      cy.getByTestId('node-row').should('have.length.at.least', 2);

      cy.getByTestId('node-row')
        .eq(0)
        .within(() => {
          cy.getByTestId(nodeId)
            .should('exist')
            .and('have.attr', 'aria-checked', 'true');
          cy.get('label').should('have.text', Cypress.env('networkQueryUrl'));
          cy.getByTestId('ssl-cell').should('have.text', 'Checking');
          cy.getByTestId('ssl-cell', { timeout: 6000 }).should(
            'not.have.text',
            'Checking'
          );
          cy.getByTestId('response-time-cell').should('contain.text', 'ms');
          cy.getByTestId('block-cell').should('not.be.empty');
        });
    });

    it('cannot connect to network using invalid url', function () {
      const errorTypeTxt = 'Error: invalid url';
      const nodeErrorTxt = 'fakeUrl is not a valid url.';

      cy.getByTestId('node-url-custom').click({ force: true });

      cy.getByTestId(customNodeBtn).within(() => {
        cy.get('input').clear().type('fakeUrl');
        cy.getByTestId('link').click();
      });
      validateNodeError(errorTypeTxt, nodeErrorTxt);
    });

    function validateNodeError(errortype, errorMsg) {
      cy.getByTestId(nodeErrorType).should('have.text', errortype);
      cy.getByTestId(nodeErrorMsg).should('have.text', errorMsg);
    }
  });
});
