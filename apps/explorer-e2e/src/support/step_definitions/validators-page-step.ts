import { Then, When } from 'cypress-cucumber-preprocessor/steps';

import ValidatorPage from '../pages/validators-page';
const validatorsPage = new ValidatorPage();

When('I navigate to the validators page', () => {
  validatorsPage.navigateToValidators();
});

Then('validators page is correctly displayed', () => {
  validatorsPage.validateValidatorsDisplayed();
});
