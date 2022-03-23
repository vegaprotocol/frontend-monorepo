import { Then, When } from 'cypress-cucumber-preprocessor/steps';

import BlocksPage from '../pages/blocks-page';
const blocksPage = new BlocksPage();

When('I navigate to the blocks page', () => {
  blocksPage.navigateToBlocks();
});

When('I click on first block', () => {
  blocksPage.clickOnTopBlockHeight();
});

Then('blocks page is correctly displayed', () => {
  blocksPage.validateBlocksPageDisplayed();
});

Then('validator block page is correctly displayed', () => {
  blocksPage.validateBlockValidatorPage();
});
