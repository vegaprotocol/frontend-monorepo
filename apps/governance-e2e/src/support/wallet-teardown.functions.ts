import { promiseWithTimeout } from '@vegaprotocol/cypress';
import {
  StakingBridge,
  Token,
  TokenVesting,
  TokenFaucetable,
  CollateralBridge,
} from '@vegaprotocol/smart-contracts';
import { ethers, Wallet } from 'ethers';

const vegaWalletContainer = 'aside [data-testid="vega-wallet"]';
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

export async function depositAsset(assetEthAddress: string, amount: string) {
  // Approve asset
  const faucet = new TokenFaucetable(assetEthAddress, signer);
  cy.wrap(faucet.approve(Erc20BridgeAddress, amount + '0'.repeat(19)), {
    timeout: transactionTimeout,
    log: false,
  })
    .then((tx) => {
      waitForTransaction(tx);
    })
    .then(() => {
      const collateralBridge = new CollateralBridge(Erc20BridgeAddress, signer);
      cy.wrap(
        collateralBridge.deposit_asset(
          assetEthAddress,
          amount + '0'.repeat(18),
          '0x' + vegaWalletPubKey
        ),
        { timeout: transactionTimeout, log: false }
      ).then((tx) => {
        waitForTransaction(tx);
      });
    });
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
      cy.get(vegaWalletContainer).within(() => {
        cy.getByTestId('vega-wallet-balance-staked-validators', {
          timeout: transactionTimeout,
        }).should('not.exist');
        cy.get('[data-testid="vega-wallet-balance-unstaked"]', {
          timeout: transactionTimeout,
        }).should('contain.text', '0.00');
      });
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
  cy.wrap(
    stakingBridgeContract.stake_balance(ethWalletPubKey, vegaWalletPubKey),
    { timeout: transactionTimeout, log: false }
  ).then((stakeBalance) => {
    if (Number(stakeBalance) != 0) {
      cy.wrap(
        stakingBridgeContract.remove_stake(
          String(stakeBalance),
          vegaWalletPubKey
        ),
        { timeout: transactionTimeout, log: false }
      ).then((tx) => {
        waitForTransaction(tx);
      });
    }
  });
}

async function vegaWalletTeardownVesting(vestingContract: TokenVesting) {
  cy.highlight('Tearing down vesting tokens from vega wallet if present');
  cy.wrap(vestingContract.stake_balance(ethWalletPubKey, vegaWalletPubKey), {
    timeout: transactionTimeout,
    log: false,
  }).then((vestingAmount) => {
    if (Number(vestingAmount) != 0) {
      cy.wrap(
        vestingContract.remove_stake(String(vestingAmount), vegaWalletPubKey),
        { timeout: transactionTimeout, log: false }
      ).then((tx) => {
        waitForTransaction(tx);
      });
    }
  });
}

export async function vegaWalletAssociate(amount: string) {
  cy.highlight('Associating tokens');
  amount = amount + '0'.repeat(18);
  stakingBridgeContract.stake(amount, vegaWalletPubKey);
}

export async function vegaWalletDisassociate(amount: string) {
  cy.highlight('Disassociating tokens');
  amount = amount + '0'.repeat(18);
  stakingBridgeContract.remove_stake(amount, vegaWalletPubKey);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function waitForTransaction(tx: any) {
  cy.wrap(tx.wait(1).catch(cy.log), { timeout: transactionTimeout });
}
