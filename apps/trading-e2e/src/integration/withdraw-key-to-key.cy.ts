import { selectAsset } from '../support/helpers';

const amountField = 'input[name="amount"]';
const amountShortName = 'input[name="amount"] + div + span.text-xs';
const assetSelection = 'select-asset';
const assetBalance = 'asset-balance';
const assetOption = 'rich-select-option';
const openTransferButton = 'open-transfer';
const submitTransferBtn = '[type="submit"]';
const toAddressField = '[name="toAddress"]';
const transferForm = 'transfer-form';
const ASSET_SEPOLIA_TBTC = 2;
const collateralTab = 'Collateral';
const toastCloseBtn = 'toast-close';
const toastContent = 'toast-content';

describe('withdraw actions', { tags: '@smoke', testIsolation: true }, () => {
  beforeEach(() => {
    cy.mockWeb3Provider();
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.setVegaWallet();

    cy.visit('/#/portfolio');
    cy.getByTestId(collateralTab).click();
    cy.getByTestId(openTransferButton).click();

    cy.wait('@Accounts');
    cy.wait('@Assets');
    cy.mockVegaWalletTransaction();
  });

  it('key to key transfers by select key', () => {
    // 1003-TRAN-001
    // 1003-TRAN-006
    // 1003-TRAN-007
    // 1003-TRAN-008
    // 1003-TRAN-009
    // 1003-TRAN-010
    // 1003-TRAN-023
    cy.getByTestId(transferForm).should('be.visible');
    cy.getByTestId(transferForm).find(toAddressField).select(1);

    cy.getByTestId(assetSelection).click();
    cy.getByTestId(assetOption);
    cy.getByTestId(assetBalance).should('not.be.empty');
    cy.getByTestId(assetOption).should('have.length.gt', 4);

    let optionText: string;
    cy.getByTestId(assetOption)
      .eq(2)
      .invoke('text')
      .then((text: string) => {
        optionText = text;
        cy.getByTestId(assetOption).eq(2).click();
        cy.getByTestId(assetSelection).should('have.text', optionText);
      });

    cy.getByTestId(transferForm)
      .find(amountField)
      .type('1', { delay: 100, force: true });

    cy.getByTestId(transferForm).find(amountShortName).should('not.be.empty');

    cy.getByTestId(transferForm).find(submitTransferBtn).click();
    cy.getByTestId(toastContent).should(
      'contain.text',
      'Awaiting confirmation'
    );
    cy.getByTestId(toastCloseBtn).click();
  });

  it('key to key transfers by enter manual key', () => {
    //1003-TRAN-005
    cy.getByTestId(transferForm).should('be.visible');
    cy.contains('Enter manually').click();
    cy.getByTestId(transferForm)
      .find(toAddressField)
      .type('7f9cf07d3a9905b1a61a1069f7a758855da428bc0f4a97de87f48644bfc25535');
    selectAsset(ASSET_SEPOLIA_TBTC);
    cy.getByTestId(transferForm)
      .find(amountField)
      .type('1', { delay: 100, force: true });
    cy.getByTestId(transferForm).find(submitTransferBtn).click();
    cy.getByTestId(toastContent).should(
      'contain.text',
      'Awaiting confirmation'
    );
    cy.getByTestId(toastCloseBtn).click();
  });
});
