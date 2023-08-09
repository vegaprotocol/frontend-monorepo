import { selectAsset } from '../support/helpers';

const amountField = 'input[name="amount"]';
const transferText = 'transfer-intro-text';
const errorText = 'input-error-text';
const formFieldError = 'input-error-text';
const keyID = `[data-testid="${transferText}"] > .rounded-md`;
const manageVegaWallet = 'manage-vega-wallet';
const submitTransferBtn = '[type="submit"]';
const toAddressField = '[name="toAddress"]';
const transferForm = 'transfer-form';
const walletTransfer = 'wallet-transfer';

const ASSET_EURO = 1;
const ASSET_SEPOLIA_TBTC = 2;

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

      cy.mockVegaWalletTransaction();
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
