import commonLocators from '../locators/common.locators';
import navigationLocators from '../locators/navigation.locators';

export function common_search(expectedVal) {
  cy.get(commonLocators.searchBar).clear().type(expectedVal);
  cy.get(commonLocators.searchButton).click();
}

export function common_validate_search_error(expectedError) {
  cy.get(commonLocators.searchError).should('have.text', expectedError);
}

export function common_validate_blocks_data_displayed(headerTestId) {
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

export function common_switch_to_mobile_and_click_toggle() {
  cy.viewport('iphone-x');
  cy.visit('/');
  cy.get(navigationLocators.mobileToggle).click();
}

export function common_verify_json_parameters(expectedNum) {
  cy.get('.hljs-attr')
    .should('have.length.at.least', expectedNum)
    .each(($paramName) => {
      cy.wrap($paramName).should('not.be.empty');
    });
}

export function common_verify_json_string_values(expectedNum) {
  cy.get('.hljs-string')
    .should('have.length.at.least', expectedNum)
    .each(($paramValue) => {
      cy.wrap($paramValue).should('not.be.empty');
    });
}

export function common_verify_json_int_values(expectedNum) {
  cy.get('.hljs-number')
    .should('have.length.at.least', expectedNum)
    .each(($paramValue) => {
      cy.wrap($paramValue).should('not.be.empty');
    });
}
