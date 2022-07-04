import wallet from '../locators/wallet.locators';
import staking from '../locators/staking.locators';
import {
  StakingBridge,
  Token,
  TokenVesting,
} from '@vegaprotocol/smart-contracts';
import { ethers, Wallet } from 'ethers';
import envVars from '../fixtures/envVars.json';

// ----------------------------------------------------------------------

const vegaWalletName = envVars.vegaWalletName;
const vegaWalletLocation = envVars.vegaWalletLocation;
const vegaWalletPassphrase = envVars.vegaWalletPassphrase;
const vegaWalletMnemonic = envVars.vegaWalletMnemonic;
const vegaWalletPubKey = envVars.vegaWalletPublicKey;
const vegaTokenContractAddress = envVars.vegaTokenContractAddress;
const vegaTokenAddress = envVars.vegaTokenAddress;
const ethWalletPubKey = envVars.ethWalletPublicKey;
const ethStakingBridgeContractAddress = envVars.ethStakingBridgeContractAddress;
const ethProviderUrl = envVars.ethProviderUrl;
const getAccount = (number = 0) => `m/44'/60'/0'/0/${number}`;

// ----------------------------------------------------------------------

Cypress.Commands.add('vega_wallet_teardown', function () {
  cy.wrap(
    Wallet.fromMnemonic(vegaWalletMnemonic, getAccount(0)).privateKey, {log: false}
  ).then((privateKey) => {
    cy.vega_wallet_teardown_staking(privateKey);
    cy.vega_wallet_teardown_vesting(privateKey);
    cy.vega_wallet_check_associated_value_is('0.000000000000000000');
  });
});

// ----------------------------------------------------------------------

Cypress.Commands.add('vega_wallet_teardown_staking', function (privateKey) {
  cy.log('👉 **_Tearing down staking tokens from vega wallet if present_**');
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
            });
          }
        });
      });
    });
  });
});

// ----------------------------------------------------------------------

Cypress.Commands.add('vega_wallet_teardown_vesting', function (privateKey) {
  cy.log('👉 **_Tearing down vesting tokens from vega wallet if present_**');
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
});

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'vega_wallet_set_specified_approval_amount_and_reload',
  function (resetAmount) {
    cy.log(`👉 **_Setting token approval amount to ${resetAmount}_**`);
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
    cy.log('👉 **_Reloading app for token approval setting to take affect_**');
    cy.reload();
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add('vega_wallet_import', function () {
  cy.log(`👉 **_Importing Vega Wallet ${vegaWalletName}_**`);
  cy.exec(`vegawallet init -f --home ${vegaWalletLocation}`);
  cy.exec(
    `vegawallet import -w ${vegaWalletName} --recovery-phrase-file ./src/fixtures/wallet/recovery -p ./src/fixtures/wallet/passphrase --home ~/.vegacapsule/testnet/wallet`,
    { failOnNonZeroExit: false }
  );
  cy.exec(
    `vegawallet service run --network DV --automatic-consent  --home ${vegaWalletLocation}`
  );
});

// ----------------------------------------------------------------------

Cypress.Commands.add('vega_wallet_connect', function () {
  cy.log('👉 **_Connecting Vega Wallet_**');
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
});

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'vega_wallet_check_validator_stake_next_epoch_value_is',
  function (validatorName, expectedVal) {
    cy.log(
      `**_Checking vega wallet - Stake Next Epoch Value for ${validatorName} is ${expectedVal}_**`
    );
    cy.get(wallet.vegawallet).within(() => {
      cy.contains(`${validatorName} (Next epoch)`, { timeout: 40000 })
        .siblings()
        .contains(expectedVal, { timeout: 40000 })
        .should('be.visible');
    });
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'vega_wallet_check_validator_stake_this_epoch_value_is',
  function (validatorName, expectedVal) {
    cy.log(
      `**_Checking vega wallet - Stake This Epoch Value for ${validatorName} is ${expectedVal}_**`
    );
    cy.get(wallet.vegawallet).within(() => {
      cy.contains(`${validatorName} (This Epoch)`, { timeout: 40000 })
        .siblings()
        .contains(expectedVal, { timeout: 40000 })
        .should('be.visible');
    });
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'vega_wallet_check_validator_staked_value_is',
  function (validatorName, expectedVal) {
    cy.log(
      `**_Checking Validator Stake Value for ${validatorName} is ${expectedVal}_**`
    );
    cy.get(wallet.vegawallet).within(() => {
      cy.contains(`${validatorName}`, { timeout: 40000 })
        .siblings()
        .contains(expectedVal, { timeout: 40000 })
        .should('be.visible');
    });
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'vega_wallet_check_unstaked_value_is',
  function (expectedVal) {
    cy.log(`👉 **_Checking vega wallet - Unstaked Value is ${expectedVal}_**`);
    cy.get(wallet.vegawallet).within(() => {
      cy.contains('Unstaked', { timeout: 40000 })
        .siblings()
        .contains(expectedVal, { timeout: 40000 })
        .should('be.visible');
    });
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'vega_wallet_check_associated_value_is',
  function (expectedVal) {
    cy.log(`👉 **_Checking vega wallet - Associated Value is ${expectedVal}_**`);
    cy.get(wallet.vegawallet).within(() => {
      cy.contains('Associated', { timeout: 40000 })
        .parent()
        .siblings()
        .contains(expectedVal, { timeout: 40000 })
        .should('be.visible');
    });
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add('ethereum_wallet_connect', function () {
  cy.log('👉 **_Connecting Eth Wallet_**');
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
});

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'ethereum_wallet_associate_tokens',
  function (amount, approve) {
    cy.log(`👉 **_Associating ${amount} tokens via Eth Wallet_**`);
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
    }).should('be.visible');
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add('ethereum_wallet_disassociate_tokens', function (amount) {
  cy.log(`👉 **_Disassociating ${amount} tokens via Eth Wallet_**`);
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
  }).should('be.visible');
});

// ----------------------------------------------------------------------

Cypress.Commands.add('ethereum_wallet_disassociate_all_tokens', function () {
  cy.log('👉 **_Disassociating all tokens via Eth Wallet_**');
  cy.get(wallet.ethWallet).within(() =>
    cy.get(wallet.ethWalletDisassociate).click()
  );
  cy.get(staking.stakeAssociateWalletRadio, { timeout: 20000 }).click();
  cy.get(staking.stakeMaximumTokens, { timeout: 60000 }).click();
  cy.get(staking.tokenInputSubmit, { timeout: 10000 }).click();
  cy.contains('$VEGA tokens have been returned to Ethereum wallet', {
    timeout: 60000,
  }).should('be.visible');
});

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'ethereum_wallet_check_associated_vega_key_value_is',
  function (vegaShortPublicKey, expectedVal) {
    cy.log(
      `**_Checking Eth Wallet - Vega Key Associated Value is ${expectedVal} for key ${vegaShortPublicKey}_**`
    );
    cy.get(wallet.ethWallet).within(() => {
      cy.contains(vegaShortPublicKey, { timeout: 20000 })
        .parent()
        .contains(expectedVal, { timeout: 40000 })
        .should('be.visible');
    });
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'ethereum_wallet_check_associated_vega_key_is_no_longer_showing',
  function (vegaShortPublicKey) {
    cy.log(`👉 **_Checking Eth Wallet - Vega Key Associated is not showing_**`);
    cy.get(wallet.ethWallet).within(() => {
      cy.contains(vegaShortPublicKey, { timeout: 20000 }).should('not.exist');
    });
  }
);
