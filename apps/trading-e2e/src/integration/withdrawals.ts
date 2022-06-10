import { hasOperationName } from '../support';
import { connectEthereumWallet } from '../support/ethereum-wallet';
import { generateWithdrawPageQuery } from '../support/mocks/generate-withdraw-page-query';
import { generateWithdrawals } from '../support/mocks/generate-withdrawals';
import { connectVegaWallet } from '../support/vega-wallet';

describe('withdraw', () => {
  const formFieldError = 'input-error-text';
  const toAddressField = 'input[name="to"]';
  const assetSelectField = 'select[name="asset"]';
  const amountField = 'input[name="amount"]';
  const useMaximumAmount = 'use-maximum';
  const submitWithdrawBtn = 'submit-withdrawal';

  beforeEach(() => {
    cy.mockWeb3Provider();
    cy.mockGQL('WithdrawPageQuery', (req) => {
      if (hasOperationName(req, 'WithdrawPageQuery')) {
        req.reply({
          body: { data: generateWithdrawPageQuery() },
        });
      }
    });
    cy.visit('/portfolio/withdraw');
    connectWallets();
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

    // Test for invalid Ethereum address
    cy.get(toAddressField)
      .clear()
      .type('invalid-ethereum-address')
      .next('[data-testid="input-error-text"]')
      .should('contain.text', 'Invalid Ethereum address');

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
    cy.getByTestId('dialog-title').should('have.text', 'Confirm withdrawal');
    cy.getByTestId('dialog-text').should(
      'have.text',
      'Confirm withdrawal in Vega wallet'
    );
  });

  it.skip('creates a withdrawal on submit'); // Needs capsule
  it.skip('creates a withdrawal on submit and prompts to complete withdrawal'); // Needs capsule
});

describe('withdrawals', () => {
  beforeEach(() => {
    cy.mockWeb3Provider();
    cy.mockGQL('Withdrawals', (req) => {
      if (hasOperationName(req, 'Withdrawals')) {
        req.reply({
          body: { data: generateWithdrawals() },
        });
      }
    });
    cy.visit('/portfolio/withdrawals');
    connectWallets();
    cy.contains('Withdrawals');
  });

  it('renders history of withdrawals', () => {
    const ethAddressLink = `${Cypress.env(
      'ETHERSCAN_URL'
    )}/address/0x72c22822A19D20DE7e426fB84aa047399Ddd8853`;
    const etherScanLink = `${Cypress.env(
      'ETHERSCAN_URL'
    )}/tx/0x5d7b1a35ba6bd23be17bb7a159c13cdbb3121fceb94e9c6c510f5503dce48d03`;
    cy.contains('Withdrawals');

    const row = '.ag-center-cols-container[role="rowgroup"] > [role="row"]';

    // First row is incomplete
    cy.get(row)
      .eq(0)
      .find('[col-id="asset.symbol"]')
      .should('contain.text', 'AST0');
    cy.get(row)
      .eq(0)
      .find('[col-id="amount"]')
      .should('contain.text', '100.00000');
    cy.get(row)
      .eq(0)
      .find('[col-id="details.receiverAddress"]')
      .should('contain.text', '0x72c2…dd8853')
      .find('a')
      .should('have.attr', 'href', ethAddressLink);
    cy.get(row)
      .eq(0)
      .find('[col-id="createdTimestamp"]')
      .invoke('text')
      .should('not.be.empty');
    cy.get(row)
      .eq(0)
      .find('[col-id="status"]')
      .should('contain.text', 'Open')
      .find('button')
      .contains('Complete');

    // Second row is complete so last cell should have a link to the tx
    cy.get(row)
      .eq(1)
      .find('[col-id="status"]')
      .should('contain.text', 'Finalized')
      .find('a')
      .contains('View on Etherscan')
      .should('have.attr', 'href', etherScanLink);
  });

  it('renders a link to start a new withdrawal', () => {
    cy.getByTestId('start-withdrawal').click();
    cy.url().should('include', '/portfolio/withdraw');
  });

  it.skip('renders pending and unfinished withdrawals');
  it.skip('can complete unfinished withdrawals'); // Needs capsule
});

const connectWallets = () => {
  // Withdraw page requires vega wallet connection
  connectVegaWallet();

  // It also requires connection Ethereum wallet
  connectEthereumWallet();
};
