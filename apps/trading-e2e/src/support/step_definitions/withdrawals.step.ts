import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps';
import PortfolioPage from '../pages/portfolio-page';
import WithdrawalsPage from '../pages/withdrawals-page';

const portfolioPage = new PortfolioPage();
const withdrawalsPage = new WithdrawalsPage();

Given('I navigate to withdrawal page', () => {
  cy.visit('/');
  portfolioPage.closeDialog()
  portfolioPage.navigateToPortfolio();
  portfolioPage.navigateToWithdraw();
});

Given('I navigate to withdrawals page', () => {
  portfolioPage.navigateToPortfolio();
  portfolioPage.navigateToWithdrawals();
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

When('I select {string}', (selectedAsset) => {
  withdrawalsPage.updateTransactionform({
    asset: selectedAsset,
    to: undefined,
    amount: undefined,
  });
});

When('ethereum address is connected Ethereum wallet', () => {
  withdrawalsPage.validateTestWalletEthWalletAddress();
});

When('I click Use maximum', () => {
  withdrawalsPage.clickUseMaximum();
});

When('I enter the following details in withdrawal form', (table) => {
  withdrawalsPage.updateTransactionform({
    asset: table.rowsHash().asset,
    to: table.rowsHash().to,
    amount: table.rowsHash().amount,
  });
  withdrawalsPage.clickSubmit();
});

Then('errors are displayed for empty fields', () => {
  withdrawalsPage.verifyFormErrorDisplayed('Required', 3);
});

Then('error for invalid ethereum address is displayed', () => {
  // Expecting empty field errors to still be displayed
  withdrawalsPage.verifyFormErrorDisplayed('Invalid Ethereum address', 3);
});

Then('connect to Vega wallet is displayed', () => {
  withdrawalsPage.validateConnectWalletText();
});

Then('expected amount is {string}', (expectedAmount) => {
  withdrawalsPage.validateAmount(expectedAmount);
});

Then('withdrawal modal is displayed', () => {
  withdrawalsPage.validateConfirmWithdrawalModal();
});

Then('error for below minumum amount is displayed', () => {
  withdrawalsPage.verifyFormErrorDisplayed('Value is below minimum', 1);
});

Then('error for above maximum amount is displayed', () => {
  withdrawalsPage.verifyFormErrorDisplayed('Value is above maximum', 1);
});

Then('history of withdrawals are displayed', () => {
  const ethAddressLink =
    `https://ropsten.etherscan.io/address/${Cypress.env('ETHEREUM_WALLET_ADDRESS')}`;
  const etherScanLink =
    'https://ropsten.etherscan.io/tx/0x0d1a5d209f468ff248326d4ae7647ad5a3667ce463341a0250118a95f3beb597';

  withdrawalsPage.validateWithdrawalAssetDisplayed('tEURO');
  withdrawalsPage.validateWithdrawalAmountDisplayed('10,000.00000');
  withdrawalsPage.validateWithdrawalRecipientDisplayed(
    '0x265C…807158',
    ethAddressLink
  );
  withdrawalsPage.validateWithdrawalDateDisplayed();
  withdrawalsPage.validateWithdrawalStatusDisplayed('Finalized');
  withdrawalsPage.validateEtherScanLinkDisplayed(etherScanLink);
});
