import { promiseWithTimeout } from '@vegaprotocol/cypress';
import {
  StakingBridge,
  Token,
  TokenVesting,
  CollateralBridge,
} from '@vegaprotocol/smart-contracts';
import { ethers, Wallet } from 'ethers';

const associatedAmountInWallet = '[data-testid="associated-amount"]:visible';
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
const vestingContract = new TokenVesting(vegaTokenContractAddress, signer);

export async function depositAsset(
  assetEthAddress: string,
  amount: string,
  decimalPlaces: number
) {
  // Approve asset
  const faucet = new Token(assetEthAddress, signer);
  cy.wrap(
    faucet.approve(Erc20BridgeAddress, amount + '0'.repeat(decimalPlaces + 1)),
    transactionTimeout
  ).then(() => {
    const collateralBridge = new CollateralBridge(Erc20BridgeAddress, signer);
    cy.wrap(
      collateralBridge.deposit_asset(
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
          vegaWalletTeardownVesting(vestingContract);
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
    stakingBridgeContract.stake_balance(ethWalletPubKey, vegaWalletPubKey),
    transactionTimeout
  ).then((stakeBalance) => {
    if (Number(stakeBalance) != 0) {
      cy.get(vegaWalletContainer).within(() => {
        cy.getByTestId('currency-value')
          .first()
          .invoke('text')
          .then(($associatedAmount) => {
            cy.wrap(
              stakingBridgeContract.remove_stake(
                String(stakeBalance),
                vegaWalletPubKey
              ),
              transactionTimeout
            );
            cy.wrap(
              vestingContract.stake_balance(ethWalletPubKey, vegaWalletPubKey),
              transactionTimeout
            ).then((vestingAmount) => {
              if (Number(vestingAmount) != 0) {
                cy.contains('Associated', transactionTimeout)
                  .parent()
                  .parent()
                  .within(() => {
                    cy.getByTestId('currency-value', transactionTimeout)
                      .first()
                      .invoke('text')
                      .as('displayedAmount');
                    cy.get('@displayedAmount', transactionTimeout).should(
                      'not.eq',
                      $associatedAmount
                    );
                  });
                // Wait needed to allow Eth transaction to complete - otherwise could result in nonce error
                // eslint-disable-next-line cypress/no-unnecessary-waiting
                cy.wait(2000);
              }
            });
          });
      });
    }
  });
}

async function vegaWalletTeardownVesting(vestingContract: TokenVesting) {
  cy.highlight('Tearing down vesting tokens from vega wallet if present');
  cy.wrap(
    vestingContract.stake_balance(ethWalletPubKey, vegaWalletPubKey),
    transactionTimeout
  ).then((vestingAmount) => {
    if (Number(vestingAmount) != 0) {
      cy.wrap(
        vestingContract.remove_stake(String(vestingAmount), vegaWalletPubKey),
        transactionTimeout
      );
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
