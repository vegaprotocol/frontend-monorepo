import BasePage from './base-page';

export default class NetworkParametersPage extends BasePage {
  networkParametersHeader = 'network-param-header';
  parameters = 'parameters';
  jsonParamNameClassName = '.hljs-attr'
  jsonParamValueStringClassName = '.hljs-string'
  jsonParamValueNumberClassName = '.hljs-number'
  parameterKeyValueRow = 'key-value-table-row'

  verifyNetworkParametersDisplayed() {
    cy.getByTestId(this.networkParametersHeader).should('have.text', 'Network Parameters')

    cy.get(this.jsonParamNameClassName)
      .should('have.length.at.least', 21)
      .each(($paramName) => {
        cy.wrap($paramName).should('not.be.empty')
      })
    cy.get(this.jsonParamValueStringClassName)
      .should('have.length.at.least', 7)
      .each(($paramValue) => {
        cy.wrap($paramValue).should('not.be.empty')
      })

      cy.get(this.jsonParamValueNumberClassName)
      .should('have.length.at.least', 9)
      .each(($paramValue) => {
        cy.wrap($paramValue).should('not.be.empty')
      })

    cy.getByTestId(this.parameterKeyValueRow)
      .each(($row) => {
        cy.wrap($row).find('dt').should('not.be.empty')
        cy.wrap($row).find('dd').should('not.be.empty')
      })
  }
}
