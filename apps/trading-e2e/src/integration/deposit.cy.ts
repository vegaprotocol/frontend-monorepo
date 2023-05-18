import { removeDecimal } from '@vegaprotocol/cypress';
import { ethers } from 'ethers';
import { connectEthereumWallet } from '../support/ethereum-wallet';
import { selectAsset } from '../support/helpers';

const assetSelectField = 'select[name="asset"]';
const toAddressField = 'input[name="to"]';
const amountField = 'input[name="amount"]';
const formFieldError = 'input-error-text';

const ASSET_EURO = 1;

describe('deposit form validation', { tags: '@smoke' }, () => {
  function openDepositForm() {
    cy.mockWeb3Provider();
    cy.mockSubscription();
    cy.mockTradingPage();
    cy.setVegaWallet();
    cy.visit('/#/portfolio');
    cy.get('main[data-testid="/portfolio"]').should('exist');
    cy.getByTestId('Deposits').click();
    cy.getByTestId('deposit-button').click();
    cy.wait('@Assets');
    connectEthereumWallet('MetaMask');
  }

  before(() => {
    openDepositForm();
  });

  it('handles empty fields', () => {
    cy.getByTestId('deposit-submit').click();
    cy.getByTestId(formFieldError).should('contain.text', 'Required');
    // once Ethereum wallet is connected and key selected the only field that will
    // error is the asset select
    cy.getByTestId(formFieldError).should('have.length', 1);
    cy.get('[data-testid="input-error-text"][aria-describedby="asset"]').should(
      'have.length',
      1
    );
  });

  it('unable to select assets not enabled', () => {
    // Assets not enabled in mocks
    cy.get(assetSelectField + ' option:contains(Asset 2)').should('not.exist');
    cy.get(assetSelectField + ' option:contains(Asset 3)').should('not.exist');
    cy.get(assetSelectField + ' option:contains(Asset 4)').should('not.exist');
  });

  it('invalid public key when entering address manually', () => {
    cy.getByTestId('enter-pubkey-manually').click();
    cy.get(toAddressField).clear().type('INVALID_DEPOSIT_TO_ADDRESS');
    cy.get(`[data-testid="${formFieldError}"][aria-describedby="to"]`).should(
      'have.text',
      'Invalid Vega key'
    );
  });

  it('invalid amount', () => {
    mockWeb3DepositCalls({
      allowance: '1000',
      depositLifetimeLimit: '1000',
      balance: '800',
      deposited: '0',
      dps: 5,
    });
    // Deposit amount smaller than minimum viable for selected asset
    // Select an amount so that we have a known decimal places value to work with
    selectAsset(ASSET_EURO);

    cy.get(amountField)
      .clear()
      .type('0.00000000000000000000000000000000001')
      .next(`[data-testid="${formFieldError}"]`)
      .should('have.text', 'Value is below minimum');
  });

  it('insufficient funds', () => {
    // 1001-DEPO-004
    mockWeb3DepositCalls({
      allowance: '1000',
      depositLifetimeLimit: '1000',
      balance: '800',
      deposited: '0',
      dps: 5,
    });
    cy.get(amountField)
      .clear()
      .type('850')
      .next(`[data-testid="${formFieldError}"]`)
      .should(
        'have.text',
        "You can't deposit more than you have in your Ethereum wallet, 800 tEURO"
      );
  });
});

describe('deposit actions', { tags: '@smoke' }, () => {
  before(() => {
    cy.mockWeb3Provider();
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.setVegaWallet();
    cy.visit('/#/markets/market-1');
    cy.wait('@MarketsCandles');
    cy.getByTestId('dialog-close').click();
  });

  it('Deposit to trade is visble', () => {
    cy.getByTestId('Collateral').click();
    cy.contains('[data-testid="deposit"]', 'Deposit')
      .should('be.visible')
      .click();
    cy.getByTestId('deposit-submit').should('be.visible');
  });
});

function mockWeb3DepositCalls({
  allowance,
  depositLifetimeLimit,
  balance,
  deposited,
  dps,
}: {
  allowance: string;
  depositLifetimeLimit: string;
  balance: string;
  deposited: string;
  dps: number;
}) {
  const assetContractAddress = '0x0158031158bb4df2ad02eaa31e8963e84ea978a4';
  const collateralBridgeAddress = '0x7fe27d970bc8afc3b11cc8d9737bfb66b1efd799';
  const toResult = (value: string, dps: number) => {
    const rawValue = removeDecimal(value, dps);
    return ethers.utils.hexZeroPad(
      ethers.utils.hexlify(parseInt(rawValue)),
      32
    );
  };
  cy.intercept('POST', 'http://localhost:8545', (req) => {
    // Mock chainId call
    if (req.body.method === 'eth_chainId') {
      req.alias = 'eth_chainId';
      req.reply({
        id: req.body.id,
        jsonrpc: req.body.jsonrpc,
        result: '0xaa36a7', // 11155111 for sepolia chain id
      });
    }

    // Mock deposited amount
    if (req.body.method === 'eth_getStorageAt') {
      req.alias = 'eth_getStorageAt';
      req.reply({
        id: req.body.id,
        jsonrpc: req.body.jsonrpc,
        result: toResult(deposited, dps),
      });
    }

    if (req.body.method === 'eth_call') {
      // Mock approved amount for asset on collateral bridge
      if (
        req.body.params[0].to === assetContractAddress &&
        req.body.params[0].data ===
          '0xdd62ed3e000000000000000000000000ee7d375bcb50c26d52e1a4a472d8822a2a22d94f0000000000000000000000007fe27d970bc8afc3b11cc8d9737bfb66b1efd799'
      ) {
        req.alias = 'eth_call_allowance';
        req.reply({
          id: req.body.id,
          jsonrpc: req.body.jsonrpc,
          result: toResult(allowance, dps),
        });
      }
      // Mock balance of asset in Ethereum wallet
      else if (
        req.body.params[0].to === assetContractAddress &&
        req.body.params[0].data ===
          '0x70a08231000000000000000000000000ee7d375bcb50c26d52e1a4a472d8822a2a22d94f'
      ) {
        req.alias = 'eth_call_balanceOf';
        req.reply({
          id: req.body.id,
          jsonrpc: req.body.jsonrpc,
          result: toResult(balance, dps),
        });
      }
      // Mock deposit lifetime limit
      else if (
        req.body.params[0].to === collateralBridgeAddress &&
        req.body.params[0].data ===
          '0x354a897a0000000000000000000000000158031158bb4df2ad02eaa31e8963e84ea978a4'
      ) {
        req.alias = 'eth_call_get_deposit_maximum'; // deposit lifetime limit
        req.reply({
          id: req.body.id,
          jsonrpc: req.body.jsonrpc,
          result: toResult(depositLifetimeLimit, dps),
        });
      }
    }
  });
}
