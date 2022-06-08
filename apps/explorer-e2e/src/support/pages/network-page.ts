import BasePage from './base-page';

export default class NetworkParametersPage extends BasePage {
  networkParametersHeader = 'network-param-header';
  parameters = 'parameters';
  parameterKeyValueRow = 'key-value-table-row';

  verifyNetworkParametersDisplayed() {
    cy.getByTestId(this.networkParametersHeader).should(
      'have.text',
      'Network Parameters'
    );

    this.validateJsonParameterNamesNotEmpty(18);
    this.validateJsonValueStringsNotEmpty(6);
    this.validateJsonValueNumbersNotEmpty(7);

    cy.getByTestId(this.parameterKeyValueRow).each(($row) => {
      cy.wrap($row).find('dt').should('not.be.empty');
      cy.wrap($row).find('dd').should('not.be.empty');
    });
  }
}
