import BasePage from './base-page';

export default class NetworkParametersPage extends BasePage {
  networkParametersHeader = 'network-param-header';
  parameters = 'parameters';

  verifyNetworkParametersDisplayed() {
    cy.getByTestId(this.networkParametersHeader).should(
      'have.text',
      'Network Parameters'
    );
    cy.getByTestId(this.parameters).should('not.be.empty');
  }

  eachValueIsNonEmpty() {
    cy.getByTestId(this.parameters).then(($parameters) => {
      $parameters.each((_index, element) => {
        cy.wrap(element).should('not.be.empty');
      });
    });
  }
}
