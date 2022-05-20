import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps';
import PortfolioPage from '../pages/portfolio-page';
import WithdrawalsPage from '../pages/withdrawals-page';

const portfolioPage = new PortfolioPage();
const withdrawalsPage = new WithdrawalsPage();

Given('I navigate to withdrawals page', () => {
  cy.visit('/');
  portfolioPage.navigateToPortfolio();
  portfolioPage.navigateToWithdraw();
});

When('I clear ethereum address', () => {
  withdrawalsPage.clearEthereumAddress();
});

When('click submit', () => {
  withdrawalsPage.clickSubmit();
});

When('I enter an invalid ethereum address', () => {
  withdrawalsPage.updateTransactionform({
    asset: undefined,
    to: '0x0dAAACaa868f87BB4666F918742141cAEAe893Fa',
    amount: undefined,
  });
  withdrawalsPage.clickSubmit();
});

Then('errors are displayed for empty fields', () => {
  withdrawalsPage.verifyFormErrorDisplayed("Required", 3)
});

Then('error for invalid ethereum address is displayed', () => {
  // Expecting empty field errors to still be displayed
  withdrawalsPage.verifyFormErrorDisplayed('Invalid Ethereum address', 3);
});
