const ethWalletContainer = '[data-testid="ethereum-wallet"]';
const connectToEthButton = '[data-testid="connect-to-eth-wallet-button"]';
const capsuleWalletConnectButton = '[data-testid="web3-connector-Unknown"]';

Cypress.Commands.add('ethereum_wallet_connect', () => {
  cy.highlight('Connecting Eth Wallet');
  cy.get(connectToEthButton).within(() => {
    cy.contains('Connect Ethereum wallet to associate $VEGA')
      .should('be.visible')
      .click();
  });
  cy.get(capsuleWalletConnectButton).click();
  cy.get(capsuleWalletConnectButton, { timeout: 60000 }).should('not.exist');
  cy.get(ethWalletContainer).within(() => {
    // this check is required since it ensures the wallet is fully (not partially) loaded
    cy.contains('Locked', { timeout: 15000 }).should('be.visible');
  });
  // Even once eth wallet connected - attempting a transaction will fail
  // It needs a few seconds before becoming operational
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(4000);
});

import { StakingBridge, TokenVesting } from '@vegaprotocol/smart-contracts';
import { ethers, Wallet } from 'ethers';
import BigNumber from 'bignumber.js';

BigNumber.config({ EXPONENTIAL_AT: 20000 });

const vegaWalletMnemonic = Cypress.env('vegaWalletMnemonic');
const vegaWalletPubKey = Cypress.env('vegaWalletPublicKey');
const vegaTokenContractAddress = Cypress.env('vegaTokenContractAddress');
const ethStakingBridgeContractAddress = Cypress.env(
  'ethStakingBridgeContractAddress'
);
const ethProviderUrl = Cypress.env('ethProviderUrl');
const getAccount = (number = 0) => `m/44'/60'/0'/0/${number}`;
const transactionTimeout = '90000';

function ethPreparation() {
  cy.wrap(new ethers.providers.JsonRpcProvider({ url: ethProviderUrl }), {
    log: false,
  }).as('provider');

  cy.wrap(Wallet.fromMnemonic(vegaWalletMnemonic, getAccount(0)).privateKey, {
    log: false,
  }).then((privateKey) => {
    cy.wrap(new Wallet(privateKey, this.provider), { log: false }).as('signer');
  });

  cy.get('@signer', { log: false }).then((signer) => {
    cy.wrap(new StakingBridge(ethStakingBridgeContractAddress, signer), {
      log: false,
    }).as('stakingBridgeContract');
    cy.wrap(new TokenVesting(vegaTokenContractAddress, signer), {
      log: false,
    }).as('vestingContract');
  });
}

Cypress.Commands.add(
  'eth_associate_tokens',
  function (amount, type = 'wallet') {
    if (!this.vestingContract || !this.stakingBridgeContract) {
      ethPreparation();
    }
    cy.highlight(`Staking ${amount} tokens from ${type}`);
    if (type === 'wallet') {
      cy.wrap(
        this.stakingBridgeContract.stake(
          new BigNumber(amount).multipliedBy(1e18).toString(),
          vegaWalletPubKey
        ),
        {
          timeout: transactionTimeout,
          log: false,
        }
      ).then((tx) => {
        cy.wait_for_transaction(tx);
      });
    } else if (type === 'contract') {
      cy.wrap(
        this.vestingContract.stake_tokens(
          new BigNumber(amount).multipliedBy(1e18).toString(),
          vegaWalletPubKey
        ),
        {
          timeout: transactionTimeout,
          log: false,
        }
      ).then((tx) => {
        cy.wait_for_transaction(tx);
      });
    } else throw Error(`Invalid type ${type}`);
  }
);
