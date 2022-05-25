import { Then, When } from 'cypress-cucumber-preprocessor/steps';

import BlocksPage from '../pages/blocks-page';
const blocksPage = new BlocksPage();

When('I navigate to the blocks page', () => {
  blocksPage.navigateToBlocks();
});

When('I click on top block', () => {
  blocksPage.clickOnTopBlockHeight();
});

When('jump to first block', () => {
  blocksPage.jumpToBlock('1');
});

Then('blocks page is correctly displayed', () => {
  blocksPage.validateBlocksPageDisplayed();
});

Then('validator block page is correctly displayed', () => {
  blocksPage.validateBlockValidatorPage();
});

Then('I am on the previous block when I click previous', () => {
  blocksPage.navigateToPreviousBlock();
});

Then('previous button is disabled', () => {
  blocksPage.verifyPreviousBtnDisabled();
});

Then('I am on the second block when I click next', () => {
  blocksPage.navigateToNextBlock();
});

Then('I scroll down to the last block on the page', () => {
  blocksPage.navigateToLastBlockOnPage();
});

Then(
  'I can expect to see {int} blocks if i scroll {int} times',
  (expectedBlocks, scrollAttempts) => {
    blocksPage.navigateToOlderBlocksWithInfiniteScroll(
      expectedBlocks,
      scrollAttempts
    );
  }
);
