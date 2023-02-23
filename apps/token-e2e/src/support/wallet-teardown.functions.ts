import { promiseWithTimeout } from '@vegaprotocol/cypress';
import {
  StakingBridge,
  Token,
  TokenVesting,
  TokenFaucetable,
  CollateralBridge,
} from '@vegaprotocol/smart-contracts';
import { ethers, Wallet } from 'ethers';

const vegaWalletContainer = '[data-testid="vega-wallet"]';
const vegaWalletMnemonic = Cypress.env('vegaWalletMnemonic');
const vegaWalletPubKey = Cypress.env('vegaWalletPublicKey');
const vegaTokenContractAddress = Cypress.env('vegaTokenContractAddress');
const vegaTokenAddress = Cypress.env('vegaTokenAddress');
const ethWalletPubKey = Cypress.env('ethWalletPublicKey');
const ethStakingBridgeContractAddress = Cypress.env(
  'ethStakingBridgeContractAddress'
);
const ethProviderUrl = Cypress.env('ethProviderUrl');
const getAccount = (number = 0) => `m/44'/60'/0'/0/${number}`;
const transactionTimeout = 100000;
const Erc20BridgeAddress = '0x9708FF7510D4A7B9541e1699d15b53Ecb1AFDc54';

const provider = new ethers.providers.JsonRpcProvider({ url: ethProviderUrl });
const privateKey = Wallet.fromMnemonic(
  vegaWalletMnemonic,
  getAccount(0)
).privateKey;
const signer = new Wallet(privateKey, provider);
const stakingBridgeContract = new StakingBridge(
  ethStakingBridgeContractAddress,
  signer
);
const vestingContract = new TokenVesting(vegaTokenContractAddress, signer);

export async function depositAsset(assetEthAddress: string) {
  // Approve asset

  const faucet = new TokenFaucetable(assetEthAddress, signer);
  await promiseWithTimeout(
    faucet.approve(Erc20BridgeAddress, '10000000000'),
    10 * 60 * 1000,
    'approve faucet tx'
  );
  const collateralBridge = new CollateralBridge(Erc20BridgeAddress, signer);
  await promiseWithTimeout(
    collateralBridge.deposit_asset(
      assetEthAddress,
      '1000000000',
      '0x' + vegaWalletPubKey
    ),
    10 * 60 * 1000,
    'deposit asset'
  );
}

export async function faucetAsset(assetEthAddress: string) {
  const faucet = new TokenFaucetable(assetEthAddress, signer);
  await promiseWithTimeout(faucet.faucet(), 10 * 60 * 1000, 'faucet asset');
}

export async function vegaWalletTeardown() {
  cy.get('[data-testid="associated-amount"]')
    .should('be.visible')
    .invoke('text')
    .then((associatedAmount) => {
      cy.get('body').then(($body) => {
        if (
          $body.find('[data-testid="eth-wallet-associated-balances"]').length ||
          associatedAmount != '0.00'
        ) {
          vegaWalletTeardownVesting(vestingContract);
          vegaWalletTeardownStaking(stakingBridgeContract);
        }
      });
    });
  cy.get(vegaWalletContainer).within(() => {
    cy.get('[data-testid="associated-amount"]', { timeout: transactionTimeout })
      .should('have.length', 1)
      .and('contain.text', '0.00');
  });
}

export async function vegaWalletSetSpecifiedApprovalAmount(
  resetAmount: string
) {
  cy.highlight(`Setting token approval amount to ${resetAmount}`);
  const token = new Token(vegaTokenAddress, signer);
  await promiseWithTimeout(
    token.approve(
      ethStakingBridgeContractAddress,
      resetAmount.concat('000000000000000000')
    ),
    10 * 60 * 1000,
    'set approval amount'
  );
}

async function vegaWalletTeardownStaking(stakingBridgeContract: StakingBridge) {
  cy.highlight('Tearing down staking tokens from vega wallet if present');
  const stakeBalance = await promiseWithTimeout(
    stakingBridgeContract.stake_balance(ethWalletPubKey, vegaWalletPubKey),
    10 * 60 * 1000,
    'get stake balance'
  );
  console.log(`Stake balance: ${stakeBalance}`);
  if (stakeBalance != 0) {
    await promiseWithTimeout(
      stakingBridgeContract.remove_stake(stakeBalance, vegaWalletPubKey),
      10 * 60 * 1000,
      'teardown staking'
    );
  }
}

async function vegaWalletTeardownVesting(vestingContract: TokenVesting) {
  cy.highlight('Tearing down vesting tokens from vega wallet if present');
  const vestingAmount = await promiseWithTimeout(
    vestingContract.stake_balance(ethWalletPubKey, vegaWalletPubKey),
    10 * 60 * 1000,
    'get vesting amount'
  );
  console.log(`Vesting amount: ${vestingAmount}`);
  if (vestingAmount != 0) {
    await promiseWithTimeout(
      vestingContract.remove_stake(vestingAmount, vegaWalletPubKey),
      10 * 60 * 1000,
      'teardown vesting'
    );
  }
}

export async function vegaWalletAssociate(amount: string) {
  amount = amount + '0'.repeat(18);
  cy.highlight('Associating tokens');
  stakingBridgeContract.stake(amount, vegaWalletPubKey);
}

export async function vegaWalletDisassociate(amount: string) {
  amount = amount + '0'.repeat(18);
  cy.highlight('Disassociating tokens');
  stakingBridgeContract.remove_stake(amount, vegaWalletPubKey);
}
