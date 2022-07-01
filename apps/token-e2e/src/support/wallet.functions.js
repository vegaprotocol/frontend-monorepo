import wallet from '../locators/wallet.locators';
import staking from '../locators/staking.locators';
import {
  StakingBridge,
  Token,
  TokenVesting,
} from '@vegaprotocol/smart-contracts';
import { ethers, Wallet } from 'ethers';

// ----------------------------------------------------------------------

const vegaWalletName = Cypress.env('vega_wallet_name');
const vegaWalletLocation = Cypress.env('vega_wallet_location');
const vegaWalletPassphrase = Cypress.env('vega_wallet_passphrase');
const vegaWalletMnemonic = Cypress.env('vega_wallet_mnemonic');
const vegaWalletPubKey = Cypress.env('vega_wallet_public_key');
const vegaTokenContractAddress = Cypress.env('vega_token_contract_address');
const vegaTokenAddress = Cypress.env('vega_token_address');
const ethWalletPubKey = Cypress.env('eth_wallet_public_key')
const ethStakingBridgeContractAddress = Cypress.env('eth_staking_bridge_contract_address')
const ethProviderUrl = Cypress.env('eth_provider_url');
const getAccount = (number = 0) => `m/44'/60'/0'/0/${number}`;

// ----------------------------------------------------------------------

Cypress.Commands.add('vega_wallet_teardown', function () {
  cy.log('**_Connecting Vega Wallet_**');
  cy.wrap(
    Wallet.fromMnemonic(vegaWalletMnemonic, getAccount(0)).privateKey
  ).then((privateKey) => {
    cy.vega_wallet_teardown_staking(privateKey);
    cy.vega_wallet_teardown_vesting(privateKey);
  });
  cy.log('**_Connecting Vega Wallet = COMPLETE_**');
});

// ----------------------------------------------------------------------

Cypress.Commands.add('vega_wallet_teardown_staking', function (privateKey) {
  cy.log('**_Tearing down staking tokens if required_**');
  cy.wrap(new ethers.providers.JsonRpcProvider({ url: ethProviderUrl }), {
    log: false,
  }).as('provider');
  cy.get('@provider', { log: false }).then((provider) => {
    cy.wrap(new Wallet(privateKey, provider), { log: false }).as('signer');
    cy.get('@signer', { log: false }).then((signer) => {
      cy.wrap(new StakingBridge(ethStakingBridgeContractAddress, signer), {
        log: false,
      }).as('stakingBridge');
      cy.get('@stakingBridge', { log: false }).then((stakingBridge) => {
        cy.wrap(stakingBridge.stakeBalance(ethWalletPubKey, vegaWalletPubKey), {
          timeout: 40000,
          log: false,
        }).then((stake_amount) => {
          if (String(stake_amount) != '0') {
            cy.wrap(stakingBridge.removeStake(stake_amount, vegaWalletPubKey), {
              timeout: 40000,
              log: false,
            }).then((tx) => {
              cy.wrap(tx.wait(1), { timeout: 40000, log: false });
              cy.vega_wallet_check_associated_value_is('0.000000000000000000');
            });
          }
        });
      });
    });
  });
  cy.log('**_Tearing down staking tokens = COMPLETE_**');
});

// ----------------------------------------------------------------------

