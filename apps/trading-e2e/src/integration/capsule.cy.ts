import { connectEthereumWallet } from '../support/ethereum-wallet';
import { selectAsset } from '../support/helpers';

const amountField = 'input[name="amount"]';
const txTimeout = Cypress.env('txTimeout');
const sepoliaUrl = Cypress.env('ETHERSCAN_URL');
const btcName = 0;
const vegaName = 4;
const btcSymbol = 'tBTC';
const vegaSymbol = 'VEGA';
const toastContent = 'toast-content';
const depositsTab = 'Deposits';
const toastCloseBtn = 'toast-close';
const completeWithdrawalBtn = 'complete-withdrawal';
const depositSubmit = 'deposit-submit';
const approveSubmit = 'approve-submit';
const dialogContent = 'dialog-content';

// Because the tests are run on a live network to optimize time, the tests are interdependent and must be run in the given order.
describe('capsule - without MultiSign', { tags: '@slow' }, () => {
  before(() => {
    cy.createMarket();
    cy.get('@markets').then((markets) => {
      cy.wrap(markets[0]).as('market');
    });
    cy.setOnBoardingViewed();
    cy.visit('/#/portfolio');
  });

  it('can deposit', function () {
    cy.visit('/#/portfolio');
    cy.get('[data-testid="pathname-/portfolio"]').should('exist');

    // 1001-DEPO-001
    // 1001-DEPO-002
    // 1001-DEPO-003
    // 1001-DEPO-005
    // 1001-DEPO-006
    // 1001-DEPO-007
    // 1001-DEPO-008
    // 1001-DEPO-009
    // 1001-DEPO-010

    cy.getByTestId(depositsTab).click();
    cy.getByTestId('deposit-button').click();
    connectEthereumWallet('Unknown');
    selectAsset(btcName);
    cy.get('[data-testid="rich-select-option"]').eq(btcName).click();

    cy.getByTestId('approve-default').should(
      'contain.text',
      `Before you can make a deposit of your chosen asset, ${btcSymbol}, you need to approve its use in your Ethereum wallet`
    );
    cy.getByTestId(approveSubmit).click();
    cy.getByTestId('approve-pending').should('exist');
    cy.getByTestId('approve-confirmed').should('exist');
    cy.get(amountField).focus();
    cy.get(amountField).clear().type('10');
    cy.getByTestId(depositSubmit).click();
    cy.getByTestId(toastContent, txTimeout).should(
      'contain.text',
      `Transaction confirmedYour transaction has been confirmed.View on EtherscanDeposit 10.00 ${btcSymbol}`,
      { matchCase: false }
    );
    cy.getByTestId(toastCloseBtn).click();
    cy.getByTestId('Collateral').click();

    cy.highlight('deposit verification');

    cy.get('[col-id="asset.symbol"]', txTimeout).should(
      'contain.text',
      btcSymbol
    );
    cy.getByTestId(depositsTab).click();
    cy.get('.ag-cell-value', txTimeout).should('contain.text', btcSymbol);
    cy.get('[col-id="status"]').should('not.have.text', 'Open', txTimeout);

    cy.get('[col-id="txHash"]')
      .should('have.length.above', 2)
      .eq(1)
      .parent()
      .within(() => {
        cy.get('[col-id="asset.symbol"]').should('have.text', btcSymbol);
        cy.get('[col-id="amount"]').should('have.text', '10.00');
        cy.get('[col-id="createdTimestamp"]').should('not.be.empty');
        cy.get('[col-id="status"]').should('have.text', 'Finalized');
        cy.get('[col-id="txHash"]')
          .find('a')
          .should('have.attr', 'href')
          .and('contain', `${sepoliaUrl}/tx/0x`);
      });
  });

  it('can not withdrawal because of no MultiSign', function () {
    // 1002-WITH-022
    // 1002-WITH-023
    // 0003-WTXN-011
    cy.getByTestId('Withdrawals').click();
    cy.getByTestId('withdraw-dialog-button').click();
    selectAsset(btcName);
    cy.get('[data-testid="rich-select-option"]').eq(btcName).click();
    cy.get(amountField).focus();
    cy.get(amountField).clear().type('1');
    cy.getByTestId('submit-withdrawal').click();
    cy.getByTestId(toastContent, txTimeout).should(
      'contain.text',
      'Funds unlocked'
    );
    // cy.getByTestId(toastCloseBtn).click();
    cy.highlight('withdrawals verification');
    cy.getByTestId('toast-complete-withdrawal').last().click();

    cy.getByTestId(toastContent, txTimeout).should(
      'contain.text',
      'Error occurredcannot estimate gas'
    );
    cy.getByTestId(completeWithdrawalBtn).should(
      'contain.text',
      'Complete withdrawal'
    );
  });
});

