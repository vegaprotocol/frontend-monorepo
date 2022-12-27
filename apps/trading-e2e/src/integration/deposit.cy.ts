import { connectEthereumWallet } from '../support/ethereum-wallet';

const assetSelectField = 'select[name="asset"]';
const toAddressField = 'input[name="to"]';
const amountField = 'input[name="amount"]';
const formFieldError = 'input-error-text';

describe('deposit form validation', { tags: '@smoke' }, () => {
  beforeEach(() => {
    cy.mockWeb3Provider();
    cy.mockSubscription();
    cy.mockTradingPage();
    cy.visit('/#/portfolio');
    cy.get('main[data-testid="/portfolio"]').should('exist');
    cy.getByTestId('Deposits').click();
    cy.getByTestId('tab-deposits').contains('Connect your Vega wallet');
    cy.connectVegaWallet();
    cy.getByTestId('deposit-button').click();
    cy.wait('@Assets');
  });

  it('unable to select assets not enabled', () => {
    connectEthereumWallet();
    cy.getByTestId('deposit-submit').click();
    // Assets not enabled in mocks
    cy.get(assetSelectField + ' option:contains(Asset 2)').should('not.exist');
    cy.get(assetSelectField + ' option:contains(Asset 3)').should('not.exist');
    cy.get(assetSelectField + ' option:contains(Asset 4)').should('not.exist');
  });

  it('handles empty fields', () => {
    connectEthereumWallet();
    // Submit form to trigger any empty validation messages
    cy.getByTestId('deposit-submit').click();

    cy.getByTestId(formFieldError).should('contain.text', 'Required');
    cy.getByTestId(formFieldError).should('have.length', 2);

    // Invalid public key
    cy.get(toAddressField)
      .clear()
      .type('INVALID_DEPOSIT_TO_ADDRESS')
      .next(`[data-testid="${formFieldError}"]`)
      .should('have.text', 'Invalid Vega key');

    // Deposit amount smaller than minimum viable for selected asset
    // Select an amount so that we have a known decimal places value to work with
    cy.get(assetSelectField).select('Euro');
    cy.get(amountField)
      .clear()
      .type('0.00000000000000000000000000000000001')
      .next(`[data-testid="${formFieldError}"]`)
      .should('have.text', 'Value is below minimum');

    // Deposit amount is valid, but less than approved. This will always be the case because our
    // CI wallet wont have approved any assets
    cy.get(amountField)
      .clear()
      .type('100')
      .next(`[data-testid="${formFieldError}"]`)
      .should('have.text', 'Insufficient amount in Ethereum wallet');
  });
});
