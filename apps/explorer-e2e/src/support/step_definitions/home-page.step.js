import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps';
import HomePage from '../pages/home-page';
const homePage = new HomePage();

Then('the stats for {string} is correctly displayed', (expectedEnvironment) => {
  const environmentString = expectedEnvironment.toUpperCase();

  homePage.verifyStatsEnvironment(`/ ${environmentString}`);
  homePage.verifyStatsTitlesDisplayed();
  homePage.verifyStatsValuesdisplayed();
  homePage.verifyStatsBlockHeightUpdating();
});
