import { selectAsset } from '../support/helpers';

const amountField = 'input[name="amount"]';
const includeTransferFeeRadioBtn = 'include-transfer-fee';
const manageVegaWallet = 'manage-vega-wallet';
const toAddressField = '[name="toAddress"]';
const totalTransferfee = 'total-transfer-fee';
const transferAmount = 'transfer-amount';
const transferForm = 'transfer-form';
const transferFee = 'transfer-fee';
const walletTransfer = 'wallet-transfer';

const ASSET_SEPOLIA_TBTC = 2;

describe.skip(
  'transfer fees',
  { tags: '@regression', testIsolation: true },
  () => {
    beforeEach(() => {
      cy.mockWeb3Provider();
      cy.mockTradingPage();
      cy.mockSubscription();
      cy.setVegaWallet();

      cy.visit('/');
      cy.getByTestId(manageVegaWallet).click();
      cy.getByTestId(walletTransfer).click();

      cy.wait('@Assets');
      cy.wait('@Accounts');

      cy.mockVegaWalletTransaction();
    });

    it('transfer fees tooltips', () => {
      // 1003-TRAN-015
      // 1003-TRAN-016
      // 1003-TRAN-017
      // 1003-TRAN-018
      // 1003-TRAN-019
      cy.getByTestId(transferForm);
      cy.contains('Enter manually').click();
      cy.getByTestId(transferForm)
        .find(toAddressField)
        .type(
          '7f9cf07d3a9905b1a61a1069f7a758855da428bc0f4a97de87f48644bfc25535'
        );
      selectAsset(ASSET_SEPOLIA_TBTC);
      cy.getByTestId(transferForm)
        .find(amountField)
        .type('1', { delay: 100, force: true });

      /// Check Include Transfer Fee tooltip
      cy.get('label[for="include-transfer-fee"] div').realHover();
      cy.get('[data-side="bottom"] div')
        .should('be.visible')
        .should('not.be.empty');

      //Check Transfer Fee tooltip
      cy.contains('div', 'Transfer fee').realHover();
      cy.get('[data-side="bottom"] div')
        .should('be.visible')
        .should('not.be.empty');

      //Check Amount to be transferred tooltip
      cy.contains('div', 'Amount to be transferred').realHover();
      cy.get('[data-side="bottom"] div')
        .should('be.visible')
        .should('not.be.empty');

      //Check Total amount (with fee) tooltip
      cy.contains('div', 'Total amount (with fee)').realHover();
      cy.get('[data-side="bottom"] div')
        .should('be.visible')
        .should('not.be.empty');
    });

    it('transfer fees', () => {
      // 1003-TRAN-020
      // 1003-TRAN-021
      // 1003-TRAN-022
      // 1003-TRAN-023
      cy.getByTestId(transferForm);
      cy.contains('Enter manually').click();

      cy.getByTestId(transferForm)
        .find(toAddressField)
        .type(
          '7f9cf07d3a9905b1a61a1069f7a758855da428bc0f4a97de87f48644bfc25535'
        );
      selectAsset(ASSET_SEPOLIA_TBTC);
      cy.getByTestId(includeTransferFeeRadioBtn).should('be.disabled');

      cy.getByTestId(transferForm)
        .find(amountField)
        .type('1', { delay: 100, force: true });

      cy.getByTestId(transferFee)
        .should('be.visible')
        .should('contain.text', '0.01');
      cy.getByTestId(transferAmount)
        .should('be.visible')
        .should('contain.text', '1.00');
      cy.getByTestId(totalTransferfee)
        .should('be.visible')
        .should('contain.text', '1.01');
      cy.getByTestId(includeTransferFeeRadioBtn).click();
      cy.getByTestId(transferFee)
        .should('be.visible')
        .should('contain.text', '0.01');
      cy.getByTestId(transferAmount)
        .should('be.visible')
        .should('contain.text', '0.99');
      cy.getByTestId(totalTransferfee)
        .should('be.visible')
        .should('contain.text', '1.00');
    });
  }
);
