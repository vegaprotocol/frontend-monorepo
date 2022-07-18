import { aliasQuery } from '@vegaprotocol/cypress';
import { connectEthereumWallet } from '../support/ethereum-wallet';
import { generateNetworkParameters } from '../support/mocks/generate-network-parameters';
import { generateWithdrawals } from '../support/mocks/generate-withdrawals';
import { connectVegaWallet } from '../support/vega-wallet';

describe('withdrawals', () => {
  beforeEach(() => {
    cy.mockWeb3Provider();
    cy.mockGQL((req) => {
      aliasQuery(req, 'Withdrawals', generateWithdrawals());
      aliasQuery(req, 'NetworkParamsQuery', generateNetworkParameters());
    });
    cy.visit('/portfolio/withdrawals');

    // Withdraw page requires vega wallet connection
    connectVegaWallet();

    // It also requires connection Ethereum wallet
    connectEthereumWallet();
  });

  it('renders history of withdrawals', () => {
    const ethAddressLink = `${Cypress.env(
      'ETHERSCAN_URL'
    )}/address/0x72c22822A19D20DE7e426fB84aa047399Ddd8853`;
    const etherScanLink = `${Cypress.env(
      'ETHERSCAN_URL'
    )}/tx/0x5d7b1a35ba6bd23be17bb7a159c13cdbb3121fceb94e9c6c510f5503dce48d03`;

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
