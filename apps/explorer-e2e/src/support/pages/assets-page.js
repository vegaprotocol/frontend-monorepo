import BasePage from './base-page';

export default class AssetsPage extends BasePage {
  assetHeader = 'asset-header';

  validateAssetsDisplayed() {
    this.validateBlockDataDisplayed(this.assetHeader);
  }
}
