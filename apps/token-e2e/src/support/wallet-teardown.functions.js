import {
  StakingBridge,
  Token,
  TokenVesting,
} from '@vegaprotocol/smart-contracts';
import { ethers, Wallet } from 'ethers';

const vegaWalletAssociatedBalance = '[data-testid="currency-value"]';
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
const transactionTimeout = '50000';

before('Vega wallet teardown prep', function () {
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
});

Cypress.Commands.add('vega_wallet_teardown', function () {
  cy.vega_wallet_teardown_staking(this.stakingBridgeContract);
  cy.vega_wallet_teardown_vesting(this.vestingContract);
  
  cy.get(vegaWalletAssociatedBalance, { timeout: transactionTimeout })
        .should('contain', '0.000000000000000000', { timeout: transactionTimeout });
});

Cypress.Commands.add(
  'vega_wallet_set_specified_approval_amount',
  function (resetAmount) {
    cy.highlight(`Setting token approval amount to ${resetAmount}`);
    cy.wrap(new Token(vegaTokenAddress, this.signer), { log: false }).then(
      (token) => {
        cy.wrap(
          token.approve(
            ethStakingBridgeContractAddress,
            resetAmount.concat('000000000000000000')
          ),
          { timeout: transactionTimeout, log: false }
        ).then((tx) => {
          cy.wait_for_transaction(tx);
        });
      }
    );
  }
);

Cypress.Commands.add(
  'vega_wallet_teardown_staking',
  (stakingBridgeContract) => {
    cy.highlight('Tearing down staking tokens from vega wallet if present');
    cy.wrap(
      stakingBridgeContract.stakeBalance(ethWalletPubKey, vegaWalletPubKey),
      {
        timeout: transactionTimeout,
        log: false,
      }
    ).then((stake_amount) => {
      if (String(stake_amount) != '0') {
        cy.wrap(
          stakingBridgeContract.removeStake(stake_amount, vegaWalletPubKey),
          { timeout: transactionTimeout, log: false }
        ).then((tx) => {
          cy.wait_for_transaction(tx);
        });
      }
    });
  }
);

Cypress.Commands.add('vega_wallet_teardown_vesting', (vestingContract) => {
  cy.highlight('Tearing down vesting tokens from vega wallet if present');
  cy.wrap(vestingContract.stakeBalance(ethWalletPubKey, vegaWalletPubKey), {
    timeout: transactionTimeout,
    log: false,
  }).then((vesting_amount) => {
    if (String(vesting_amount) != '0') {
      cy.wrap(vestingContract.removeStake(vesting_amount, vegaWalletPubKey), {
        timeout: transactionTimeout,
        log: false,
      }).then((tx) => {
        cy.wait_for_transaction(tx);
      });
    }
  });
});

Cypress.Commands.add('wait_for_transaction', (tx) => {
  cy.wrap(tx.wait(1).catch(cy.log), { timeout: transactionTimeout });
});
