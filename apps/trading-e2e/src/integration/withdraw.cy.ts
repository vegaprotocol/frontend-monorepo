import { connectEthereumWallet } from '../support/ethereum-wallet';
import { connectVegaWallet } from '../support/vega-wallet';

describe('withdraw', { tags: '@smoke' }, () => {
  const formFieldError = 'input-error-text';
  const toAddressField = 'input[name="to"]';
  const assetSelectField = 'select[name="asset"]';
  const amountField = 'input[name="amount"]';
  const useMaximumAmount = 'use-maximum';
  const submitWithdrawBtn = 'submit-withdrawal';
  const ethAddressValue = Cypress.env('ETHEREUM_WALLET_ADDRESS');
  const asset1Name = 'Sepolia tBTC';
  const asset2Name = 'Sepolia tUSDC';

  beforeEach(() => {
    cy.mockWeb3Provider();
    cy.mockTradingPage();
    cy.mockGQLSubscription();

    cy.visit('/#/portfolio');
    cy.getByTestId('Withdrawals').click();

    // Withdraw page requires vega wallet connection
    connectVegaWallet();

    // It also requires connection Ethereum wallet
    connectEthereumWallet();

    cy.getByTestId('withdraw-dialog-button').click();
    cy.wait('@Accounts');
    cy.wait('@Assets');
  });

  it('form validation', () => {
    cy.getByTestId(submitWithdrawBtn).click();

    cy.getByTestId(formFieldError).should('contain.text', 'Required');
    // only 2 despite 3 fields because the ethereum address will be auto populated
    cy.getByTestId(formFieldError).should('have.length', 2);

    // Test for Ethereum address
    cy.get(toAddressField).should('have.value', ethAddressValue);
  });
  it('min amount', () => {
    selectAsset(asset1Name);
    cy.get(amountField).clear().type('0');
    cy.getByTestId(submitWithdrawBtn).click();
    cy.get('[data-testid="input-error-text"]').should(
      'contain.text',
      'Value is below minimum'
    );
  });
  it('max amount', () => {
    selectAsset(asset2Name); // Will be above maximum because the vega wallet doesnt have any collateral
    cy.get(amountField).clear().type('1');
    cy.getByTestId(submitWithdrawBtn).click();
    cy.get('[data-testid="input-error-text"]').should(
      'contain.text',
      'Insufficient amount in account'
    );
  });

  it('can set amount using use maximum button', () => {
    selectAsset(asset1Name);
    cy.getByTestId(useMaximumAmount).click();
    cy.get(amountField).should('have.value', '1000.00000');
  });

  it('triggers transaction when submitted', () => {
    cy.mockVegaCommandSync({
      txHash: 'test-tx-hash',
      tx: {
        signature: {
          value:
            'd86138bba739bbc1069b3dc975d20b3a1517c2b9bdd401c70eeb1a0ecbc502ec268cf3129824841178b8b506b0b7d650c76644dbd96f524a6cb2158fb7121800',
        },
      },
    });
    selectAsset(asset1Name);
    cy.getByTestId('BALANCE_AVAILABLE_label').should(
      'contain.text',
      'Balance available'
    );
    cy.getByTestId('BALANCE_AVAILABLE_value').should(
      'have.text',
      '1,000.00000'
    );
    cy.getByTestId('WITHDRAWAL_THRESHOLD_label').should(
      'contain.text',
      'Delayed withdrawal threshold'
    );
    cy.getByTestId('WITHDRAWAL_THRESHOLD_value').should(
      'contain.text',
      '100.00000'
    );
    cy.getByTestId('DELAY_TIME_label').should('contain.text', 'Delay time');
    cy.getByTestId('DELAY_TIME_value').should('have.text', 'None');
    cy.get(amountField).clear().type('10');
    cy.getByTestId(submitWithdrawBtn).click();
    cy.getByTestId('dialog-title').should(
      'have.text',
      'Awaiting network confirmation'
    );
  });

  it.skip('creates a withdrawal on submit'); // Needs capsule
  it.skip('creates a withdrawal on submit and prompts to complete withdrawal'); // Needs capsule

  const selectAsset = (assetName: string) => {
    cy.get(assetSelectField).select(assetName);
    // The asset only gets set once the queries (getWithdrawThreshold, getDelay)
    // against the Ethereum change resolve, we should fix this but for now just force
    // some wait time
    // eslint-disable-next-line
    cy.wait(1000);
  };
});
