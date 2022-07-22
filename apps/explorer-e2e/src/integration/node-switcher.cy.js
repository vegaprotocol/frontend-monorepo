const nodeErrorType = 'node-error-type';
const nodeErrorMsg = 'node-error-message';

context('Node switcher', function () {
  before('visit home page', function () {
    cy.visit('/');
  });

  describe('form validations and responses', function () {
    // this.beforeEach('open node selector', function () {
    //   cy.getByTestId('git-network-data').within(() => {
    //     cy.getByTestId('link').click();
    //   });
  });
  it('node data is displayed', function () {
    const nodeId = 'node-url-1';
    cy.getByTestId('node-row').should('have.length.at.least', 1);

    cy.getByTestId('node-row')
      .eq(1)
      .within(() => {
        cy.getByTestId(nodeId)
          .should('exist')
          .and('have.attr', 'aria-checked', 'true');
        // cy.getByTestId(nodeId).find('label').should('have.text', Cypress.env('networkQueryUrl'))
        cy.get('label').should('have.text', Cypress.env('networkQueryUrl'));
        cy.getByTestId('response-time-cell')
          .find('.font-mono')
          .should('not.be.empty')
          .and('contain.text', 'ms');
        cy.getByTestId('block-cell').find('.font-mono').should('not.be.empty');
        cy.getByTestId('ssl-cell')
          .find('.font-mono')
          .should('have.text', 'Yes');
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

    cy.getByTestId('custom-node').within(() => {
      cy.get('input').clear().type('fakeUrl');
      cy.getByTestId('link').click();
    });
    validateNodeError(errorTypeTxt, nodeErrorTxt);
  });

  it('Cannot connect to network from different chain ID', function () {
    const errorTypeTxt = 'Error: incorrect network';
    const nodeErrorTxt = 'This node is not on the CUSTOM network.';

    cy.getByTestId('node-url-custom').click();

    cy.getByTestId('custom-node').within(() => {
      cy.get('input').clear().type('https://lb.testnet.vega.xyz/query');
      cy.getByTestId('link').click();
    });
    validateNodeError(errorTypeTxt, nodeErrorTxt);
  });

  function validateNodeError(errortype, errorMsg) {
    cy.getByTestId(nodeErrorType).should('have.text', errortype);
    cy.getByTestId(nodeErrorMsg).should('have.text', errorMsg);
  }
});
