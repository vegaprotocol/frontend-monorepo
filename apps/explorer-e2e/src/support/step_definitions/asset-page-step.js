import { Then, When } from 'cypress-cucumber-preprocessor/steps';

import AssetsPage from '../pages/assets-page';
const assetPage = new AssetsPage();

When('I navigate to the asset page', () => {
  assetPage.navigateToAssets();
});

Then('asset page is correctly displayed', () => {
  assetPage.validateAssetsDisplayed();
});
