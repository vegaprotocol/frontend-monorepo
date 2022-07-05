import commonLocators from '../locators/common.locators';
import navigationLocators from '../locators/navigation.locators';

// ----------------------------------------------------------------------

Cypress.Commands.add('common_search', function (expectedVal) {
  cy.get(commonLocators.searchBar).clear().type(expectedVal);
  cy.get(commonLocators.searchButton).click();
});

// ----------------------------------------------------------------------

Cypress.Commands.add('common_validate_search_error', function (expectedError) {
  cy.get(commonLocators.searchError).should('have.text', expectedError);
});

// ----------------------------------------------------------------------

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
);

// ----------------------------------------------------------------------

Cypress.Commands.add('common_switch_to_mobile_and_click_toggle', function () {
  cy.viewport('iphone-x');
  cy.visit('/');
  cy.get(navigationLocators.mobileToggle).click();
});
