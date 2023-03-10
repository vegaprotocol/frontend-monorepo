import { selectAsset } from '../support/helpers';

const formFieldError = 'input-error-text';
const toAddressField = '[name="toAddress"]';
const amountField = 'input[name="amount"]';
const submitTransferBtn = '[type="submit"]';
const transferForm = 'transfer-form';
const errorText = 'input-error-text';
const openTransferDialog = 'open-transfer-dialog';
const closeDialog = 'dialog-close';
const dialogTransferText = 'dialog-transfer-text';

const ASSET_SEPOLIA_TBTC = 2;
const ASSET_EURO = 1;

const toastContent = 'toast-content';
const collateralTab = 'Collateral';
const toastCloseBtn = 'toast-close';

describe(
  'transfer form validation and transfer from options',
  { tags: '@smoke' },
  () => {
    before(() => {
      cy.mockWeb3Provider();
      cy.mockTradingPage();
      cy.mockSubscription();
      cy.setVegaWallet();

      cy.visit('/#/portfolio');
      cy.getByTestId(collateralTab).click();
      cy.getByTestId(openTransferDialog).click();

      cy.wait('@Accounts');
      cy.wait('@Assets');
    });

    it('empty fields', () => {
      cy.getByTestId(transferForm).find(submitTransferBtn).click();

      cy.getByTestId(formFieldError).should('contain.text', 'Required');
      // only 2 despite 3 fields because the ethereum address will be auto populated
      cy.getByTestId(formFieldError).should('have.length', 3);
    });
    it('min amount', () => {
      // 1002-WITH-010
      selectAsset(ASSET_SEPOLIA_TBTC);
      cy.get(amountField).clear().type('0');
      cy.getByTestId(transferForm).find(submitTransferBtn).click();
      cy.getByTestId(errorText).should(
        'contain.text',
        'Value is below minimum'
      );
    });
    it('max amount', () => {
      selectAsset(ASSET_EURO); // Will be above maximum because the vega wallet doesn't have any collateral
      cy.get(amountField).clear().type('1001', { delay: 100 });
      cy.getByTestId(transferForm).find(submitTransferBtn).click();
      cy.getByTestId(errorText).should(
        'contain.text',
        'You cannot transfer more than your available collateral'
      );
    });

    it('can start transfer from vega wallet', () => {
      cy.getByTestId(closeDialog).click();
      cy.getByTestId('manage-vega-wallet').click();
      cy.getByTestId('wallet-transfer').should('have.text', 'Transfer').click();
      cy.getByTestId(dialogTransferText).should(
        'contain.text',
        'Transfer funds to another Vega key from 02ecea…342f65 If you are at all unsure, stop and seek advice.'
      );
    });

    it('can start transfer from trading collateral table', () => {
      cy.getByTestId(closeDialog).click();
      cy.getByTestId('Trading').first().click();
      cy.getByTestId(collateralTab).click();
      cy.getByTestId(openTransferDialog).should('not.exist');
      cy.getByTestId('Portfolio').eq(0).click();
      cy.getByTestId(collateralTab).click();
      cy.getByTestId(openTransferDialog).click();
      cy.getByTestId(dialogTransferText).should(
        'contain.text',
        'Transfer funds to another Vega key from 02ecea…342f65 If you are at all unsure, stop and seek advice.'
      );
    });
  }
);

describe('withdraw actions', { tags: '@regression' }, () => {
  beforeEach(() => {
    cy.mockWeb3Provider();
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.setVegaWallet();

    cy.visit('/#/portfolio');
    cy.getByTestId(collateralTab).click();
    cy.getByTestId(openTransferDialog).click();

    cy.wait('@Accounts');
    cy.wait('@Assets');
    cy.mockVegaWalletTransaction();
  });

  it('key to key transfers by select key', function () {
    cy.getByTestId(transferForm).should('be.visible');
    cy.getByTestId(transferForm).find(toAddressField).select(1);
    selectAsset(ASSET_SEPOLIA_TBTC);
    cy.getByTestId(transferForm).find(amountField).type('1', { delay: 100 });
    cy.getByTestId(transferForm).find(submitTransferBtn).click();
    cy.getByTestId(toastContent).should(
      'contain.text',
      'Awaiting confirmation'
    );
    cy.getByTestId(toastCloseBtn).click();
  });

  it('key to key transfers by enter manual key', function () {
    cy.getByTestId(transferForm).should('be.visible');
    cy.contains('Enter manually').click();
    cy.getByTestId(transferForm)
      .find(toAddressField)
      .type('7f9cf07d3a9905b1a61a1069f7a758855da428bc0f4a97de87f48644bfc25535');
    selectAsset(ASSET_SEPOLIA_TBTC);
    cy.getByTestId(transferForm).find(amountField).type('1', { delay: 100 });
    cy.getByTestId(transferForm).find(submitTransferBtn).click();
    cy.getByTestId(toastContent).should(
      'contain.text',
      'Awaiting confirmation'
    );
    cy.getByTestId(toastCloseBtn).click();
  });
});
