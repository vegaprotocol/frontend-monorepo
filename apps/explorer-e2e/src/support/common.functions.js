Cypress.Commands.add(
  'common_validate_blocks_data_displayed',
  function (headerTestId) {
    cy.get(headerTestId).then(($assetHeaders) => {
      const headersLength = Number($assetHeaders.length);

      cy.wrap($assetHeaders).each(($header) => {
        expect($header).to.not.be.empty;
      });

      cy.get('.language-json')
        .each(($asset) => {
          expect($asset).to.not.be.empty;
        })
        .then(($list) => {
          expect($list).to.have.length(headersLength);
        });
    });
  }
),
  Cypress.Commands.add('common_switch_to_mobile_and_click_toggle', function () {
    cy.viewport('iphone-x');
    cy.visit('/');
    cy.get('[data-testid="open-menu"]').click();
  }),
  Cypress.Commands.add('common_verify_json_parameters', function (expectedNum) {
    cy.get('.hljs-attr')
      .should('have.length.at.least', expectedNum)
      .each(($paramName) => {
        cy.wrap($paramName).should('not.be.empty');
      });
  }),
  Cypress.Commands.add(
    'common_verify_json_string_values',
    function (expectedNum) {
      cy.get('.hljs-string')
        .should('have.length.at.least', expectedNum)
        .each(($paramValue) => {
          cy.wrap($paramValue).should('not.be.empty');
        });
    }
  ),
  Cypress.Commands.add('common_verify_json_int_values', function (expectedNum) {
    cy.get('.hljs-number')
      .should('have.length.at.least', expectedNum)
      .each(($paramValue) => {
        cy.wrap($paramValue).should('not.be.empty');
      });
  });
