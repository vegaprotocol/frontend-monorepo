import BasePage from './base-page';

export default class NetworkParametersPage extends BasePage {
  networkParametersHeader = 'network-param-header';
  parameters = 'parameters';

  verifyNetworkParametersDisplayed() {
    cy.getByTestId(this.networkParametersHeader).should(
      'have.text',
      'NetworkParameters'
    );
    cy.getByTestId(this.parameters).should('not.be.empty');
  }
}
