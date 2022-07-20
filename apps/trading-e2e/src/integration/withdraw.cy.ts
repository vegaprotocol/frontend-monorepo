import { aliasQuery } from '@vegaprotocol/cypress';
import { connectEthereumWallet } from '../support/ethereum-wallet';
import { generateNetworkParameters } from '../support/mocks/generate-network-parameters';
import { generateWithdrawPageQuery } from '../support/mocks/generate-withdraw-page-query';
import { connectVegaWallet } from '../support/vega-wallet';

describe('withdraw', () => {
  const formFieldError = 'input-error-text';
  const toAddressField = 'input[name="to"]';
  const assetSelectField = 'select[name="asset"]';
  const amountField = 'input[name="amount"]';
  const useMaximumAmount = 'use-maximum';
  const submitWithdrawBtn = 'submit-withdrawal';
  const ethAddressValue = `${Cypress.env(
    'ETHEREUM_WALLET_ADDRESS'
  )}/address/0x265Cc6d39a1B53d0d92068443009eE7410807158`;

  beforeEach(() => {
    cy.mockWeb3Provider();
    cy.mockGQL((req) => {
      aliasQuery(req, 'WithdrawPageQuery', generateWithdrawPageQuery());
      aliasQuery(req, 'NetworkParamsQuery', generateNetworkParameters());
    });
    cy.visit('/portfolio/withdraw');

    // Withdraw page requires vega wallet connection
    connectVegaWallet();

    // It also requires connection Ethereum wallet
    connectEthereumWallet();

    cy.wait('@WithdrawPageQuery');
    cy.contains('Withdraw');
  });

  it('form validation', () => {
    // Prompts that there are incomplete withdrawals
    cy.contains('You have incomplete withdrawals');
    cy.getByTestId('complete-withdrawals-prompt').should('exist');

    cy.getByTestId(submitWithdrawBtn).click();

    cy.getByTestId(formFieldError).should('contain.text', 'Required');
    // only 2 despite 3 fields because the ethereum address will be auto populated
    cy.getByTestId(formFieldError).should('have.length', 2);

    // Test for Ethereum address
    cy.get(toAddressField).should('have.value', ethAddressValue);

    // Test min amount
    cy.get(assetSelectField).select('Asset 1'); // Select asset so we have a min viable amount calculated
    cy.get(amountField)
      .clear()
      .type('0')
      .next('[data-testid="input-error-text"]')
      .should('contain.text', 'Value is below minimum');

    // Test max amount
    cy.get(amountField)
      .clear()
      .type('1') // Will be above maximum because the vega wallet doesnt have any collateral
      .next('[data-testid="input-error-text"]')
      .should('contain.text', 'Value is above maximum');
  });

  it('can set amount using use maximum button', () => {
    cy.get(assetSelectField).select('Asset 0');
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
    cy.get(assetSelectField).select('Asset 0');
    cy.get(amountField).clear().type('10');
    cy.getByTestId(submitWithdrawBtn).click();
    cy.getByTestId('dialog-title').should(
      'have.text',
      'Withdrawal transaction pending'
    );
    cy.getByTestId('dialog-text').should('have.text', 'Awaiting transaction');
  });

  it.skip('creates a withdrawal on submit'); // Needs capsule
  it.skip('creates a withdrawal on submit and prompts to complete withdrawal'); // Needs capsule
});
