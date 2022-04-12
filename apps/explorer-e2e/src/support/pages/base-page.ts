export default class BasePage {
  transactionsUrl = '/txs';
  blocksUrl = '/blocks';
  partiesUrl = '/parties';
  assetsUrl = '/assets';
  genesisUrl = '/genesis';
  governanceUrl = '/governance';
  marketsUrl = '/markets';
  networkParametersUrl = '/network-parameters';
  validatorsUrl = '/validators';
  blockExplorerHeader = 'explorer-header';
  searchField = 'search';
  searchButton = 'search-button';
  searchError = 'search-error';
  openMobileMenuBtn = 'open-menu';

  navigateToTxs() {
    cy.get(`a[href='${this.transactionsUrl}']`).click();
  }

  navigateToBlocks() {
    cy.get(`a[href='${this.blocksUrl}']`).click();
  }

  navigateToParties() {
    cy.get(`a[href='${this.partiesUrl}']`).click();
  }

  navigateToAssets() {
    cy.get(`a[href*='${this.assetsUrl}']`).click();
  }

  navigateToGenesis() {
    cy.get(`a[href='${this.genesisUrl}']`).click();
  }

  navigateToGovernance() {
    cy.get(`a[href='${this.governanceUrl}']`).click();
  }

  navigateToMarkets() {
    cy.get(`a[href='${this.marketsUrl}']`).click();
  }

  navigateToNetworkParameters() {
    cy.get(`a[href='${this.networkParametersUrl}']`).click();
  }

  navigateToValidators() {
    cy.get(`a[href='${this.validatorsUrl}']`).click();
  }

  search(searchText: string) {
    if (searchText) {
      cy.getByTestId(this.searchField).type(searchText);
    }
  }

  clickSearch() {
    cy.getByTestId(this.searchButton).click();
  }

  clickOnToggle() {
    cy.getByTestId(this.openMobileMenuBtn).click({ force: true });
  }

  validateUrl(expectedUrl: string) {
    cy.url().should('include', expectedUrl);
  }

  validateSearchDisplayed() {
    cy.getByTestId(this.blockExplorerHeader).should(
      'have.text',
      'Vega Explorer'
    );
    cy.getByTestId(this.searchField).should('be.visible');
  }

  validateSearchErrorDisplayed(errorMessage: string) {
    cy.getByTestId(this.searchError).should('have.text', errorMessage);
  }

  validateBlockDataDisplayed(headerTestId: string) {
    cy.getByTestId(headerTestId).then(($assetHeaders: JQuery<HTMLElement>) => {
      const headersAmount = Number($assetHeaders.length);

      cy.wrap($assetHeaders).each(($header) => {
        expect($header).to.not.be.empty;
      });

      cy.get('.language-json')
        .each(($asset) => {
          expect($asset).to.not.be.empty;
        })
        .then(($list) => {
          expect($list).to.have.length(headersAmount);
        });
    });
  }
}