Cypress.Commands.add('vega_wallet_teardown_vesting', function (privateKey) {
  cy.log('**_Tearing down vesting tokens if required_**');
  cy.wrap(new ethers.providers.JsonRpcProvider({ url: ethProviderUrl }), {
    log: false,
  }).as('provider');
  cy.get('@provider', { log: false }).then((provider) => {
    cy.wrap(new Wallet(privateKey, provider), { log: false }).as('signer');
    cy.get('@signer', { log: false }).then((signer) => {
      cy.wrap(new TokenVesting(vegaTokenContractAddress, signer), {
        log: false,
      }).as('vesting');
      cy.get('@vesting', { log: false }).then((vesting) => {
        cy.wrap(vesting.stakeBalance(ethWalletPubKey, vegaWalletPubKey), {
          timeout: 40000,
          log: false,
        }).then((vesting_amount) => {
          if (String(vesting_amount) != '0') {
            cy.wrap(vesting.removeStake(vesting_amount, vegaWalletPubKey), {
              timeout: 40000,
              log: false,
            }).then((tx) => {
              cy.wrap(tx.wait(1), { timeout: 40000, log: false });
            });
          }
        });
      });
    });
  });
  cy.log('**_Tearing down vesting tokens = COMPLETE_**');
});

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'vega_wallet_set_specified_approval_amount_and_reload',
  function (resetAmount) {
    cy.log(`**_Setting token approval amount to ${resetAmount}_**`);
    cy.wrap(Wallet.fromMnemonic(vegaWalletMnemonic, getAccount(0)).privateKey, {
      log: false,
    }).then((privateKey) => {
      cy.wrap(new ethers.providers.JsonRpcProvider({ url: ethProviderUrl }), {
        log: false,
      }).as('provider');
      cy.get('@provider', { log: false }).then((provider) => {
        cy.wrap(new Wallet(privateKey, provider), { log: false }).as('signer');
        cy.get('@signer', { log: false }).then((signer) => {
          cy.wrap(new Token(vegaTokenAddress, signer), { log: false }).as(
            'token'
          );
          cy.get('@token', { log: false }).then((token) => {
            cy.wrap(
              token.approve(
                ethStakingBridgeContractAddress,
                resetAmount.concat('000000000000000000')
              ),
              { timeout: 60000, log: false }
            ).then((tx) => {
              cy.wrap(tx.wait(1), { timeout: 40000, log: false });
            });
          });
        });
      });
    });
    cy.log(`**_Setting token approval amount to ${resetAmount} = COMPLETE_**`);
    cy.log('**_Reloading app for token approval setting to take affect_**')
    cy.reload();
    cy.log('**_Reloading app for token approval setting to take affect = COMPLETE_**')
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add('vega_wallet_teardown_ui', function () {
  cy.log('**_Tearing down associated tokens from Vega Wallet_**');
  let vegaPresentInWallet = false;
  cy.get(wallet.vegawallet)
    .within(() => {
      cy.contains('Associated', { timeout: 20000 })
        .parent()
        .siblings()
        .within(($associated) => {
          if ($associated.text() != '0.000000000000000000')
            vegaPresentInWallet = true;
        });
    })
    .then(() => {
      if (vegaPresentInWallet == true) {
        cy.root().ethereum_wallet_disassociate_all_tokens();
        cy.vega_wallet_check_associated_value_is('0.0');
      } else {
        cy.log('**_No need to teardown vega wallet - wallet empty_**');
      }
    });
  cy.log('**_Tearing down associated tokens from Vega Wallet = COMPLETE_**');
});

// ----------------------------------------------------------------------

Cypress.Commands.add('vega_wallet_import', function () {
  cy.log(`**_Importing Vega Wallet ${vegaWalletName}_**`);
  cy.exec(`vegawallet init -f --home ${vegaWalletLocation}`);
  cy.exec(
    `vegawallet import -w ${vegaWalletName} --recovery-phrase-file ./src/fixtures/wallet/recovery -p ./src/fixtures/wallet/passphrase --home ~/.vegacapsule/testnet/wallet`,
    { failOnNonZeroExit: false }
  )
  cy.exec(
    `vegawallet service run --network DV --automatic-consent  --home ${vegaWalletLocation}`
  );

  cy.log('**_Importing Vega Wallet = COMPLETE_**');
});

// ----------------------------------------------------------------------

Cypress.Commands.add('vega_wallet_connect', function () {
  cy.log('**_Connecting Vega Wallet_**');
  // cy.intercept('POST', queryUrl).as('queryGrab');
  cy.get(wallet.vegawallet).within(() => {
    cy.get('button')
      .contains('Connect Vega wallet to use associated $VEGA')
      .should('be.enabled')
      .and('be.visible')
      .click({ force: true });
  });

  cy.get('button').contains('rest provider').click();

  cy.get(wallet.connectRestForm).within(() => {
    cy.get(wallet.name).click().type(vegaWalletName);
    cy.get(wallet.passphrase).click().type(vegaWalletPassphrase);
    cy.get('button').contains('Connect').click();
  });

  cy.contains(`${vegaWalletName} key`, { timeout: 20000 }).should('be.visible');
  cy.log('**_Connecting Vega Wallet = COMPLETE_**');
});

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'vega_wallet_check_validator_stake_next_epoch_value_is',
  function (validatorName, expectedVal) {
    cy.log(
      `**_Checking Stake Next Epoch Value for ${validatorName} is ${expectedVal}_**`
    );
    cy.get(wallet.vegawallet).within(() => {
      cy.contains(`${validatorName} (Next epoch)`, { timeout: 40000 })
        .siblings()
        .contains(expectedVal, { timeout: 40000 });
    });
    cy.log('**_Checking Stake Next Epoch Value = Complete_**');
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'vega_wallet_check_unstaked_value_is',
  function (expectedVal) {
    cy.log(`**_Checking Vega Wallet Unstaked Value is ${expectedVal}_**`);
    cy.get(wallet.vegawallet).within(() => {
      cy.contains('Unstaked', { timeout: 40000 })
        .siblings()
        .contains(expectedVal, { timeout: 40000 });
    });
    cy.log('**_Checking Vega Wallet Unstaked Value = Complete_**');
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'vega_wallet_check_associated_value_is',
  function (expectedVal) {
    cy.log(`**_Checking Vega Wallet Associated Value is ${expectedVal}_**`);
    cy.get(wallet.vegawallet).within(() => {
      cy.contains('Associated', { timeout: 40000 })
        .parent()
        .siblings()
        .contains(expectedVal, { timeout: 40000 });
    });
    cy.log('**_Checking Vega Wallet Associated Value = COMPLETE_**');
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add('ethereum_wallet_connect', function () {
  cy.log('**_Connecting Eth Wallet_**');
  cy.get(wallet.ethWalletConnectToEth).within(() => {
    cy.contains('Connect Ethereum wallet to associate $VEGA')
      .should('be.visible')
      .click();
  });
  cy.get(wallet.ethWalletConnect).click();
  cy.get(wallet.ethWalletConnect, { timeout: 60000 }).should('not.exist');
  cy.get(wallet.ethWallet).within(() => {
    // this check is required since it ensures the wallet is fully (not partially) loaded
    cy.contains('Locked', { timeout: 10000 }).should('be.visible');
  });
  cy.log('**_Connecting Eth Wallet = COMPLETE_**');
});

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'ethereum_wallet_associate_tokens',
  function (amount, approve) {
    cy.log(`**_Associating ${amount} tokens from Eth Wallet_**`);
    cy.get(wallet.ethWallet).within(() =>
      cy.get(wallet.ethWalletAssociate).click()
    );
    cy.get(staking.stakeAssociateWalletRadio, { timeout: 30000 }).click();
    cy.get(staking.tokenAmountInput, { timeout: 10000 }).type(amount);

    if (approve !== undefined && approve.toLowerCase() == 'approve') {
      cy.get(staking.tokenInputApprove, { timeout: 40000 })
        .should('be.enabled')
        .click();
      cy.contains('Approve $VEGA Tokens for staking on Vega').should(
        'be.visible'
      );
      cy.contains('Approve $VEGA Tokens for staking on Vega', {
        timeout: 40000,
      }).should('not.exist');
    }

    cy.get(staking.tokenInputSubmit, { timeout: 40000 })
      .should('be.enabled')
      .click();
    cy.contains('can now participate in governance and nominate a validator', {
      timeout: 60000,
    });
    cy.log('**_Associating tokens from Eth Wallet = COMPLETE_**');
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add('ethereum_wallet_disassociate_tokens', function (amount) {
  cy.log(`**_Disassociating ${amount} tokens from Eth Wallet_**`);
  cy.get(wallet.ethWallet).within(() =>
    cy.get(wallet.ethWalletDisassociate).click()
  );
  cy.get(staking.stakeAssociateWalletRadio, { timeout: 30000 }).click();
  cy.get(staking.tokenAmountInput, { timeout: 10000 }).type(amount);

  cy.get(staking.tokenInputSubmit, { timeout: 40000 })
    .should('be.enabled')
    .click();
  cy.contains(`${amount} $VEGA tokens have been returned to Ethereum wallet`, {
    timeout: 60000,
  });
  cy.log('**_Disassociating tokens from Eth Wallet = COMPLETE_**');
});

// ----------------------------------------------------------------------

Cypress.Commands.add('ethereum_wallet_disassociate_all_tokens', function () {
  cy.log('**_Disassociating tokens from Eth Wallet_**');
  cy.get(wallet.ethWallet).within(() =>
    cy.get(wallet.ethWalletDisassociate).click()
  );
  cy.get(staking.stakeAssociateWalletRadio, { timeout: 20000 }).click();
  cy.get(staking.stakeMaximumTokens, { timeout: 60000 }).click();
  cy.get(staking.tokenInputSubmit, { timeout: 10000 }).click();
  cy.contains('$VEGA tokens have been returned to Ethereum wallet', {
    timeout: 60000,
  });
  cy.log('**_Disassociating tokens from Eth Wallet = Complete_**');
});

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'ethereum_wallet_check_associated_vega_key_value_is',
  function (vegaShortPublicKey, expectedVal) {
    cy.log(`**_Checking Eth Wallet Vega Key Associated Value is ${expectedVal} for key ${vegaShortPublicKey}_**`);
    cy.get(wallet.ethWallet).within(() => {
      cy.contains(vegaShortPublicKey, { timeout: 20000 })
        .parent()
        .contains(expectedVal, { timeout: 40000 });
    });
    cy.log('**_Checking Eth Wallet Vega Key Associated Value = COMPLETE_**');
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'ethereum_wallet_check_associated_vega_key_is_no_longer_showing',
  function (vegaShortPublicKey) {
    cy.log(`**_Checking Eth Wallet Vega Key Associated is not showing_**`);
    cy.get(wallet.ethWallet).within(() => {
      cy.contains(vegaShortPublicKey, { timeout: 20000 })
        .should('not.exist')
    });
    cy.log('**_Checking Eth Wallet Vega Key Associated is not showing = COMPLETE_**');
  }
);