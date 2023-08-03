import { selectAsset } from '../support/helpers';

const amountField = 'input[name="amount"]';
const transferText = 'transfer-intro-text';
const errorText = 'input-error-text';
const formFieldError = 'input-error-text';
const includeTransferFeeRadioBtn = 'include-transfer-fee';
const keyID = `[data-testid="${transferText}"] > .rounded-md`;
const manageVegaWallet = 'manage-vega-wallet';
const submitTransferBtn = '[type="submit"]';
const toAddressField = '[name="toAddress"]';
const totalTransferfee = 'total-transfer-fee';
const transferAmount = 'transfer-amount';
const transferForm = 'transfer-form';
const transferFee = 'transfer-fee';
const walletTransfer = 'wallet-transfer';

const ASSET_EURO = 1;
const ASSET_SEPOLIA_TBTC = 2;

describe('transfer fees', { tags: '@regression', testIsolation: true }, () => {
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
      .type('7f9cf07d3a9905b1a61a1069f7a758855da428bc0f4a97de87f48644bfc25535');
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
      .type('7f9cf07d3a9905b1a61a1069f7a758855da428bc0f4a97de87f48644bfc25535');
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
});

describe(
  'transfer form validation',
  { tags: '@regression', testIsolation: true },
  () => {
    beforeEach(() => {
      cy.mockWeb3Provider();
      cy.mockTradingPage();
      cy.mockSubscription();
      cy.setVegaWallet();

      cy.visit('/#/portfolio');
      cy.getByTestId(manageVegaWallet).click();
      cy.getByTestId(walletTransfer).click();

      cy.wait('@Accounts');
      cy.wait('@Assets');
    });

    it('transfer Text', () => {
      // 1003-TRAN-003
      cy.getByTestId(transferText)
        .should('exist')
        .get(keyID)
        .invoke('text')
        .should('match', /[\w.]{6}…[\w.]{6}/);
    });

    it('invalid vega key validation', () => {
      //1003-TRAN-013
      //1003-TRAN-004
      cy.getByTestId(transferForm).should('be.visible');
      cy.contains('Enter manually').click();
      cy.getByTestId(transferForm).find(toAddressField).type('asd');
      cy.getByTestId(transferForm).find(submitTransferBtn).click();
      cy.getByTestId(formFieldError).should('contain.text', 'Invalid Vega key');
      cy.contains('label', 'Vega key').should('be.visible');
      cy.contains('label', 'Asset').should('be.visible');
      cy.contains('label', 'Amount').should('be.visible');
    });

    it('empty fields', () => {
      // 1003-TRAN-012
      cy.getByTestId(transferForm).find(submitTransferBtn).click();
      cy.getByTestId(formFieldError).should('contain.text', 'Required');
      cy.getByTestId(formFieldError).should('have.length', 3);
    });

    it('min amount', () => {
      // 1002-WITH-010
      // 1003-TRAN-014
      selectAsset(ASSET_SEPOLIA_TBTC);
      cy.get(amountField).clear().type('0');
      cy.getByTestId(transferForm).find(submitTransferBtn).click();
      cy.getByTestId(errorText).should(
        'contain.text',
        'Value is below minimum'
      );
    });

    it('max amount', () => {
      // 1003-TRAN-002
      // 1003-TRAN-011
      // 1003-TRAN-002
      selectAsset(ASSET_EURO); // Will be above maximum because the vega wallet doesn't have any collateral
      cy.get(amountField).clear().type('1001', { delay: 100 });
      cy.getByTestId(transferForm).find(submitTransferBtn).click();
      cy.getByTestId(errorText).should(
        'contain.text',
        'You cannot transfer more than your available collateral'
      );
    });
  }
);
