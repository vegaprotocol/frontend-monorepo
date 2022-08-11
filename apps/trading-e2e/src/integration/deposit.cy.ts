import { aliasQuery } from '@vegaprotocol/cypress';
import { generateDepositPage } from '../support/mocks/generate-deposit-page';
import { generateNetworkParameters } from '../support/mocks/generate-network-parameters';

const connectEthWalletBtn = 'connect-eth-wallet-btn';

describe('deposit form validation', () => {
  beforeEach(() => {
    cy.mockWeb3Provider();
    cy.mockGQL((req) => {
      aliasQuery(req, 'NetworkParamsQuery', generateNetworkParameters());
      aliasQuery(req, 'DepositPage', generateDepositPage());
    });
    cy.visit('/portfolio/deposit');

    // Deposit page requires connection Ethereum wallet first
    cy.getByTestId(connectEthWalletBtn).click();
    cy.getByTestId('web3-connector-MetaMask').click();

    cy.wait('@DepositPage');
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
    cy.get(assetSelectField).select('Asset 0');
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

  it('able to disconnect eth wallet', () => {
    const ethWalletAddress = Cypress.env('ETHEREUM_WALLET_ADDRESS');

    cy.get('#ethereum-address').should('have.value', ethWalletAddress).click();
    cy.getByTestId('dialog-content').within(() => {
      cy.get('p').should('have.text', `Connected with ${ethWalletAddress}`);
      cy.get('button')
        .should('have.text', 'Disconnect Ethereum Wallet')
        .click();
    });

    cy.getByTestId('connect-eth-wallet-msg').should('exist');
    cy.getByTestId(connectEthWalletBtn).should('exist');
  });
});