describe('capsule', { tags: '@slow', testIsolation: true }, () => {
  before(() => {
    cy.updateCapsuleMultiSig();
  });

  beforeEach(() => {
    cy.createMarket();
    cy.get('@markets').then((markets) => {
      cy.wrap(markets[0]).as('market');
    });
    cy.setOnBoardingViewed();
    cy.setVegaWallet();
  });

  it('can withdrawal', function () {
    // 1002-WITH-0014
    // 1002-WITH-006
    // 1002-WITH-009
    // 1002-WITH-011
    // 1002-WITH-024
    // 1002-WITH-012
    // 1002-WITH-013
    // 1002-WITH-014
    // 1002-WITH-015
    // 1002-WITH-016
    // 1002-WITH-017
    // 1002-WITH-019
    // 1002-WITH-020
    // 1002-WITH-021
    const ethWalletAddress = Cypress.env('ETHEREUM_WALLET_ADDRESS');

    cy.visit('/#/portfolio');
    cy.get('[data-testid="pathname-/portfolio"]').should('exist');
    cy.getByTestId(toastCloseBtn, txTimeout).click();
    cy.getByTestId('Withdrawals').click();
    cy.getByTestId('withdraw-dialog-button').click();
    connectEthereumWallet('Unknown');
    selectAsset(btcName);
    cy.get('[data-testid="rich-select-option"]').eq(btcName).click();
    cy.get(amountField).clear().type('1');
    cy.getByTestId('submit-withdrawal').click();
    cy.getByTestId(toastContent, txTimeout).should(
      'contain.text',
      'Funds unlocked'
    );

    cy.highlight('withdrawals verification');
    cy.getByTestId('toast-complete-withdrawal').click();

    cy.getByTestId(toastContent, txTimeout).should(
      'contain.text',
      'Transaction confirmed'
    );
    cy.getByTestId(toastContent, txTimeout)
      .should('contain.text', 'Funds unlocked')
      .and('contain.text', 'Your funds have been unlocked for withdrawal.')
      .and(
        'contain.text',
        'View in block explorerYou can save your withdrawal details for extra security.'
      )
      .and('contain.text', 'Withdraw 1.00 tBTCComplete withdrawal');
    cy.getByTestId('toast-withdrawal-details').click();
    cy.getByTestId(dialogContent)
      .last()
      .within(() => {
        cy.getByTestId('dialog-title').should(
          'contain.text',
          'Save withdrawal details'
        );
        cy.getByTestId('copy-button').should('be.visible');
        cy.getByTestId('assetSource_value').should(
          'have.text',
          '0xb63D135B0a6854EEb765d69ca36210cC70BECAE0'
        );
        cy.getByTestId('amount_value').should('have.text', '100000');
        cy.getByTestId('nonce_value').invoke('text').should('not.be.empty');
        cy.getByTestId('signatures_value')
          .invoke('text')
          .should('not.be.empty');
        cy.getByTestId('targetAddress_value').should(
          'have.text',
          ethWalletAddress
        );
        cy.getByTestId('creation_value').invoke('text').should('not.be.empty');
      });
    cy.getByTestId('close-withdrawal-approval-dialog').click();

    cy.get('.ag-center-cols-container')
      .find('[col-id="status"]')
      .eq(0, txTimeout)
      .should('contain.text', 'Completed');

    cy.get('[col-id="txHash"]', txTimeout)
      .should('have.length.above', 1)
      .eq(1)
      .parent()
      .within(() => {
        cy.get('[col-id="asset.symbol"]').should('have.text', btcSymbol);
        cy.get('[col-id="amount"]').should('have.text', '1.00');
        cy.get('[col-id="details.receiverAddress"]')
          .find('a')
          .should('have.attr', 'href')
          .and('contain', `${sepoliaUrl}/address/`);
        cy.get('[col-id="createdTimestamp"]').should('not.be.empty');
        cy.get('[col-id="withdrawnTimestamp"]').should('not.be.empty');
        cy.get('[col-id="status"]').should('have.text', 'Completed');
        cy.get('[col-id="txHash"]')
          .find('a')
          .should('have.attr', 'href')
          .and('contain', `${sepoliaUrl}/tx/0x`);
      });

    cy.getByTestId('withdraw-dialog-button').click({ force: true });
    // cy.getByTestId('BALANCE_AVAILABLE_value').should('have.text', '6.999');
  });

  it('approved amount is less than deposit', function () {
    // 1001-DEPO-006
    // 1001-DEPO-007
    cy.visit('/#/portfolio');
    cy.get('[data-testid="pathname-/portfolio"]').should('exist');
    cy.getByTestId(toastCloseBtn, txTimeout).click();
    cy.getByTestId(depositsTab).click();
    cy.getByTestId('deposit-button').click();
    connectEthereumWallet('Unknown');
    selectAsset(btcName);
    cy.get('[data-testid="rich-select-option"]').eq(btcName).click();
    cy.contains('Deposits of tBTC not approved').should('not.exist');
    cy.contains('Use maximum').should('be.visible');
    cy.get(amountField).clear().type('20000000');
    cy.getByTestId(depositSubmit).should('be.visible');
    cy.getByTestId(depositSubmit).click();
    cy.getByTestId('input-error-text').should(
      'contain.text',
      `You can't deposit more than you have in your Ethereum wallet`
    );
  });

  it('withdraw - delay verification', function () {
    // 1001-DEPO-024
    // 1002-WITH-007

    cy.visit('/#/portfolio');
    cy.get('[data-testid="pathname-/portfolio"]', txTimeout).should('exist');
    cy.getByTestId(toastCloseBtn, txTimeout).click();
    cy.getByTestId(depositsTab).click();
    cy.getByTestId('deposit-button').click();
    connectEthereumWallet('Unknown');
    selectAsset(vegaName);
    cy.getByTestId('approve-submit').click();
    cy.getByTestId('approve-confirmed').should(
      'contain.text',
      'You approved deposits of up to VEGA'
    );
    cy.get(amountField).clear().type('10000');
    cy.getByTestId('deposit-submit').click();
    cy.getByTestId(toastContent, txTimeout).should(
      'contain.text',
      `Your transaction has been confirmed.`,
      { matchCase: false }
    );
    cy.getByTestId(toastCloseBtn).click({ multiple: true });
    cy.getByTestId('Collateral').click();

    cy.highlight('deposit verification');

    cy.get('[col-id="asset.symbol"]', txTimeout).should(
      'contain.text',
      vegaSymbol
    );
    cy.getByTestId(depositsTab).click();
    cy.get('.ag-cell-value', txTimeout).should('contain.text', vegaSymbol);
    cy.get('[col-id="status"]').should('not.have.text', 'Open', txTimeout);

    cy.get('[col-id="txHash"]')
      .should('have.length.above', 2)
      .eq(1)
      .parent()
      .within(() => {
        cy.get('[col-id="asset.symbol"]').should('have.text', vegaSymbol);
        cy.get('[col-id="amount"]').should('have.text', '10,000.00');
        cy.get('[col-id="createdTimestamp"]').should('not.be.empty');
        cy.get('[col-id="status"]').should('have.text', 'Finalized');
        cy.get('[col-id="txHash"]')
          .find('a')
          .should('have.attr', 'href')
          .and('contain', `${sepoliaUrl}/tx/0x`);
      });

    cy.getByTestId('Withdrawals').click(txTimeout);
    cy.getByTestId('withdraw-dialog-button').click();
    selectAsset(1);
    cy.get(amountField).clear().type('10000');
    cy.getByTestId('DELAY_TIME_value').should('have.text', '5 days');
    cy.getByTestId('submit-withdrawal').click();
    cy.getByTestId(toastContent, txTimeout).should(
      'contain.text',
      'Your funds have been unlocked'
    );
    cy.getByTestId(toastCloseBtn).click();
    cy.getByTestId(completeWithdrawalBtn).first().should('be.visible').click();
    cy.getByTestId(toastContent, txTimeout).should('contain.text', 'Delayed');
    cy.getByTestId('tab-withdrawals').within(() => {
      cy.get('.ag-center-cols-container')
        .children()
        .first()
        .within(() => {
          cy.get('[col-id="status"]').contains(
            /Delayed \(ready in (\d{1,2}:\d{2}:\d{2}:\d{2})\)/
          );
        });
    });
  });
});
