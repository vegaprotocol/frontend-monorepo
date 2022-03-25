import { Then, When } from 'cypress-cucumber-preprocessor/steps';
import NetworkPage from '../pages/network-page';
const networkPage = new NetworkPage();

When('I navigate to network parameters page', () => {
  networkPage.navigateToNetworkParameters();
});

Then('network parameters page is correctly displayed', () => {
  networkPage.verifyNetworkParametersDisplayed();
});
