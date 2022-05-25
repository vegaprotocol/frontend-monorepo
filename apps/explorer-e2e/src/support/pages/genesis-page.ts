import BasePage from './base-page';

export default class GenesisPage extends BasePage {
  genesisHeader = 'genesis-header';

  genesisFieldsDisplayed() {
    this.validateBlockDataDisplayed(this.genesisHeader);
  }
}
