import { connectEthereumWallet } from '../support/ethereum-wallet';
import { selectAsset } from '../support/helpers';

const formFieldError = 'input-error-text';
const toAddressField = 'input[name="to"]';
const amountField = 'input[name="amount"]';
const useMaximumAmount = 'use-maximum';
const submitWithdrawBtn = 'submit-withdrawal';
const ethAddressValue = Cypress.env('ETHEREUM_WALLET_ADDRESS');

const ASSET_SEPOLIA_TBTC = 2;
const ASSET_EURO = 1;

describe('withdraw form validation', { tags: '@smoke' }, () => {
  before(() => {
    cy.mockWeb3Provider();
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.setVegaWallet();

    cy.visit('/#/portfolio');
    cy.getByTestId('Withdrawals').click();

    cy.getByTestId('withdraw-dialog-button').click();

    // It also requires connection Ethereum wallet
    connectEthereumWallet('MetaMask');

    cy.wait('@Accounts');
    cy.wait('@Assets');
  });

  it('empty fields', () => {
    cy.getByTestId(submitWithdrawBtn).click();

    cy.getByTestId(formFieldError).should('contain.text', 'Required');
    // only 2 despite 3 fields because the ethereum address will be auto populated
    cy.getByTestId(formFieldError).should('have.length', 2);

    // Test for Ethereum address
    cy.get(toAddressField).should('have.value', ethAddressValue);
  });
  it('min amount', () => {
    // 1002-WITH-010
    selectAsset(ASSET_SEPOLIA_TBTC);
    cy.get(amountField).clear().type('0');
    cy.getByTestId(submitWithdrawBtn).click();
    cy.get('[data-testid="input-error-text"]').should(
      'contain.text',
      'Value is below minimum'
    );
  });
  it('max amount', () => {
    // 1002-WITH-005
    // 1002-WITH-008
    selectAsset(ASSET_EURO); // Will be above maximum because the vega wallet doesn't have any collateral
    cy.get(amountField).clear().type('1001', { delay: 100 });
    cy.getByTestId(submitWithdrawBtn).click();
    cy.get('[data-testid="input-error-text"]').should(
      'contain.text',
      'Insufficient amount in account'
    );
  });

  it('can set amount using use maximum button', () => {
    // 1002-WITH-004
    selectAsset(ASSET_SEPOLIA_TBTC);
    cy.getByTestId(useMaximumAmount).click();
    cy.get(amountField).should('have.value', '1000.00001');
  });
});

describe(
  'withdraw actions',
  { tags: '@regression', testIsolation: true },
  () => {
    // this is extremely ugly hack, but setting it properly in contract is too much effort for such simple validation

    // 1002-WITH-018

    const withdrawalThreshold =
      Cypress.env('VEGA_ENV') === 'CUSTOM' ? '0.00' : '100.00';
    before(() => {
      cy.mockWeb3Provider();
      cy.mockTradingPage();
      cy.mockSubscription();
      cy.setVegaWallet();

      cy.visit('/#/portfolio');
      cy.getByTestId('Withdrawals').click();

      cy.getByTestId('withdraw-dialog-button').click();

      // It also requires connection Ethereum wallet
      connectEthereumWallet('MetaMask');

      cy.wait('@Accounts');
      cy.wait('@Assets');
      cy.mockVegaWalletTransaction();
    });

    it('triggers transaction when submitted', () => {
      // 1002-WITH-002
      // 1002-WITH-003
      selectAsset(ASSET_SEPOLIA_TBTC);
      cy.getByTestId('BALANCE_AVAILABLE_label').should(
        'contain.text',
        'Balance available'
      );
      cy.getByTestId('BALANCE_AVAILABLE_value').should(
        'have.text',
        '1,000.00001'
      );
      cy.getByTestId('WITHDRAWAL_THRESHOLD_label').should(
        'contain.text',
        'Delayed withdrawal threshold'
      );
      cy.getByTestId('WITHDRAWAL_THRESHOLD_value').should(
        'contain.text',
        withdrawalThreshold
      );
      cy.getByTestId('DELAY_TIME_label').should('contain.text', 'Delay time');
      cy.getByTestId('DELAY_TIME_value').should('have.text', 'None');
      cy.get(amountField).clear().type('10');
      cy.getByTestId(submitWithdrawBtn).click();
      cy.getByTestId('toast').should('contain.text', 'Awaiting confirmation');
    });
  }
);
