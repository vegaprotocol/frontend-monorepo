import wallet from '../locators/wallet.locators';
import staking from '../locators/staking.locators';
import {
  StakingBridge,
  Token,
  TokenVesting,
} from '@vegaprotocol/smart-contracts';
import { ethers, Wallet } from 'ethers';

// ----------------------------------------------------------------------
const vegaWalletName = Cypress.env('VEGA_WALLET_NAME');
const vegaWalletLocation = Cypress.env('VEGA_WALLET_LOCATION');
const vegaWalletPassphrase = Cypress.env('VEGA_WALLET_PASSPHRASE');

const ethPubKey = '0xEe7D375bcB50C26d52E1A4a472D8822A2A22d94F';
const ethProviderUrl = 'http://localhost:8545/';
const ethStakingBridgeContractAddress =
  '0x9135f5afd6F055e731bca2348429482eE614CFfA';
const ethWalletMnemonic =
  'ozone access unlock valid olympic save include omit supply green clown session';
const vegaPubKey =
  'fc8661e5550f277dfae5ca2bb38a7524072f84ea56198edab35f81a733031b06';
const vegaTokenContractAddress = '0xF41bD86d462D36b997C0bbb4D97a0a3382f205B7';
const vegaTokenAddress = '0x67175Da1D5e966e40D11c4B2519392B2058373de';
const queryUrl = 'http://localhost:3028/query';
const getAccount = (number = 0) => `m/44'/60'/0'/0/${number}`;

// ----------------------------------------------------------------------

Cypress.Commands.add('vega_wallet_teardown', function () {
  cy.wrap(
    Wallet.fromMnemonic(ethWalletMnemonic, getAccount(0)).privateKey
  ).then((privateKey) => {
    cy.vega_wallet_teardown_staking(privateKey);
    cy.vega_wallet_teardown_vesting(privateKey);
  });
  cy.intercept('POST', queryUrl).as('queryGrab');
  // Wait for a couple of queries to complete so wallet UI takes changes on board
  cy.wait(['@queryGrab', '@queryGrab'], { timeout: 10000 });
  // Then we turn off our intercept - so that we can use it again in the future
  cy.intercept('POST', queryUrl, (req) => req.continue());
  cy.log('**Connecting Vega Wallet = COMPLETE**');
});

// ----------------------------------------------------------------------

Cypress.Commands.add('vega_wallet_teardown_staking', function (privateKey) {
  cy.log('**Tearing down staking tokens if required**');
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
        cy.wrap(stakingBridge.stakeBalance(ethPubKey, vegaPubKey), {
          timeout: 40000,
          log: false,
        }).then((stake_amount) => {
          if (String(stake_amount) != '0') {
            cy.wrap(stakingBridge.removeStake(stake_amount, vegaPubKey), {
              timeout: 40000,
              log: false,
            }).then((tx) => {
              cy.wrap(tx.wait(1), { timeout: 40000, log: false });
              cy.vega_wallet_check_associatedValue_is('0.000000000000000000');
            });
          }
        });
      });
    });
  });
  cy.log('**Tearing down staking tokens = COMPLETE**');
});

// ----------------------------------------------------------------------

