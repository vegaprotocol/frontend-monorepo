import { promiseWithTimeout } from '@vegaprotocol/cypress';
import {
  StakingBridge,
  Token,
  CollateralBridge,
} from '@vegaprotocol/smart-contracts';
import { ethers, Wallet } from 'ethers';

const associatedAmountInWallet = '[data-testid="associated-amount"]:visible';
const vegaWalletContainer = 'aside [data-testid="vega-wallet"]';
const vegaWalletMnemonic = Cypress.env('vegaWalletMnemonic');
const vegaWalletPubKey = Cypress.env('vegaWalletPublicKey');
const vegaTokenAddress = Cypress.env('vegaTokenAddress');
const ethWalletPubKey = Cypress.env('ethWalletPublicKey');
const ethStakingBridgeContractAddress = Cypress.env(
  'ethStakingBridgeContractAddress'
);
const ethProviderUrl = Cypress.env('ethProviderUrl');
const getAccount = (number = 0) => `m/44'/60'/0'/0/${number}`;
const transactionTimeout = { timeout: 100000, log: false };
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

export async function depositAsset(
  assetEthAddress: string,
  amount: string,
  decimalPlaces: number
) {
  // Approve asset
  const faucet = new Token(assetEthAddress, signer);
  // Wait needed to allow Eth chain to catch up
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(4000);
  cy.wrap(
    faucet.approve(Erc20BridgeAddress, amount + '0'.repeat(decimalPlaces + 1)),
    transactionTimeout
  ).then(() => {
    const collateralBridge = new CollateralBridge(Erc20BridgeAddress, signer);
    cy.wrap(
      collateralBridge.depositAsset(
        assetEthAddress,
        amount + '0'.repeat(decimalPlaces),
        '0x' + vegaWalletPubKey
      ),
      transactionTimeout
    );
  });
}

export async function faucetAsset(assetEthAddress: string) {
  const faucet = new Token(assetEthAddress, signer);
  await promiseWithTimeout(faucet.faucet(), 10 * 60 * 1000, 'faucet asset');
}

export async function vegaWalletTeardown() {
  cy.get(associatedAmountInWallet)
    .invoke('text')
    .then((associatedAmount) => {
      cy.get('body').then(($body) => {
        if (
          $body.find('[data-testid="eth-wallet-associated-balances"]').length ||
          associatedAmount != '0.00'
        ) {
          vegaWalletTeardownStaking(stakingBridgeContract);
        }
      });
      cy.get(vegaWalletContainer).within(() => {
        cy.get(associatedAmountInWallet, transactionTimeout).should(
          'have.length',
          1
        );
        cy.get(associatedAmountInWallet)
          .first(transactionTimeout)
          .should('have.text', '0.00');
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
      resetAmount + '0'.repeat(18)
    ),
    10 * 60 * 1000,
    'set approval amount'
  );
}

async function vegaWalletTeardownStaking(stakingBridgeContract: StakingBridge) {
  cy.highlight('Tearing down staking tokens from vega wallet if present');
  cy.wrap(
    stakingBridgeContract.stakeBalance(ethWalletPubKey, vegaWalletPubKey),
    transactionTimeout
  ).then((stakeBalance) => {
    if (Number(stakeBalance) != 0) {
      cy.get(vegaWalletContainer).within(() => {
        cy.getByTestId('currency-value')
          .first()
          .invoke('text')
          .then(() => {
            cy.wrap(
              stakingBridgeContract.removeStake(
                String(stakeBalance),
                vegaWalletPubKey
              ),
              transactionTimeout
            );
          });
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
  stakingBridgeContract.removeStake(amount, vegaWalletPubKey);
}

export function vegaWalletFaucetAssetsWithoutCheck(
  asset: string,
  amount: string,
  vegaWalletPublicKey: string
) {
  cy.highlight(`Topping up vega wallet with ${asset}, amount: ${amount}`);
  cy.exec(
    `curl -X POST -d '{"amount": "${amount}", "asset": "${asset}", "party": "${vegaWalletPublicKey}"}' http://localhost:1790/api/v1/mint`
  )
    .its('stdout')
    .then((response) => {
      assert.include(
        response,
        `"success":true`,
        'Ensuring curl command was successfully undertaken'
      );
    });
}

export function switchVegaWalletPubKey() {
  cy.get('[data-testid="manage-vega-wallet"]:visible').click();
  cy.get('[data-testid="select-keypair-button"]').eq(0).click();
}
