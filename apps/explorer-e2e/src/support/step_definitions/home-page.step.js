import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps';
import HomePage from '../pages/home-page';
const homePage = new HomePage();

Then('the stats for deployed environment are correctly displayed', () => {
  homePage.verifyStatsEnvironment();
  homePage.verifyStatsTitlesDisplayed();
  homePage.verifyStatsValuesdisplayed();
  homePage.verifyStatsBlockHeightUpdating();
});
