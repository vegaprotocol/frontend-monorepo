import BasePage from './base-page';

export default class GenesisPage extends BasePage {
  GenesisHeader = 'genesis-header';

  genesisFieldsDisplayed() {
    this.validateBlockDataDisplayed(this.GenesisHeader);
  }
}
