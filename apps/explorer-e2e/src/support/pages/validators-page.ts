import BasePage from './base-page';

export default class ValidatorPage extends BasePage {
  tendermintHeader = 'tendermint-header';
  vegaHeader = 'vega-header';
  tendermintData = 'tendermint-data';
  vegaData = 'vega-data';

  validateValidatorsDisplayed() {
    cy.getByTestId(this.tendermintHeader).should(
      'have.text',
      'Tendermint data'
    );
    cy.getByTestId(this.tendermintData).should('not.be.empty');
    cy.getByTestId(this.vegaHeader).should('have.text', 'Vega data');
    cy.getByTestId(this.vegaData).should('not.be.empty');
  }
}
