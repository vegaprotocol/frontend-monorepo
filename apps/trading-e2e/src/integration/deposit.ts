describe('deposit form validation', () => {
  before(() => {
    cy.mockWeb3Provider();
  });

  beforeEach(() => {
    cy.visit('/portfolio/deposit');

    // When the page loads you will eagerly connect to Ethereum by default
    // bypassing Ethereum wallet connection step

    cy.contains('Deposit');
  });

  it('handles empty fields', () => {
    const assetSelectField = 'select[name="asset"]';
    const toAddressField = 'input[name="to"]';
    const amountField = 'input[name="amount"]';
    const formFieldError = 'input-error-text';

    // Submit form to trigger any empty validaion messages
    cy.getByTestId('deposit-submit').click();

    cy.getByTestId(formFieldError).should('contain.text', 'Required');
    cy.getByTestId(formFieldError).should('have.length', 3);

    // Invalid public key
    cy.get(toAddressField)
      .clear()
      .type('INVALID_DEPOSIT_TO_ADDRESS')
      .next(`[data-testid="${formFieldError}"]`)
      .should('have.text', 'Invalid Vega key');

    // Deposit amount smaller than minimum viable for selected asset
    // Select an amount so that we have a known decimal places value to work with
    cy.get(assetSelectField).select('tBTC TEST');
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
      .should('have.text', 'Amount is above approved amount');
  });
});