Cypress.Commands.add('vega_wallet_teardown_vesting', function (privateKey) {
  cy.log('**Tearing down vesting tokens if required**');
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
        cy.wrap(vesting.stakeBalance(ethPubKey, vegaPubKey), {
          timeout: 40000,
          log: false,
        }).then((vesting_amount) => {
          if (String(vesting_amount) != '0') {
            cy.wrap(vesting.removeStake(vesting_amount, vegaPubKey), {
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
  cy.log('**Tearing down vesting tokens = COMPLETE**');
});

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'vega_wallet_set_approval_amount_to',
  function (resetAmount) {
    cy.log(`**Setting token approval amount to ${resetAmount}**`);
    cy.wrap(Wallet.fromMnemonic(ethWalletMnemonic, getAccount(0)).privateKey, {
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
    cy.intercept('POST', queryUrl).as('queryGrab');
    // Wait for a couple of queries to complete so wallet UI takes changes on board
    cy.wait(['@queryGrab', '@queryGrab'], { timeout: 10000 });
    // Then we turn off our intercept - so that we can use it again in the future
    cy.intercept('POST', queryUrl, (req) => req.continue());
    cy.log(`**Setting token approval amount to ${resetAmount} = COMPLETE**`);
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add('vega_wallet_teardown_ui', function () {
  cy.log('**Tearing down associated tokens from Vega Wallet**');
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
        cy.root().ethereum_wallet_disassociateAllTokens();
        cy.vega_wallet_check_associatedValue_is('0.0');
      } else {
        cy.log('**No need to teardown vega wallet - wallet empty**');
      }
    });
  cy.log('**Tearing down associated tokens from Vega Wallet = COMPLETE**');
});

// ----------------------------------------------------------------------

Cypress.Commands.add('vega_wallet_create', function () {
  cy.log('**Initializing Vega Wallet** ' + vegaWalletName);
  cy.exec(`vegawallet init -f --home ${vegaWalletLocation}`);
  cy.exec(
    `echo ${vegaWalletPassphrase} > ./src/fixtures/vegaWalletPassphrase.txt`
  );
  cy.exec(
    `vegawallet create -w ${vegaWalletName} -p ./src/fixtures//vegaWalletPassphrase.txt --home ${vegaWalletLocation}`,
    { failOnNonZeroExit: false }
  ).then((result) => cy.log(result.stderr));
  cy.exec(
    `vegawallet service run --network DV --automatic-consent  --home ${vegaWalletLocation}`
  );

  cy.log('**Initializing Vega Wallet = COMPLETE**');
});

// ----------------------------------------------------------------------

Cypress.Commands.add('vega_wallet_connect', function () {
  cy.log('**Connecting Vega Wallet**');
  cy.intercept('POST', queryUrl).as('queryGrab');
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
  // We have to wait for two queries to finish
  cy.wait('@queryGrab', { timeout: 10000 }).wait('@queryGrab', {
    timeout: 10000,
  });
  // Then we turn off our intercept - so that we can use it again in the future
  cy.intercept('POST', queryUrl, (req) => req.continue());
  cy.log('**Connecting Vega Wallet = COMPLETE**');
});

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'vega_wallet_check_validator_stakeNextEpochValue_is',
  function (validatorName, expectedVal) {
    cy.log(
      `**Checking Stake Next Epoch Value for ${validatorName} is ${expectedVal}**`
    );
    cy.get(wallet.vegawallet).within(() => {
      cy.contains(`${validatorName} (Next epoch)`)
        .siblings()
        .contains(expectedVal, { timeout: 10000 });
    });
    cy.log('**Checking Stake Next Epoch Value = Complete**');
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'vega_wallet_check_unstakedValue_is',
  function (expectedVal) {
    cy.log(`**Checking Vega Wallet Unstaked Value is ${expectedVal}**`);
    cy.get(wallet.vegawallet).within(() => {
      cy.contains('Unstaked', { timeout: 20000 })
        .siblings()
        .contains(expectedVal, { timeout: 10000 });
    });
    cy.log('**Checking Vega Wallet Unstaked Value = Complete**');
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'vega_wallet_check_associatedValue_is',
  function (expectedVal) {
    cy.log(`**Checking Vega Wallet Asscoiated Value is ${expectedVal}**`);
    cy.get(wallet.vegawallet).within(() => {
      cy.contains('Associated', { timeout: 20000 })
        .parent()
        .siblings()
        .contains(expectedVal, { timeout: 40000 });
    });
    cy.log('**Checking Vega Wallet Asscoiated Value = COMPLETE**');
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add('ethereum_wallet_connect', function () {
  cy.log('**Connecting Eth Wallet**');
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
  cy.log('**Connecting Eth Wallet = COMPLETE**');
});

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'ethereum_wallet_associateTokens',
  function (amount, approve) {
    cy.log(`**Associating ${amount} tokens from Eth Wallet**`);
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
    cy.log('**Associating tokens from Eth Wallet = COMPLETE**');
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add('ethereum_wallet_disassociateTokens', function (amount) {
  cy.log(`**Disassociating ${amount} tokens from Eth Wallet**`);
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
  cy.log('**Disassociating tokens from Eth Wallet = COMPLETE**');
});

// ----------------------------------------------------------------------

Cypress.Commands.add('ethereum_wallet_disassociateAllTokens', function () {
  cy.log('**Disassociating tokens from Eth Wallet**');
  cy.get(wallet.ethWallet).within(() =>
    cy.get(wallet.ethWalletDisassociate).click()
  );
  cy.get(staking.stakeAssociateWalletRadio, { timeout: 20000 }).click();
  cy.get(staking.stakeMaximumTokens, { timeout: 60000 }).click();
  cy.get(staking.tokenInputSubmit, { timeout: 10000 }).click();
  cy.contains('$VEGA tokens have been returned to Ethereum wallet', {
    timeout: 60000,
  });
  cy.log('**Disassociating tokens from Eth Wallet = Complete**');
});

// ----------------------------------------------------------------------
