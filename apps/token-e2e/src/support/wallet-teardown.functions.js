import {
  StakingBridge,
  Token,
  TokenVesting,
  TokenFaucetable,
  CollateralBridge,
} from '@vegaprotocol/smart-contracts';
import { ethers, Wallet } from 'ethers';

const vegaWalletContainer = '[data-testid="vega-wallet"]';
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
const transactionTimeout = '90000';
const Erc20BridgeAddress = '0x9708FF7510D4A7B9541e1699d15b53Ecb1AFDc54';

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

Cypress.Commands.add('deposit_asset', function (assetEthAddress) {
  cy.get('@signer', { log: false }).then((signer) => {
    // Approve asset
    cy.wrap(
      new TokenFaucetable(assetEthAddress, signer).approve(
        Erc20BridgeAddress,
        '10000000000'
      )
    )
      .then((tx) => {
        cy.wait_for_transaction(tx);
      })
      .then(() => {
        cy.wrap(new CollateralBridge(Erc20BridgeAddress, signer), {
          log: false,
        }).then((bridge) => {
          // Deposit asset into vega wallet
          cy.wrap(
            bridge.deposit_asset(
              assetEthAddress,
              '1000000000',
              '0x' + vegaWalletPubKey
            ),
            { timeout: transactionTimeout, log: false }
          ).then((tx) => {
            cy.wait_for_transaction(tx);
          });
        });
      });
  });
});

Cypress.Commands.add('faucet_asset', function (assetEthAddress) {
  cy.get('@signer', { log: false }).then((signer) => {
    cy.wrap(new TokenFaucetable(assetEthAddress, signer), { log: false }).then(
      (token) => {
        cy.wrap(token.faucet(), {
          timeout: transactionTimeout,
          log: false,
        }).then((tx) => {
          cy.wait_for_transaction(tx);
        });
      }
    );
  });
});

Cypress.Commands.add('vega_wallet_teardown', function () {
  cy.get(vegaWalletContainer).within(() => {
    cy.get(vegaWalletAssociatedBalance)
      .first()
      .invoke('text')
      .then((balance) => {
        if (balance != '0.00') {
          cy.vega_wallet_teardown_vesting(this.vestingContract);
          cy.vega_wallet_teardown_staking(this.stakingBridgeContract);
        }
      });
    cy.get('[data-testid="associated-amount"]', { timeout: 30000 }).should(
      'contain.text',
      '0.00'
    );
  });

  cy.get(vegaWalletContainer).within(() => {
    cy.get(vegaWalletAssociatedBalance, { timeout: transactionTimeout }).should(
      'contain',
      '0.00',
      { timeout: transactionTimeout }
    );
  });
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
      stakingBridgeContract.stake_balance(ethWalletPubKey, vegaWalletPubKey),
      {
        timeout: transactionTimeout,
        log: false,
      }
    ).then((stake_amount) => {
      if (String(stake_amount) != '0') {
        cy.wrap(
          stakingBridgeContract.remove_stake(stake_amount, vegaWalletPubKey),
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
  cy.wrap(vestingContract.stake_balance(ethWalletPubKey, vegaWalletPubKey), {
    timeout: transactionTimeout,
    log: false,
  }).then((vesting_amount) => {
    if (String(vesting_amount) != '0') {
      cy.wrap(vestingContract.remove_stake(vesting_amount, vegaWalletPubKey), {
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
