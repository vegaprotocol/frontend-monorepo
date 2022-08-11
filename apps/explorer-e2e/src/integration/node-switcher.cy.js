const nodeErrorType = 'node-error-type';
const nodeErrorMsg = 'node-error-message';
const nodeId = 'node-url-0';
const customNodeBtn = 'custom-node';
const closeDialogBtn = 'dialog-close';

context('Node switcher', function () {
  before('visit home page', function () {
    cy.intercept('GET', 'https://static.vega.xyz/assets/capsule-network.json', {
      hosts: ['http://localhost:3028/query'],
    }).as('nodeData');
    cy.visit('/');
    cy.wait('@nodeData');
  });

  describe('form validations and responses', function () {
    beforeEach('open node selector', function () {
      cy.getByTestId('git-network-data').within(() => {
        cy.getByTestId('link').click();
      });
    });
    it('node data is displayed', function () {
      cy.getByTestId('node-row').should('have.length.at.least', 1);

      cy.getByTestId('node-row')
        .eq(0)
        .within(() => {
          cy.getByTestId(nodeId)
            .should('exist')
            .and('have.attr', 'aria-checked', 'true');
          cy.get('label').should('have.text', Cypress.env('networkQueryUrl'));
          cy.getByTestId('response-time-cell')
            .should('not.be.empty')
            .and('contain.text', 'ms');
          cy.getByTestId('block-cell').should('not.be.empty');
          cy.getByTestId('ssl-cell').should('have.text', 'Yes');
        });
    });

    it('Incorrect network displayed', function () {
      const errorTypeTxt = 'Error: incorrect network';
      const nodeErrorTxt = 'This node is not on the CUSTOM network.';

      validateNodeError(errorTypeTxt, nodeErrorTxt);
    });

    it('cannot connect to network using invalid url', function () {
      const errorTypeTxt = 'Error: invalid url';
      const nodeErrorTxt = 'fakeUrl is not a valid url.';

      cy.getByTestId('node-url-custom').click();

      cy.getByTestId(customNodeBtn).within(() => {
        cy.get('input').clear().type('fakeUrl');
        cy.getByTestId('link').click();
      });
      validateNodeError(errorTypeTxt, nodeErrorTxt);
    });

    it('Cannot connect to network from different chain ID', function () {
      const errorTypeTxt = 'Error: incorrect network';
      const nodeErrorTxt = 'This node is not on the CUSTOM network.';

      cy.getByTestId('node-url-custom').click();

      cy.getByTestId(customNodeBtn).within(() => {
        cy.get('input').clear().type('https://api.token.vega.xyz/query');
        cy.getByTestId('link').click();
      });
      validateNodeError(errorTypeTxt, nodeErrorTxt);
    });

    afterEach('Close node switcher', function () {
      cy.getByTestId(closeDialogBtn).should('be.enabled').click();
    });

    function validateNodeError(errortype, errorMsg) {
      cy.getByTestId(nodeErrorType, { timeout: 10000 }).should(
        'have.text',
        errortype
      );
      cy.getByTestId(nodeErrorMsg).should('have.text', errorMsg);
    }
  });
});
