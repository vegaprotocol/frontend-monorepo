import { Then } from 'cypress-cucumber-preprocessor/steps';
import DepositsPage from '../pages/deposits-page';

const depositsPage = new DepositsPage();

const tBTC = Cypress.env('tBtcContract');
const invalidPublicKey =
  'zzz85edfa7ffdb6ed996ca912e9258998e47bf3515c885cf3c63fb56b15de36f';

beforeEach(() => {
  cy.mockWeb3ProviderWithNewWallet();
});

Then('I navigate to new deposits page', () => {
  depositsPage.navigateToDeposits();
});

Then('I update the form', () => {
  depositsPage.updateForm({
    asset: tBTC,
    to: invalidPublicKey,
    amount: '1',
  });
});
