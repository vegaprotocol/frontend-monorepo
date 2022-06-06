import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps';
import MarketPage from '../pages/markets-page';
import PortfolioPage from '../pages/portfolio-page';
import WithdrawalsPage from '../pages/withdrawals-page';

const marketPage = new MarketPage();
const portfolioPage = new PortfolioPage();
const withdrawalsPage = new WithdrawalsPage();

Given('I navigate to withdrawal page', () => {
  cy.visit('/');
  portfolioPage.closeDialog();
  marketPage.validateMarketsAreDisplayed();
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
  withdrawalsPage.updateTransactionForm({
    to: '0x0dAAACaa868f87BB4666F918742141cAEAe893Fa',
  });
  withdrawalsPage.clickSubmit();
});

When('I select {string}', (selectedAsset) => {
  withdrawalsPage.updateTransactionForm({
    asset: selectedAsset,
  });
});

When('ethereum address is connected Ethereum wallet', () => {
  withdrawalsPage.validateTestWalletEthWalletAddress();
});

When('I click Use maximum', () => {
  withdrawalsPage.clickUseMaximum();
});

When('I enter the following details in withdrawal form', (table) => {
  withdrawalsPage.updateTransactionForm({
    asset: table.rowsHash().asset,
    to: table.rowsHash().to,
    amount: table.rowsHash().amount,
  });
  withdrawalsPage.clickSubmit();
});

When('I succesfully fill in and submit withdrawal form', () => {
  withdrawalsPage.updateTransactionForm({
    asset: Cypress.env('WITHDRAWAL_ASSET_ID'),
    amount: '0.1',
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
  const ethAddressLink = `${Cypress.env('ETHERSCAN_URL')}/address/${Cypress.env(
    'ETHEREUM_WALLET_ADDRESS'
  )}`;
  const etherScanLink = `${Cypress.env(
    'ETHERSCAN_URL'
  )}/tx/0x0d1a5d209f468ff248326d4ae7647ad5a3667ce463341a0250118a95f3beb597`;

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
