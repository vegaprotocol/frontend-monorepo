import BasePage from './base-page';

export default class AssetsPage extends BasePage {
  assetsHeader = 'assets-header';

  validateAssetsDisplayed() {
    cy.getByTestId(this.assetsHeader, { timeout: 8000 }).should(
      'have.text',
      'Assets'
    );
    this.validateJsonParameterNamesNotEmpty(294);
    this.validateJsonValueStringsNotEmpty(210);
    this.validateJsonValueNumbersNotEmpty(21);
  }
}
