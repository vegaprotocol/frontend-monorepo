import common from '../locators/common.locators';

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'common_search', function (expectedVal) {
    cy.get(common.searchBar).clear().type(expectedVal)
    cy.get(common.searchButton).click()
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'common_validate_search_error', function (expectedError) {
    cy.get(common.searchError).should('have.text', expectedError)
  }
);
